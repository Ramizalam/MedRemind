import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

function App() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'upload' | 'calendar' | 'notifications' | 'medicines'>('upload');

  const handleViewChange = (view: 'upload' | 'calendar' | 'notifications' | 'medicines') => {
    setActiveView(view);
    if (view === 'calendar') {
      setShowCalendar(true);
    } else {
      setShowCalendar(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeView={activeView}
        onViewChange={handleViewChange}
      />
      <main className={`flex-1 overflow-y-auto transition-all ${
        isSidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0'
      }`}>
        <Dashboard 
          showCalendar={showCalendar} 
          setShowCalendar={setShowCalendar}
          activeView={activeView}
        />
      </main>
    </div>
  );
}

export default App;