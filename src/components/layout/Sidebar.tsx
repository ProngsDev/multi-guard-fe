import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';
import {
  HomeIcon,
  PlusIcon,
  ClockIcon,
  UsersIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Create Wallet', href: '/create', icon: PlusIcon },
  { name: 'Create Transaction', href: '/create-transaction', icon: PaperAirplaneIcon },
  { name: 'Pending Transactions', href: '/pending', icon: ClockIcon },
  { name: 'Manage Signers', href: '/signers', icon: UsersIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Enhanced Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Enhanced Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md border-r border-neutral-200 shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Enhanced Mobile close button */}
          <div className="flex items-center justify-between p-6 md:hidden border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <HomeIcon className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-neutral-900">Navigation</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-sm',
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-blue-100/50 border-l-4 border-blue-500'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={cn(
                      'mr-3 h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 group-hover:text-neutral-600'
                    )}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Enhanced Footer */}
          <div className="p-6 border-t border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <span className="text-sm font-semibold text-neutral-900">MultiGuard</span>
              </div>
              <p className="text-xs text-neutral-500">
                v1.0.0 • Multi-Signature Wallet
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { Sidebar };
