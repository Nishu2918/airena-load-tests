import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Settings, 
  LogOut, 
  Bell,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { UserData } from '../App';
import { MembersTable } from './MembersTable';
import { ProfileSection } from './ProfileSection';
import { SettingsSection } from './SettingsSection';

interface AdminDashboardProps {
  userData: UserData;
  onUserDataUpdate: (user: UserData) => void;
  onLogout: () => void;
}

type DashboardView = 'dashboard' | 'members' | 'profile' | 'settings';

export function AdminDashboard({ userData, onUserDataUpdate, onLogout }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>('members');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  const menuItems = [
    { id: 'dashboard' as DashboardView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members' as DashboardView, label: 'Members', icon: Users },
    { id: 'profile' as DashboardView, label: 'Profile', icon: UserCircle },
    { id: 'settings' as DashboardView, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      {/* Top Bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <span className="text-white">
                  {userData.businessName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-gray-900">{userData.businessName}</div>
                <div className="text-gray-500">Admin Portal</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <span className="text-white">
                  {userData.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-gray-900">{userData.name}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex">
        {/* Sidebar - Desktop: Always visible, Mobile: Toggle with button */}
        <aside className={`w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] fixed lg:sticky top-[73px] left-0 z-40 shadow-lg lg:shadow-none transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                variant={currentView === item.id ? 'default' : 'ghost'}
                className={`w-full justify-start gap-3 ${
                  currentView === item.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                    : ''
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-200">
              <Button
                onClick={onLogout}
                variant="ghost"
                className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-gray-900 mb-6">Dashboard Overview</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Stats will be shown here */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="text-gray-600 mb-2">Total Members</div>
                    <div className="text-gray-900">
                      {JSON.parse(localStorage.getItem('members') || '[]').length}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'members' && (
              <motion.div
                key="members"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MembersTable 
                  businessName={userData.businessName}
                  onNotification={(message) => setNotifications([...notifications, message])}
                />
              </motion.div>
            )}

            {currentView === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ProfileSection 
                  userData={userData}
                  onUpdate={onUserDataUpdate}
                />
              </motion.div>
            )}

            {currentView === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SettingsSection 
                  userData={userData}
                  onUpdate={onUserDataUpdate}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}