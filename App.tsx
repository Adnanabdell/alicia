import React, { useState } from 'react';
import { useApp } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Students } from './pages/Students';
import { Subjects } from './pages/Subjects';
import { Attendance } from './pages/Attendance';
import { Payments } from './pages/Payments';
import { Teachers } from './pages/Teachers';
import { Reports } from './pages/Reports';

const AppContent = () => {
  const { user } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setCurrentPage('attendance')}>
               <h3 className="text-lg font-medium opacity-90">Take Attendance</h3>
               <p className="mt-2 text-3xl font-bold">Today</p>
            </div>
             {user.role === 'admin' && (
              <>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-green-200 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setCurrentPage('payments')}>
                  <h3 className="text-lg font-medium opacity-90">Register Payment</h3>
                  <p className="mt-2 text-3xl font-bold">Cash</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-200 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setCurrentPage('reports')}>
                  <h3 className="text-lg font-medium opacity-90">View History</h3>
                  <p className="mt-2 text-3xl font-bold">Reports</p>
                </div>
              </>
            )}
          </div>
        );
      case 'students':
        return user.role === 'admin' ? <Students /> : null;
      case 'teachers':
        return user.role === 'admin' ? <Teachers /> : null;
      case 'subjects':
        return user.role === 'admin' ? <Subjects /> : null;
      case 'attendance':
        return <Attendance />;
      case 'payments':
        return user.role === 'admin' ? <Payments /> : null;
      case 'reports':
        return user.role === 'admin' ? <Reports /> : null;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default AppContent;