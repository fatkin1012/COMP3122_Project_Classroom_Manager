'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoginButton from './LoginButton';

type User = {
  login: string;
  avatar_url: string;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const res = await fetch('/api/github/user', {
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Error fetching user info', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex-shrink-0 flex items-center text-gray-800 font-bold text-xl"
            >
              <svg 
                className="h-8 w-8 mr-2 text-blue-600" 
                fill="none"
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              GitHub Classroom Tracker
            </Link>
          </div>
          
          <div className="flex items-center">
            {isLoading ? (
              <div className="animate-pulse h-8 w-8 bg-gray-300 rounded-full"></div>
            ) : user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img 
                    src={user.avatar_url} 
                    alt={user.login} 
                    className="h-8 w-8 rounded-full border-2 border-gray-200"
                  />
                  <span className="hidden md:block font-medium text-gray-700">
                    {user.login}
                  </span>
                  <svg 
                    className="h-5 w-5 text-gray-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 9l-7 7-7-7" 
                    />
                  </svg>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-10">
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 