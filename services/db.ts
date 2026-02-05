import { Student, Subject, AttendanceRecord, Payment, User } from '../types';
import { INITIAL_STUDENTS, INITIAL_SUBJECTS, INITIAL_USERS } from '../constants';

const KEYS = {
  STUDENTS: 'am_students',
  SUBJECTS: 'am_subjects',
  USERS: 'am_users',
  ATTENDANCE: 'am_attendance',
  PAYMENTS: 'am_payments'
};

class LocalDB {
  private get<T>(key: string, initial: T): T {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  private set(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- USERS (Teachers & Admins) ---
  async getUsers(): Promise<User[]> {
    return this.get<User[]>(KEYS.USERS, INITIAL_USERS);
  }

  async addUser(user: User): Promise<User> {
    const users = await this.getUsers();
    const newUser = { ...user, uid: Math.random().toString(36).substr(2, 9) };
    users.push(newUser);
    this.set(KEYS.USERS, users);
    return newUser;
  }

  async deleteUser(uid: string): Promise<void> {
    let users = await this.getUsers();
    users = users.filter(u => u.uid !== uid);
    this.set(KEYS.USERS, users);
  }

  // --- STUDENTS ---
  async getStudents(): Promise<Student[]> {
    return this.get<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
  }

  async addStudent(student: Omit<Student, 'id'>): Promise<Student> {
    const students = await this.getStudents();
    const newStudent = { ...student, id: Math.random().toString(36).substr(2, 9) };
    students.push(newStudent);
    this.set(KEYS.STUDENTS, students);
    return newStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    let students = await this.getStudents();
    students = students.filter(s => s.id !== id);
    this.set(KEYS.STUDENTS, students);
  }

  // --- SUBJECTS ---
  async getSubjects(): Promise<Subject[]> {
    return this.get<Subject[]>(KEYS.SUBJECTS, INITIAL_SUBJECTS);
  }

  async addSubject(subject: Omit<Subject, 'id'>): Promise<Subject> {
    const subjects = await this.getSubjects();
    const newSub = { ...subject, id: Math.random().toString(36).substr(2, 9) };
    subjects.push(newSub);
    this.set(KEYS.SUBJECTS, subjects);
    return newSub;
  }

  async deleteSubject(id: string): Promise<void> {
    let subjects = await this.getSubjects();
    subjects = subjects.filter(s => s.id !== id);
    this.set(KEYS.SUBJECTS, subjects);
  }

  // --- ATTENDANCE ---
  async recordAttendance(record: Omit<AttendanceRecord, 'id' | 'timestamp'>): Promise<AttendanceRecord> {
    const attendance = this.get<AttendanceRecord[]>(KEYS.ATTENDANCE, []);
    const newRecord = { ...record, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() };
    attendance.push(newRecord);
    this.set(KEYS.ATTENDANCE, attendance);

    // Logic: If status is 'present' or 'absent', we deduct a session. 
    // Usually absence still counts as a session used in many schools, or maybe not. 
    // Assuming BOTH consume a session from the package (8 sessions/month).
    
    const students = await this.getStudents();
    const studentIndex = students.findIndex(s => s.id === record.studentId);
    if (studentIndex > -1) {
       const subIndex = students[studentIndex].subscriptions.findIndex(sub => sub.subjectId === record.subjectId);
       if (subIndex > -1) {
         students[studentIndex].subscriptions[subIndex].sessionsRemaining = Math.max(0, students[studentIndex].subscriptions[subIndex].sessionsRemaining - 1);
         this.set(KEYS.STUDENTS, students);
       }
    }
    return newRecord;
  }

  async getAttendance(subjectId?: string): Promise<AttendanceRecord[]> {
    const all = this.get<AttendanceRecord[]>(KEYS.ATTENDANCE, []);
    if (subjectId) {
      return all.filter(a => a.subjectId === subjectId);
    }
    return all;
  }

  // --- PAYMENTS ---
  async processPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
    const payments = this.get<Payment[]>(KEYS.PAYMENTS, []);
    const newPayment = { ...payment, id: Math.random().toString(36).substr(2, 9) };
    payments.push(newPayment);
    this.set(KEYS.PAYMENTS, payments);

    // Update Subscription Logic -> RESET TO 8 SESSIONS
    const students = await this.getStudents();
    const studentIndex = students.findIndex(s => s.id === payment.studentId);
    
    if (studentIndex > -1) {
      const student = students[studentIndex];
      const subIndex = student.subscriptions.findIndex(sub => sub.subjectId === payment.subjectId);
      
      const today = new Date();
      const nextMonth = new Date(today.setMonth(today.getMonth() + 1)).toISOString();

      if (subIndex > -1) {
        // Renew existing
        student.subscriptions[subIndex].sessionsRemaining = 8; // Reset to 8
        student.subscriptions[subIndex].validUntil = nextMonth;
      } else {
        // New Subscription
        student.subscriptions.push({
          subjectId: payment.subjectId,
          sessionsRemaining: 8, // Start with 8
          validUntil: nextMonth
        });
      }
      this.set(KEYS.STUDENTS, students);
    }

    return newPayment;
  }
}

export const db = new LocalDB();