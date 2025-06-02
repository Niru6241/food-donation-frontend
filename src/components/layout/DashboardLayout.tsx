import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOutIcon, HomeIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

const formatRole = (role: string): string => {
  if (!role) return '';
  return role.replace('ROLE_', '');
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab }) => {
  const { user, logout } = useAuth();
  useNavigate();
  const isDonor = user?.role === 'ROLE_DONOR';

  // Simplified navigation items
  const navItems = isDonor
      ? [
        {
          name: 'Dashboard',
          icon: HomeIcon,
          href: '/donor/dashboard',
          id: 'dashboard'
        }
      ]
      : [
        {
          name: 'Dashboard',
          icon: HomeIcon,
          href: '/ngo/dashboard',
          id: 'dashboard'
        }
      ];

  return (
      <div className="min-h-screen bg-gray-100">
        {/* Mobile nav */}
        <div className="bg-emerald-600 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <span className="text-white font-semibold text-lg">FoodShare</span>
            </div>
            <div>
              <button className="text-white hover:text-emerald-100">
                <UserIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(item => (
                <a
                    key={item.name}
                    href={item.href}
                    className={`${
                        activeTab === item.id
                            ? 'bg-emerald-700 text-white'
                            : 'text-emerald-100 hover:bg-emerald-500'
                    } block px-3 py-2 rounded-md text-base font-medium`}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                </a>
            ))}
            <button
                onClick={logout}
                className="w-full text-left text-emerald-100 hover:bg-emerald-500 block px-3 py-2 rounded-md text-base font-medium"
            >
              <div className="flex items-center">
                <LogOutIcon className="mr-3 h-5 w-5" />
                Log out
              </div>
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Desktop sidebar */}
          <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <span className="text-emerald-600 font-bold text-2xl">FoodShare</span>
              </div>

              {/* Navigation */}
              <div className="mt-8">
                <div className="px-4 mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {isDonor ? 'Donor Menu' : 'NGO Menu'}
                  </p>
                </div>
                <nav className="mt-2 px-2 space-y-1">
                  {navItems.map(item => (
                      <a
                          key={item.name}
                          href={item.href}
                          className={`${
                              activeTab === item.id
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'text-gray-700 hover:bg-gray-50'
                          } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                      >
                        <item.icon
                            className={`mr-3 h-5 w-5 ${
                                activeTab === item.id
                                    ? 'text-emerald-500'
                                    : 'text-gray-400 group-hover:text-gray-500'
                            }`}
                        />
                        {item.name}
                      </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* User Profile Section */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                <span className="text-emerald-700 font-medium text-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role ? formatRole(user.role) : 'Role'}
                  </p>
                </div>
              </div>
              <button
                  onClick={logout}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-150"
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:pl-64 flex flex-col w-full">
            <main className="flex-1">
              <div className="py-6 px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
  );
};

export default DashboardLayout;