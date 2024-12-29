import React from 'react';
import { type Session } from "next-auth";
import Link from "next/link";
import { 
  Home as HomeIcon, 
  User as UserCircleIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
} from "lucide-react";

interface DashboardLayoutProps {
  session: Session;
  children: React.ReactNode;
}

const DashboardLayout = ({ session, children }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden w-64 flex-none flex-col bg-white p-4 shadow-lg lg:flex">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-purple-600">PolitikerPuls</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link 
            href="/dashboard" 
            className="flex items-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <HomeIcon className="mr-3 h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            href="/profile" 
            className="flex items-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <UserCircleIcon className="mr-3 h-5 w-5" />
            <span>Profile</span>
          </Link>
          
          <Link 
            href="/settings" 
            className="flex items-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <SettingsIcon className="mr-3 h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center">
            <div className="mr-3 h-8 w-8 rounded-full bg-gray-200">
              <img
                src={session.user?.image ?? ''}
                alt={session.user?.name ?? ''}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium">{session.user?.name}</p>
              <p className="text-sm text-gray-500">{session.user?.email}</p>
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            className="mt-4 flex w-full items-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <LogOutIcon className="mr-3 h-5 w-5" />
            <span>Sign out</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Navigation */}
        <header className="bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {session.user?.name}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;