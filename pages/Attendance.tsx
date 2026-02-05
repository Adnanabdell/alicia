import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../services/db';
import { AlertTriangle } from 'lucide-react';

export const Attendance = () => {
  const { subjects, students, user, t, refreshData } = useApp();
  const [selectedSubjectId, setSelectedSubjectId] = useState(user?.subjectId || '');
  const [marking, setMarking] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);

  // If teacher, restrict to their subject. If admin, allow all.
  const availableSubjects = user?.role === 'admin' 
    ? subjects 
    : subjects.filter(s => s.id === user?.subjectId);

  React.useEffect(() => {
    if (selectedSubjectId) {
      db.getAttendance(selectedSubjectId).then(setAttendance);
    }
  }, [selectedSubjectId]);

  const handleAttendance = async (studentId: string, sessionNumber: number, status: 'present' | 'absent') => {
    if (!selectedSubjectId) return;
    setMarking(`${studentId}-${sessionNumber}`);
    
    await db.recordAttendance({
      studentId,
      subjectId: selectedSubjectId,
      status,
      date: new Date().toISOString(),
      session: sessionNumber
    });
    
    const updated = await db.getAttendance(selectedSubjectId);
    setAttendance(updated);
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

  const getSessionStatus = (studentId: string, sessionNumber: number) => {
    const record = attendance.find(
      a => a.studentId === studentId && a.session === sessionNumber
    );
    return record;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: '2-digit'
    });
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
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">{t.name}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(session => (
                  <th key={session} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                    <div className="font-bold text-blue-700">S{session}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map(student => {
                // For teachers: only show students assigned to them
                // For admins: show all students
                if (user?.role === 'teacher' && student.teacherId !== user.uid) {
                  return null;
                }

                const eligible = isEligible(student.id);
                const sub = student.subscriptions.find(s => s.subjectId === selectedSubjectId);
                
                // Only show enrolled students
                if (!sub) return null; 

                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-white z-5">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.phone}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusMessage(student.id)}
                    </td>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sessionNumber => {
                      const record = getSessionStatus(student.id, sessionNumber);
                      const isMarking = marking === `${student.id}-${sessionNumber}`;
                      
                      return (
                        <td key={`${student.id}-${sessionNumber}`} className="px-4 py-4 text-center bg-blue-50 border-l border-blue-100">
                          {record ? (
                            <div className="space-y-2">
                              <div className={`py-2 px-3 rounded-lg font-bold text-sm ${
                                record.status === 'present' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {record.status === 'present' ? '✓' : '✗'}
                              </div>
                              <div className="text-xs text-gray-600 font-medium">
                                {formatDate(record.date)}
                              </div>
                            </div>
                          ) : eligible ? (
                            <div className="space-y-2">
                              <label className="flex items-center justify-center gap-2 cursor-pointer py-1 hover:bg-blue-100 rounded-lg transition">
                                <input 
                                  type="radio" 
                                  name={`attendance-${student.id}-${sessionNumber}`}
                                  disabled={isMarking}
                                  onChange={() => handleAttendance(student.id, sessionNumber, 'present')}
                                  className="w-4 h-4 cursor-pointer"
                                />
                                <span className="text-xs text-green-700 font-bold hidden sm:inline">P</span>
                              </label>
                              <label className="flex items-center justify-center gap-2 cursor-pointer py-1 hover:bg-blue-100 rounded-lg transition">
                                <input 
                                  type="radio" 
                                  name={`attendance-${student.id}-${sessionNumber}`}
                                  disabled={isMarking}
                                  onChange={() => handleAttendance(student.id, sessionNumber, 'absent')}
                                  className="w-4 h-4 cursor-pointer"
                                />
                                <span className="text-xs text-red-700 font-bold hidden sm:inline">A</span>
                              </label>
                            </div>
                          ) : (
                            <span className="text-gray-300 italic text-xs">-</span>
                          )}
                        </td>
                      );
                    })}
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
