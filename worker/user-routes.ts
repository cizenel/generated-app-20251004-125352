import { Hono } from "hono";
import { bearerAuth } from 'hono/bearer-auth';
import type { Env } from './core-utils';
import { UserEntity, SponsorEntity, CenterEntity, InvestigatorEntity, ProjectCodeEntity, WorkDoneEntity, SdcEntity, DocumentEntity } from "./entities";
import { ok, bad, notFound, isStr, Index } from './core-utils';
import { MOCK_USERS } from "@shared/mock-data";
import type { User, AuthUser, LoginPayload, DefinitionType, Definition, SdcRecord, Document, UserRole } from "@shared/types";
import { Context } from "hono";
const simpleHash = async (password: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-265', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
const verifyPassword = async (password: string, hash: string) => {
  const passwordHash = await simpleHash(password);
  return passwordHash === hash;
};
const definitionEntities = {
  Sponsor: SponsorEntity,
  Center: CenterEntity,
  Investigator: InvestigatorEntity,
  ProjectCode: ProjectCodeEntity,
  WorkDone: WorkDoneEntity,
};
const getDefinitionEntity = (type: string) => {
  return definitionEntities[type as DefinitionType];
};
type AuthInfo = { id: string; role: UserRole };
const authMiddleware = async (c: Context, next: () => Promise<void>) => {
  const userInfoHeader = c.req.header('X-User-Info');
  if (userInfoHeader) {
    try {
      const userInfo = JSON.parse(userInfoHeader) as AuthInfo;
      c.set('user', userInfo);
    } catch (e) {
      // Invalid header, proceed without auth info
    }
  }
  await next();
};
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.use('/api/*', authMiddleware);
  const ensureSeedData = async (env: Env) => {
    const userIdx = new Index<string>(env, UserEntity.indexName);
    const existingUsers = await userIdx.list();
    if (existingUsers.length === 0) {
      for (const userData of MOCK_USERS) {
        const passwordHash = await simpleHash(userData.password!);
        const user: User = {
          id: crypto.randomUUID(),
          username: userData.username,
          role: userData.role,
          isActive: userData.isActive,
          passwordHash: passwordHash,
        };
        await UserEntity.create(env, user);
      }
    }
    for (const Entity of Object.values(definitionEntities)) {
      await Entity.ensureSeed(env);
    }
    await DocumentEntity.ensureSeed(env);
  };
  app.post('/api/auth/login', async (c) => {
    await ensureSeedData(c.env);
    const { username, password } = await c.req.json<LoginPayload>();
    if (!isStr(username) || !isStr(password)) {
      return bad(c, 'Kullanıcı adı ve şifre gereklidir.');
    }
    const allUsers = await UserEntity.list(c.env);
    const user = allUsers.items.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user || !user.passwordHash) {
      return notFound(c, 'Kullanıcı adı veya şifre yanlış.');
    }
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return bad(c, 'Kullanıcı adı veya şifre yanlış.');
    }
    if (!user.isActive) {
      return bad(c, 'Bu kullanıcı aktif değil. Lütfen yönetici ile iletişime geçin.');
    }
    const { passwordHash, ...authUser } = user;
    return ok(c, { user: authUser as AuthUser });
  });
  app.get('/api/stats', async (c) => {
    const users = await new Index(c.env, UserEntity.indexName).list();
    const sdcRecords = await new Index(c.env, SdcEntity.indexName).list();
    const definitionCounts = await Promise.all(
      Object.values(definitionEntities).map(entity => new Index(c.env, entity.indexName).list())
    );
    const totalDefinitions = definitionCounts.reduce((sum, current) => sum + current.length, 0);
    return ok(c, {
      totalUsers: users.length,
      sdcRecords: sdcRecords.length,
      definitionItems: totalDefinitions,
    });
  });
  app.put('/api/users/me/password', async (c) => {
    const { currentPassword, newPassword, userId } = await c.req.json<{ currentPassword?: string, newPassword?: string, userId?: string }>();
    if (!isStr(currentPassword) || !isStr(newPassword) || !isStr(userId)) {
      return bad(c, 'Gerekli alanlar eksik.');
    }
    const userEntity = new UserEntity(c.env, userId);
    if (!(await userEntity.exists())) {
      return notFound(c, 'Kullanıcı bulunamadı.');
    }
    const user = await userEntity.getState();
    const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash!);
    if (!isPasswordValid) {
      return bad(c, 'Mevcut şifre yanlış.');
    }
    const newPasswordHash = await simpleHash(newPassword);
    await userEntity.patch({ passwordHash: newPasswordHash });
    return ok(c, { success: true });
  });
  app.get('/api/users', async (c) => {
    await ensureSeedData(c.env);
    const page = await UserEntity.list(c.env);
    const users = page.items.map(u => { const { passwordHash, ...user } = u; return user; });
    return ok(c, { ...page, items: users });
  });
  app.post('/api/users', async (c) => {
    const body = await c.req.json<Partial<User>>();
    if (!isStr(body.username) || !isStr(body.password) || !body.role) {
      return bad(c, 'Username, password, and role are required');
    }
    const allUsers = await UserEntity.list(c.env);
    if (allUsers.items.some(u => u.username.toLowerCase() === body.username!.toLowerCase())) {
        return bad(c, 'Username already exists');
    }
    const passwordHash = await simpleHash(body.password);
    const newUser: User = { id: crypto.randomUUID(), username: body.username, role: body.role, isActive: body.isActive ?? true, passwordHash };
    await UserEntity.create(c.env, newUser);
    const { passwordHash: _, ...authUser } = newUser;
    return ok(c, authUser);
  });
  app.put('/api/users/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<User>>();
    const userEntity = new UserEntity(c.env, id);
    if (!(await userEntity.exists())) return notFound(c, 'User not found');
    const currentUserState = await userEntity.getState();
    if (currentUserState.username === 'MLS' && (body.isActive === false || body.role !== 'L3')) {
        return bad(c, 'Cannot change status or role of Super Admin');
    }
    const updatedState: User = { ...currentUserState };
    if (body.role) updatedState.role = body.role;
    if (body.isActive !== undefined) updatedState.isActive = body.isActive;
    if (isStr(body.password)) {
      updatedState.passwordHash = await simpleHash(body.password);
    }
    await userEntity.save(updatedState);
    const { passwordHash, ...authUser } = updatedState;
    return ok(c, authUser);
  });
  app.delete('/api/users/:id', async (c) => {
    const id = c.req.param('id');
    const userEntity = new UserEntity(c.env, id);
    if (!(await userEntity.exists())) return notFound(c, 'User not found');
    const userState = await userEntity.getState();
    if (userState.username === 'MLS') return bad(c, 'Cannot delete Super Admin');
    const deleted = await UserEntity.delete(c.env, id);
    return ok(c, { deleted });
  });
  app.get('/api/definitions/:type', async (c) => {
    const type = c.req.param('type');
    const Entity = getDefinitionEntity(type);
    if (!Entity) return notFound(c, 'Definition type not found');
    const page = await Entity.list(c.env);
    return ok(c, page);
  });
  app.post('/api/definitions/:type', async (c) => {
    const type = c.req.param('type');
    const Entity = getDefinitionEntity(type);
    if (!Entity) return notFound(c, 'Definition type not found');
    const body = await c.req.json<{ name: string }>();
    if (!isStr(body.name)) return bad(c, 'Name is required');
    const newDef: Definition = { id: crypto.randomUUID(), name: body.name };
    await Entity.create(c.env, newDef);
    return ok(c, newDef);
  });
  app.put('/api/definitions/:type/:id', async (c) => {
    const { type, id } = c.req.param();
    const Entity = getDefinitionEntity(type);
    if (!Entity) return notFound(c, 'Definition type not found');
    const body = await c.req.json<{ name: string }>();
    if (!isStr(body.name)) return bad(c, 'Name is required');
    const entity = new Entity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Definition not found');
    await entity.patch({ name: body.name });
    return ok(c, await entity.getState());
  });
  app.delete('/api/definitions/:type/:id', async (c) => {
    const { type, id } = c.req.param();
    const Entity = getDefinitionEntity(type);
    if (!Entity) return notFound(c, 'Definition type not found');
    const deleted = await Entity.delete(c.env, id);
    return ok(c, { deleted });
  });
  app.get('/api/sdc', async (c) => {
    const page = await SdcEntity.list(c.env);
    return ok(c, page);
  });
  app.post('/api/sdc', async (c) => {
    const user = c.get('user') as AuthInfo;
    if (!user) return bad(c, "Authentication required");
    const creatorEntity = new UserEntity(c.env, user.id);
    if (!(await creatorEntity.exists())) return notFound(c, "Creator user not found");
    const creator = await creatorEntity.getState();
    const body = await c.req.json<Omit<SdcRecord, 'id' | 'createdAt' | 'updatedAt'>>();
    const now = Date.now();
    const newRecord: SdcRecord = { 
      ...body, 
      id: crypto.randomUUID(), 
      creatorId: user.id,
      creatorUsername: creator.username,
      createdAt: now, 
      updatedAt: now 
    };
    await SdcEntity.create(c.env, newRecord);
    return ok(c, newRecord);
  });
  app.put('/api/sdc/:id', async (c) => {
    const user = c.get('user') as AuthInfo;
    if (!user) return bad(c, "Authentication required");
    const id = c.req.param('id');
    const body = await c.req.json<Partial<SdcRecord>>();
    const entity = new SdcEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'SDC record not found');
    const currentState = await entity.getState();
    const isOwner = currentState.creatorId === user.id;
    const isAdmin = user.role === 'L2' || user.role === 'L3';
    if (!isOwner && !isAdmin) {
      return c.json({ success: false, error: "Bu işlemi yapma yetkiniz yok." }, 403);
    }
    const updatedRecord: SdcRecord = { ...currentState, ...body, id: currentState.id, creatorId: currentState.creatorId, createdAt: currentState.createdAt, updatedAt: Date.now() };
    await entity.save(updatedRecord);
    return ok(c, updatedRecord);
  });
  app.delete('/api/sdc/:id', async (c) => {
    const user = c.get('user') as AuthInfo;
    if (!user) return bad(c, "Authentication required");
    const id = c.req.param('id');
    const entity = new SdcEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'SDC record not found');
    const record = await entity.getState();
    const isOwner = record.creatorId === user.id;
    const isAdmin = user.role === 'L2' || user.role === 'L3';
    if (!isOwner && !isAdmin) {
      return c.json({ success: false, error: "Bu işlemi yapma yetkiniz yok." }, 403);
    }
    const deleted = await SdcEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'SDC record not found');
    return ok(c, { deleted });
  });
  app.get('/api/documents', async (c) => {
    const page = await DocumentEntity.list(c.env);
    return ok(c, page);
  });
  app.post('/api/documents', async (c) => {
    const body = await c.req.json<{ name: string; category: 'Archive' | 'Training'; path: string }>();
    if (!isStr(body.name) || !isStr(body.category) || !isStr(body.path)) {
      return bad(c, 'Name, category, and path are required');
    }
    const newDoc: Document = {
      id: crypto.randomUUID(),
      name: body.name,
      category: body.category,
      path: body.path,
      createdAt: Date.now(),
    };
    await DocumentEntity.create(c.env, newDoc);
    return ok(c, newDoc);
  });
  app.delete('/api/documents/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await DocumentEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Document not found');
    return ok(c, { deleted });
  });
}