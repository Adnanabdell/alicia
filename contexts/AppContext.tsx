import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Language, Student, Subject } from '../types';
import { TRANSLATIONS } from '../constants';
import { db } from '../services/db';

interface AppContextProps {
  user: User | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
  students: Student[];
  subjects: Subject[];
  teachers: User[];
  refreshData: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);

  const t = TRANSLATIONS[language];

  const refreshData = async () => {
    try {
      console.log("[v0] Starting data refresh...");
      const st = await db.getStudents();
      const sb = await db.getSubjects();
      const us = await db.getUsers();
      console.log("[v0] Data loaded:", { students: st.length, subjects: sb.length, users: us.length });
      setStudents(st);
      setSubjects(sb);
      setTeachers(us.filter(u => u.role === 'teacher'));
    } catch (error) {
      console.error("[v0] Error loading data:", error);
    }
  };

  useEffect(() => {
    console.log("[v0] AppProvider mounted, calling refreshData");
    refreshData();
  }, []);

  useEffect(() => {
    document.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const login = async (email: string, password?: string) => {
    const users = await db.getUsers();
    // Simplified login check. In production, hash passwords!
    const foundUser = users.find(u => u.email === email && (!u.password || u.password === password)); 
    // Allow login if password matches OR if no password set (legacy/mock)
    
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AppContext.Provider value={{ user, login, logout, language, setLanguage, t, students, subjects, teachers, refreshData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
