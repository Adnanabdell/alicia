import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Menu, X, Users, BookOpen, ClipboardCheck, DollarSign, LogOut, LayoutDashboard, GraduationCap, BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user, logout, t, language, setLanguage } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItem = ({ page, icon: Icon, label }: any) => (
    <button
      onClick={() => {
        onNavigate(page);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 mb-2 rounded-xl transition-all duration-200 ${
        currentPage === page 
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      <Icon size={20} className={language === 'ar' ? 'ml-3' : 'mr-3'} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-gray-50/50">
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col w-72 bg-white border-r border-gray-100 fixed h-full z-10 ${language === 'ar' ? 'right-0 border-l border-r-0' : 'left-0'}`}>
        <div className="p-8 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
             <GraduationCap className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Al-Madrasa</h1>
        </div>
        
        <nav className="flex-1 px-6 py-4 overflow-y-auto space-y-1">
          <NavItem page="dashboard" icon={LayoutDashboard} label={t.dashboard} />
          {user?.role === 'admin' && (
            <>
              <NavItem page="students" icon={Users} label={t.students} />
              <NavItem page="teachers" icon={GraduationCap} label={t.teachers} />
              <NavItem page="subjects" icon={BookOpen} label={t.subjects} />
              <NavItem page="reports" icon={BarChart3} label={t.reports} />
            </>
          )}
          <NavItem page="attendance" icon={ClipboardCheck} label={t.attendance} />
          {user?.role === 'admin' && (
            <NavItem page="payments" icon={DollarSign} label={t.payments} />
          )}
        </nav>

        <div className="p-6 border-t border-gray-100 bg-gray-50/30">
          <div className="flex gap-2 mb-4 justify-center bg-white p-1 rounded-lg border border-gray-200">
             {(['en', 'ar', 'fr'] as const).map((lang) => (
               <button 
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 py-1.5 text-xs rounded-md uppercase font-bold transition-all ${language === lang ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 {lang}
               </button>
             ))}
          </div>
          <button onClick={logout} className="flex items-center justify-center w-full px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm">
            <LogOut size={18} className={language === 'ar' ? 'ml-2' : 'mr-2'} />
            {t.logout}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white z-20 border-b border-gray-100 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
             <GraduationCap className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-gray-800 text-lg">Al-Madrasa</h1>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-gray-100 rounded-lg">
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-10 pt-20 px-6 md:hidden overflow-y-auto">
           <nav className="flex flex-col space-y-2">
            <NavItem page="dashboard" icon={LayoutDashboard} label={t.dashboard} />
            {user?.role === 'admin' && (
              <>
                <NavItem page="students" icon={Users} label={t.students} />
                <NavItem page="teachers" icon={GraduationCap} label={t.teachers} />
                <NavItem page="subjects" icon={BookOpen} label={t.subjects} />
                <NavItem page="reports" icon={BarChart3} label={t.reports} />
              </>
            )}
            <NavItem page="attendance" icon={ClipboardCheck} label={t.attendance} />
            {user?.role === 'admin' && <NavItem page="payments" icon={DollarSign} label={t.payments} />}
            
            <div className="pt-6 mt-6 border-t border-gray-100">
               <button onClick={logout} className="flex items-center w-full px-4 py-3 text-red-600 bg-red-50 rounded-xl justify-center font-medium">
                <LogOut size={20} className="mr-2" /> {t.logout}
              </button>
            </div>
           </nav>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 p-4 md:p-10 pt-24 md:pt-10 transition-all duration-300 ${language === 'ar' ? 'md:mr-72' : 'md:ml-72'}`}>
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};