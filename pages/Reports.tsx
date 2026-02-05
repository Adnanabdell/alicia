import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../services/db';
import { AttendanceRecord } from '../types';
import { BarChart3, Calendar, Check, X, Search } from 'lucide-react';

export const Reports = () => {
  const { students, subjects, t } = useApp();
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const allAttendance = await db.getAttendance(selectedSubjectId || undefined);
      setAttendanceData(allAttendance);
    };
    fetchData();
  }, [selectedSubjectId]);

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to check if a record falls in the selected month/year
  const isInSelectedMonth = (dateString: string) => {
    const d = new Date(dateString);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  };

  const getStats = (studentId: string) => {
    const records = attendanceData.filter(r => 
      r.studentId === studentId && 
      isInSelectedMonth(r.date) && 
      (!selectedSubjectId || r.subjectId === selectedSubjectId)
    );

    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    
    return { present, absent, total: present + absent };
  };

  const filteredStudents = selectedSubjectId 
    ? students.filter(s => s.subscriptions.some(sub => sub.subjectId === selectedSubjectId))
    : students;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="text-blue-600" /> {t.reports}
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.selectSubject}</label>
          <select 
            className="w-full md:w-1/3 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
          >
            <option value="">{t.selectSubject}</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.teacherName})</option>
            ))}
          </select>
        </div>

        {selectedSubjectId ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500">{t.name}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-500">{t.present}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-500">{t.absent}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-500">{t.totalSessions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map(student => {
                  const stats = getStats(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-xs text-gray-400">{student.phone}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check size={12} className="mr-1" /> {stats.present}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <X size={12} className="mr-1" /> {stats.absent}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-bold text-gray-700">
                        {stats.total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="text-center py-10 text-gray-400">{t.noData}</div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Calendar className="mx-auto text-gray-300 w-12 h-12 mb-2" />
            <p className="text-gray-500">{t.selectSubject} to view reports</p>
          </div>
        )}
      </div>
    </div>
  );
};