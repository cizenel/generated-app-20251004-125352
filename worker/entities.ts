/**
 * Minimal real-world demo: One Durable Object instance per entity (User, ChatBoard), with Indexes for listing.
 */
import { IndexedEntity } from "./core-utils";
import type { User, Chat, ChatMessage, Definition, SdcRecord, Document } from "@shared/types";
// USER ENTITY: one DO instance per user
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = {
    id: "",
    username: "",
    role: 'L1',
    isActive: false,
    passwordHash: ""
  };
  // Seeding is now handled in user-routes.ts to include password hashing
}
// CHAT BOARD ENTITY: one DO instance per chat board, stores its own messages
export type ChatBoardState = Chat & { messages: ChatMessage[] };
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  async listMessages(): Promise<ChatMessage[]> {
    const { messages } = await this.getState();
    return messages;
  }
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    await this.mutate(s => ({ ...s, messages: [...s.messages, msg] }));
    return msg;
  }
}
// DEFINITION ENTITIES
const initialDefinitionState: Definition = { id: "", name: "" };
export class SponsorEntity extends IndexedEntity<Definition> {
  static readonly entityName = "sponsor";
  static readonly indexName = "sponsors";
  static readonly initialState = initialDefinitionState;
  static readonly seedData = [
    { id: crypto.randomUUID(), name: "Sponsor A" },
    { id: crypto.randomUUID(), name: "Sponsor B" },
    { id: crypto.randomUUID(), name: "Sponsor C" },
  ];
}
export class CenterEntity extends IndexedEntity<Definition> {
  static readonly entityName = "center";
  static readonly indexName = "centers";
  static readonly initialState = initialDefinitionState;
  static readonly seedData = [
    { id: crypto.randomUUID(), name: "Merkez 1" },
    { id: crypto.randomUUID(), name: "Merkez 2" },
    { id: crypto.randomUUID(), name: "Merkez 3" },
  ];
}
export class InvestigatorEntity extends IndexedEntity<Definition> {
  static readonly entityName = "investigator";
  static readonly indexName = "investigators";
  static readonly initialState = initialDefinitionState;
  static readonly seedData = [
    { id: crypto.randomUUID(), name: "Dr. Ahmet Yılmaz" },
    { id: crypto.randomUUID(), name: "Dr. Ayşe Kaya" },
    { id: crypto.randomUUID(), name: "Prof. Dr. Can Demir" },
  ];
}
export class ProjectCodeEntity extends IndexedEntity<Definition> {
  static readonly entityName = "projectCode";
  static readonly indexName = "projectCodes";
  static readonly initialState = initialDefinitionState;
  static readonly seedData = [
    { id: crypto.randomUUID(), name: "PROJ-001" },
    { id: crypto.randomUUID(), name: "PROJ-002" },
    { id: crypto.randomUUID(), name: "PROJ-003" },
  ];
}
export class WorkDoneEntity extends IndexedEntity<Definition> {
  static readonly entityName = "workDone";
  static readonly indexName = "workDones";
  static readonly initialState = initialDefinitionState;
  static readonly seedData = [
    { id: crypto.randomUUID(), name: "Veri Girişi" },
    { id: crypto.randomUUID(), name: "Hasta Ziyareti" },
    { id: crypto.randomUUID(), name: "Raporlama" },
    { id: crypto.randomUUID(), name: "Analiz" },
  ];
}
// SDC ENTITY
export class SdcEntity extends IndexedEntity<SdcRecord> {
  static readonly entityName = "sdc";
  static readonly indexName = "sdcs";
  static readonly initialState: SdcRecord = {
    id: "",
    date: "",
    sponsorId: "",
    centerId: "",
    investigatorId: "",
    projectCodeId: "",
    patientCode: "",
    workDone: [],
    creatorId: "",
    creatorUsername: "",
    createdAt: 0,
    updatedAt: 0,
  };
}
// DOCUMENT ENTITY
export class DocumentEntity extends IndexedEntity<Document> {
  static readonly entityName = "document";
  static readonly indexName = "documents";
  static readonly initialState: Document = {
    id: "",
    name: "",
    category: 'Archive',
    path: "",
    createdAt: 0,
  };
  static readonly seedData = [
    { id: crypto.randomUUID(), name: "Kullanici_Kilavuzu_v1.2.pdf", category: 'Training' as const, path: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", createdAt: Date.now() - 10000 },
    { id: crypto.randomUUID(), name: "SDC_Giris_Egitimi.pdf", category: 'Training' as const, path: "https://www.africau.edu/images/default/sample.pdf", createdAt: Date.now() - 20000 },
    { id: crypto.randomUUID(), name: "Proje_Kapanis_Raporu.pdf", category: 'Archive' as const, path: "https://www.clickdimensions.com/links/TestPDFfile.pdf", createdAt: Date.now() - 30000 },
  ];
}