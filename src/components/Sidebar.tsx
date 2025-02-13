import React from 'react';
import { Bell, Calendar, Upload, Pill as Pills, Menu, X, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeView: 'upload' | 'calendar' | 'notifications' | 'medicines';
  onViewChange: (view: 'upload' | 'calendar' | 'notifications' | 'medicines') => void;
}

const Sidebar = ({ isOpen, setIsOpen, activeView, onViewChange }: SidebarProps) => {
  const [notificationCount, setNotificationCount] = React.useState(3);
  const [upcomingMedicines, setUpcomingMedicines] = React.useState(5);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-lg bg-white shadow-md hover:bg-gray-50"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-30
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64
      `}>
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <Pills className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">MedRemind</h1>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            <NavItem 
              icon={<Upload />} 
              text="Upload Prescription" 
              active={activeView === 'upload'}
              onClick={() => onViewChange('upload')}
            />
            <NavItem 
              icon={<Calendar />} 
              text="Reminders" 
              active={activeView === 'calendar'}
              onClick={() => onViewChange('calendar')}
              info={`${upcomingMedicines} upcoming`}
            />
            <NavItem 
              icon={<Bell />} 
              text="Notifications" 
              active={activeView === 'notifications'}
              onClick={() => onViewChange('notifications')}
              badge={notificationCount}
            />
            <NavItem 
              icon={<Pills />} 
              text="Medicines" 
              active={activeView === 'medicines'}
              onClick={() => onViewChange('medicines')}
            />
          </nav>

          {/* User Profile */}
          <div className="pt-4 border-t border-gray-200">
            <button className="flex items-center w-full p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                JD
              </div>
              <div className="ml-3 text-left">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">View Profile</p>
              </div>
              <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
  badge?: number;
  info?: string;
}

const NavItem = ({ icon, text, active = false, onClick, badge, info }: NavItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full p-3 rounded-lg transition-colors
        ${active 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-gray-600 hover:bg-gray-50'
        }
      `}
    >
      <div className="relative">
        {icon}
        {badge && (
          <span className="absolute -top-1 -right-1 w-4 h-4 text-xs flex items-center justify-center bg-red-500 text-white rounded-full">
            {badge}
          </span>
        )}
      </div>
      <span className="font-medium flex-1 text-left">{text}</span>
      {info && (
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          {info}
        </span>
      )}
    </button>
  );
};

export default Sidebar;