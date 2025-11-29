import React, { ReactNode } from 'react';
import BottomNav from './BottomNav';
import { AppRoute } from '../types';

interface LayoutProps {
  children: ReactNode;
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeRoute, onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 relative pb-24">
      {/* Changed max-w-md to max-w-2xl for better desktop viewing experience */}
      <main className="max-w-2xl mx-auto min-h-screen bg-white shadow-2xl shadow-slate-200 overflow-hidden relative border-x border-slate-100">
        {children}
      </main>
      <BottomNav activeRoute={activeRoute} onNavigate={onNavigate} />
    </div>
  );
};

export default Layout;