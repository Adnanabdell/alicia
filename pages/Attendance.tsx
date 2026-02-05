import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../services/db';
import { Check, X, AlertTriangle } from 'lucide-react';

export const Attendance = () => {
  const { subjects, students, user, t, refreshData } = useApp();
  const [selectedSubjectId, setSelectedSubjectId] = useState(user?.subjectId || '');
  const [marking, setMarking] = useState<string | null>(null);

  // If teacher, restrict to their subject. If admin, allow all.
  const availableSubjects = user?.role === 'admin' 
    ? subjects 
    : subjects.filter(s => s.id === user?.subjectId);

  const handleAttendance = async (studentId: string, status: 'present' | 'absent') => {
    if (!selectedSubjectId) return;
    setMarking(studentId);
    
    await db.recordAttendance({
      studentId,
      subjectId: selectedSubjectId,
      status,
      date: new Date().toISOString()
    });
    
    await refreshData();
    setMarking(null);
  };

  const isEligible = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return false;
    const sub = student.subscriptions.find(s => s.subjectId === selectedSubjectId);
    
    if (!sub) return false;
    
    const isExpired = new Date(sub.validUntil) < new Date();
    const noSessions = sub.sessionsRemaining <= 0;
    
    return !isExpired && !noSessions;
  };

  const getStatusMessage = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const sub = student?.subscriptions.find(s => s.subjectId === selectedSubjectId);
    
    if (!sub) return <span className="text-gray-400 text-xs">Not Enrolled</span>;
    
    const isExpired = new Date(sub.validUntil) < new Date();
    if (isExpired) return <span className="text-red-500 text-xs font-bold">{t.expired}</span>;
    if (sub.sessionsRemaining <= 0) return <span className="text-orange-500 text-xs font-bold">0 {t.remaining}</span>;
    
    // Check for near expiry (3 days)
    const daysUntilExpiry = Math.ceil((new Date(sub.validUntil).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) return <span className="text-yellow-600 text-xs flex items-center gap-1"><AlertTriangle size={10}/> 3 days left</span>;

    return <span className="text-green-600 text-xs font-medium">{sub.sessionsRemaining} left</span>;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.attendance}</h2>
      
      {/* Subject Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t.subjects}</label>
        <select 
          className="w-full md:w-1/3 p-2 border rounded-lg bg-white"
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          disabled={user?.role === 'teacher'}
        >
          <option value="">Select a Subject</option>
          {availableSubjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {selectedSubjectId && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.name}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map(student => {
                const eligible = isEligible(student.id);
                const sub = student.subscriptions.find(s => s.subjectId === selectedSubjectId);
                
                // Only show enrolled students? Or all to allow new enrollment?
                // Showing all but emphasizing enrolled for simplicity
                if (!sub) return null; 

                return (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusMessage(student.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {eligible ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            disabled={!!marking}
                            onClick={() => handleAttendance(student.id, 'present')}
                            className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-full transition"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            disabled={!!marking}
                            onClick={() => handleAttendance(student.id, 'absent')}
                            className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-full transition"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                         <span className="text-gray-400 italic text-xs">Blocked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {students.filter(s => s.subscriptions.some(sub => sub.subjectId === selectedSubjectId)).length === 0 && (
            <div className="p-8 text-center text-gray-500">{t.noData}</div>
          )}
        </div>
      )}
    </div>
  );
};