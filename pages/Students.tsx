import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../services/db';
import { Plus, User, Trash2, Phone, Search } from 'lucide-react';

export const Students = () => {
  const { students, teachers, subjects, t, refreshData } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', parentPhone: '', teacherId: '', subjectId: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.teacherId || !formData.subjectId) {
      alert('Please fill in all required fields');
      return;
    }
    
    await db.addStudent({ 
      name: formData.name,
      phone: formData.phone,
      parentPhone: formData.parentPhone,
      teacherId: formData.teacherId,
      subscriptions: [{
        subjectId: formData.subjectId,
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
        sessionsRemaining: 12
      }]
    });
    await refreshData();
    setIsAdding(false);
    setFormData({ name: '', phone: '', parentPhone: '', teacherId: '', subjectId: '' });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this student?')) {
      await db.deleteStudent(id);
      await refreshData();
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.phone.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">{t.students}</h2>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
              placeholder={t.search}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 transition-all font-medium whitespace-nowrap"
          >
            <Plus size={20} /> {t.addStudent}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div className="md:col-span-2 text-lg font-semibold text-gray-700 mb-2">New Student Details</div>
            <input 
              placeholder={t.name} 
              className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
            <input 
              placeholder={t.phone} 
              className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
            <input 
              placeholder={t.parentPhone} 
              className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" 
              value={formData.parentPhone}
              onChange={e => setFormData({...formData, parentPhone: e.target.value})}
            />
            <select 
              className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white"
              value={formData.teacherId}
              onChange={e => setFormData({...formData, teacherId: e.target.value})}
              required
            >
              <option value="">Select Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.uid} value={teacher.uid}>{teacher.name}</option>
              ))}
            </select>
            <select 
              className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white"
              value={formData.subjectId}
              onChange={e => setFormData({...formData, subjectId: e.target.value})}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl font-medium">{t.cancel}</button>
              <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-md shadow-blue-200">{t.save}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map(student => (
          <div key={student.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
            <div className="flex gap-4">
              <div className="bg-blue-50 p-3 rounded-xl h-fit">
                <User className="text-blue-600 w-6 h-6" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-lg text-gray-800 truncate">{student.name}</h3>
                <div className="flex flex-col gap-1 mt-2">
                   <div className="text-sm text-gray-500 flex items-center gap-2"><Phone size={12}/> {student.phone || '-'}</div>
                   <div className="text-sm text-gray-500 flex items-center gap-2"><User size={12}/> Parent: {student.parentPhone || '-'}</div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {student.subscriptions.map((sub, idx) => (
                    <span key={idx} className="text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-lg">
                      {sub.subjectId} ({sub.sessionsRemaining})
                    </span>
                  ))}
                  {student.subscriptions.length === 0 && <span className="text-xs text-gray-400 italic">No classes</span>}
                </div>
              </div>
            </div>
            <button 
              onClick={(e) => handleDelete(e, student.id)}
              className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
