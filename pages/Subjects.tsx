import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../services/db';
import { Plus, BookOpen, Trash2, Tag } from 'lucide-react';

export const Subjects = () => {
  const { subjects, t, refreshData } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', teacherName: '', price: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.addSubject({ 
      name: formData.name, 
      teacherName: formData.teacherName, 
      price: Number(formData.price) 
    });
    await refreshData();
    setIsAdding(false);
    setFormData({ name: '', teacherName: '', price: '' });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this class?')) {
      await db.deleteSubject(id);
      await refreshData();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">{t.subjects}</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 transition-all font-medium"
        >
          <Plus size={20} /> {t.addSubject}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
             <div className="md:col-span-3 text-lg font-semibold text-gray-700 mb-2">New Class Details</div>
            <input 
              placeholder="Class Name (e.g. Math 101)" 
              className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
            <input 
              placeholder={t.teacher} 
              className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" 
              value={formData.teacherName}
              onChange={e => setFormData({...formData, teacherName: e.target.value})}
              required
            />
            <input 
              type="number"
              placeholder={t.price} 
              className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" 
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              required
            />
            <div className="md:col-span-3 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl font-medium">{t.cancel}</button>
              <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-md shadow-blue-200">{t.save}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map(subject => (
          <div key={subject.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                 <h3 className="font-bold text-xl text-gray-800">{subject.name}</h3>
                 <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-2 bg-gray-50 w-fit px-2 py-1 rounded-md">
                   <BookOpen size={14}/> {subject.teacherName}
                 </p>
              </div>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <Tag size={12} /> ${subject.price}
              </span>
            </div>
            <button 
              onClick={(e) => handleDelete(e, subject.id)}
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