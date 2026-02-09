'use client';

import React from 'react';
import { apiClient } from '../../lib/api-client';

interface LogoutButtonProps {
  onLogout?: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  const handleLogout = async () => {
    await apiClient.logout();
    if (onLogout) {
      onLogout();
    }
    window.location.href = '/auth/login';
  };

  return (
    <button
      onClick={handleLogout}
      className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
    >
      Logout
    </button>
  );
};

export default LogoutButton;