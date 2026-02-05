export type Role = 'admin' | 'teacher';
export type Language = 'en' | 'ar' | 'fr';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: Role;
  subjectId?: string; // If teacher, which subject they teach
  password?: string; // For simulation only
}

export interface Subject {
  id: string;
  name: string;
  teacherName: string; // Simplification for display
  price: number;
}

export interface StudentSubscription {
  subjectId: string;
  validUntil: string; // ISO Date
  sessionsRemaining: number;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  parentPhone: string;
  teacherId: string; // The teacher assigned to this student
  subscriptions: StudentSubscription[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  date: string; // ISO Date
  status: 'present' | 'absent';
  session: number; // Session number 1-8
  timestamp: number;
}

export interface Payment {
  id: string;
  studentId: string;
  subjectId: string;
  amount: number;
  date: string; // ISO Date
  adminId: string;
}

export interface Notification {
  id: string;
  studentId: string;
  message: string;
  date: string;
  read: boolean;
}
