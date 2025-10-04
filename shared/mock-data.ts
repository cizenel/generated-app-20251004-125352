import type { User } from './types';



interface ChatMessage {
  id?: string | number;

  [key: string]: unknown;
}interface Chat {id?: string | number;[key: string]: unknown;}export const MOCK_USERS: Omit<User, 'id'>[] = [{ username: 'MLS', password: '2008', role: 'L3', isActive: true }, { username: 'admin1', password: 'password', role: 'L2', isActive: true }, { username: 'admin2', password: 'password', role: 'L2', isActive: false }, { username: 'user1', password: 'password', role: 'L1', isActive: true }, { username: 'user2', password: 'password', role: 'L1', isActive: true },
{ username: 'user3', password: 'password', role: 'L1', isActive: false }];


export const MOCK_CHATS: Chat[] = [
{ id: 'c1', title: 'General' }];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
{ id: 'm1', chatId: 'c1', userId: 'u1', text: 'Hello', ts: Date.now() }];