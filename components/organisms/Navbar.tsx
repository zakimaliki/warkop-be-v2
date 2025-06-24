'use client';

import { useRouter } from 'next/navigation';
import { authService } from '../../services/authService';
import { Button } from '../atoms/Button';

export const Navbar = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow p-4 border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto">
        <div className="flex justify-between items-center h-16">
          <span
            onClick={() => router.push('/dashboard')}
            className="text-xl font-bold cursor-pointer hover:text-gray-700 transition-colors text-black select-none"
          >
            Warkop
          </span>
          <Button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}; 