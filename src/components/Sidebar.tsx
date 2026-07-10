import React from 'react';
import { Home, CheckSquare, History, BarChart2, ShieldAlert, LogOut, Menu } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout: () => void;
  userEmail: string | null;
  extensionActive?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, onLogout, userEmail, extensionActive }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: Home },
    { id: 'tasks', label: 'Tasks (Read)', icon: CheckSquare },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Live Analytics', icon: BarChart2 },
    { id: 'security', label: 'Security Logs', icon: ShieldAlert },
  ];

  return (
    <nav className="group fixed top-5 left-5 h-[calc(100vh-40px)] w-[70px] hover:w-[240px] rounded-[24px] bg-slate-950/60 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden z-[100] flex flex-col items-start py-6 px-3 motionsite-card-shine">
      {/* Glow Header */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent blur-[1px]" />
      
      {/* Logo Section */}
      <div className="flex items-center w-full px-2 mb-8 select-none">
        <div className="flex items-center justify-center min-w-[44px] h-[44px] rounded-2xl bg-gradient-to-br from-red-500/10 to-amber-500/10 border border-red-500/20 text-red-500 group-hover:border-red-500/40 transition-all duration-300">
          <Menu className="w-5 h-5 animate-pulse" />
        </div>
        <span className="text-sm font-bold ml-4 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300 delay-100 font-display tracking-wider premium-glow-text animate-gradient-shift uppercase">
          PARENT CONTROL
        </span>
      </div>

      {/* Nav Buttons */}
      <div className="flex flex-col gap-4 w-full px-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center w-[44px] h-[44px] rounded-xl group-hover:w-full transition-all duration-300 border overflow-hidden cursor-pointer relative ${
                isActive
                  ? 'bg-gradient-to-r from-red-500/15 to-amber-500/5 border-red-500/35 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                  : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10 hover:border-white/20 hover:text-white hover:-translate-y-0.5'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-red-500 rounded-r-full" />
              )}
              
              <div className="flex items-center justify-center min-w-[44px] h-[44px]">
                <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-red-400' : 'text-neutral-400 group-hover:text-white'}`} />
              </div>
              <span className="text-neutral-200 text-sm font-semibold ml-4 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300 delay-100">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="mt-auto w-full px-1 flex flex-col gap-3">
        <div className="px-2 flex flex-col items-center group-hover:items-start transition-all gap-1 border-b border-white/5 pb-3 mb-1">
          <div className="flex items-center gap-2 font-mono">
            <span className={`w-2 h-2 rounded-full ${extensionActive === 'running' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-ping'}`} />
            <span className={`text-[10px] tracking-wider uppercase font-bold hidden group-hover:inline transition-all duration-300 ${extensionActive === 'running' ? 'text-emerald-400' : 'text-rose-500 animate-pulse'}`}>
              {extensionActive === 'running' ? 'SHIELD ACTIVE' : 'SHIELD DISABLED'}
            </span>
          </div>
        </div>
        {userEmail && (
          <div className="px-2 text-left truncate hidden group-hover:block transition-all duration-300">
            <span className="text-[10px] text-neutral-500 font-mono block">Logged In as:</span>
            <span className="text-[10px] text-red-400 font-mono truncate block" title={userEmail}>
              {userEmail}
            </span>
          </div>
        )}
        
        <button
          onClick={onLogout}
          className="flex items-center w-[44px] h-[44px] rounded-xl group-hover:w-full transition-all duration-300 border border-white/5 bg-white/5 text-neutral-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 cursor-pointer overflow-hidden relative"
        >
          <div className="flex items-center justify-center min-w-[44px] h-[44px]">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold ml-4 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300 delay-100">
            Sign Out
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
