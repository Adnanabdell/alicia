import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../services/db';
import { Plus, Trash2, GraduationCap, Mail, Key } from 'lucide-react';

export const Teachers = () => {
  const { teachers, subjects, t, refreshData } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', subjectId: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.addUser({ 
      ...formData, 
      role: 'teacher',
      uid: '', 
    });
    await refreshData();
    setIsAdding(false);
    setFormData({ name: '', email: '', password: '', subjectId: '' });
  };

  const handleDelete = async (e: React.MouseEvent, uid: string) => {
    e.stopPropagation(); // Prevent card clicks if we add them later
    if (confirm('Are you sure you want to delete this teacher?')) {
      await db.deleteUser(uid);
      await refreshData();
    }
  };

  const getSubjectName = (id?: string) => {
    const sub = subjects.find(s => s.id === id);
    return sub ? sub.name : 'No Class Assigned';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">{t.teachers}</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 transition-all font-medium"
        >
          <Plus size={20} /> {t.addTeacher}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 text-lg font-semibold text-gray-700 mb-2">New Teacher Details</div>
            
            <input 
              placeholder={t.name} 
              className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
            <input 
              type="text"
              placeholder={t.username} 
              className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
            <input 
              type="password"
              placeholder={t.passwordPlaceholder} 
              className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required
            />
            <select 
              className="p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-100 outline-none"
              value={formData.subjectId}
              onChange={e => setFormData({...formData, subjectId: e.target.value})}
              required
            >
              <option value="">{t.selectSubject}</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl font-medium">{t.cancel}</button>
              <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-md shadow-blue-200">{t.save}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {teachers.map(teacher => (
          <div key={teacher.uid} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 p-3 rounded-xl">
                <GraduationCap className="text-indigo-600 w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">{teacher.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Mail size={14} /> {teacher.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Key size={14} /> ••••••
                </div>
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full mt-3 inline-block">
                  {getSubjectName(teacher.subjectId)}
                </span>
              </div>
            </div>
            <button 
              onClick={(e) => handleDelete(e, teacher.uid)}
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