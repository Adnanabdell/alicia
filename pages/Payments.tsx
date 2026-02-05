import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../services/db';

export const Payments = () => {
  const { students, subjects, t, refreshData } = useApp();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedSubject) return;

    setIsProcessing(true);
    const subject = subjects.find(s => s.id === selectedSubject);
    
    await db.processPayment({
      studentId: selectedStudent,
      subjectId: selectedSubject,
      amount: subject?.price || 0,
      date: new Date().toISOString(),
      adminId: 'admin'
    });

    await refreshData();
    setIsProcessing(false);
    alert('Payment Successful & Subscription Renewed');
  };

  const getSubjectPrice = () => {
    const s = subjects.find(sub => sub.id === selectedSubject);
    return s ? s.price : 0;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.payments}</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
        <form onSubmit={handlePayment} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.students}</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              value={selectedStudent}
              onChange={e => setSelectedStudent(e.target.value)}
              required
            >
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">{t.subjects}</label>
             <select 
               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
               value={selectedSubject}
               onChange={e => setSelectedSubject(e.target.value)}
               required
             >
               <option value="">Select Subject</option>
               {subjects.map(s => (
                 <option key={s.id} value={s.id}>{s.name}</option>
               ))}
             </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
             <span className="text-gray-600">{t.amount}:</span>
             <span className="text-2xl font-bold text-green-700">${getSubjectPrice()}</span>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className={`w-full py-3 text-white font-bold rounded-lg shadow transition ${isProcessing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isProcessing ? 'Processing...' : t.confirmPayment}
          </button>
        </form>
      </div>
    </div>
  );
};