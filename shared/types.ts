export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type UserRole = 'L1' | 'L2' | 'L3';
export interface User {
  id: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  password?: string; // Only for creation/update payloads
  passwordHash?: string; // Only on backend
}
// Type for user data sent to the client (omits password)
export type AuthUser = Omit<User, 'password' | 'passwordHash'>;
export type LoginPayload = Pick<User, 'username' | 'password'>;
export interface LoginResponse {
  user: AuthUser;
}
// Definitions
export type DefinitionType = 'Sponsor' | 'Center' | 'Investigator' | 'ProjectCode' | 'WorkDone';
export interface Definition {
  id: string;
  name: string;
}
// SDC Tracking
export interface SdcWorkDone {
  id: string;
  workType: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  description?: string;
}
export interface SdcRecord {
  id: string;
  date: string; // yyyy-MM-dd
  sponsorId: string;
  centerId: string;
  investigatorId: string;
  projectCodeId: string;
  patientCode: string;
  workDone: SdcWorkDone[];
  creatorId: string;
  creatorUsername?: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}
// Documents
export interface Document {
  id: string;
  name: string;
  category: 'Archive' | 'Training';
  path: string;
  createdAt: number;
}
// These are from the old template, can be removed later if not needed.
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}