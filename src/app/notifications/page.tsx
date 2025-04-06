'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

const NotificationsPage = () => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 從本地存儲中獲取通知
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      // 模擬通知數據 - 根據當前語言調整
      const mockNotifications: Notification[] = [
        {
          id: 1,
          title: t('notifications.newAssignment'),
          message: t('notifications.newAssignmentDesc'),
          date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false,
          type: 'info'
        },
        {
          id: 2,
          title: t('notifications.assignmentDue'),
          message: t('notifications.assignmentDueDesc'),
          date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          read: true,
          type: 'warning'
        },
        {
          id: 3,
          title: t('notifications.commentUpdated'),
          message: t('notifications.commentUpdatedDesc'),
          date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          read: false,
          type: 'success'
        }
      ];
      setNotifications(mockNotifications);
      localStorage.setItem('notifications', JSON.stringify(mockNotifications));
    }
  }, [language, t]);

  const markAsRead = (id: number) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const deleteNotification = (id: number) => {
    const updatedNotifications = notifications.filter(notification => notification.id !== id);
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('notifications', JSON.stringify([]));
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} ${t('notifications.minutesAgo')}`;
    } else if (diffHours < 24) {
      return `${diffHours} ${t('notifications.hoursAgo')}`;
    } else {
      return `${diffDays} ${t('notifications.daysAgo')}`;
    }
  };

  // Avoid hydration issues
  if (!mounted) {
    return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
    </div>;
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="w-64 bg-gray-800 text-white p-6 fixed h-full">
          <div className="text-2xl font-bold mb-10">{t('app.title')}</div>
          <nav className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
              <HomeIcon className="h-6 w-6" />
              <span>{t('nav.home')}</span>
            </Link>
            <Link href="/assignment" className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6" />
              <span>{t('nav.assignments')}</span>
            </Link>
            <Link
              href="https://classroom.github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg"
            >
              <CodeBracketIcon className="h-6 w-6" />
              <span>{t('nav.goToClassroom')}</span>
            </Link>
          </nav>

          {/* Sidebar Buttons */}
          <div className="absolute bottom-6 left-6 right-6 space-y-4">
            <button 
              onClick={() => window.open('/help', '_blank')}
              className="flex items-center space-x-3 p-2 w-full text-left hover:bg-gray-700 rounded-lg"
            >
              <QuestionMarkCircleIcon className="h-6 w-6" />
              <span>{t('nav.help')}</span>
            </button>
            <button 
              onClick={() => router.push('/notifications')}
              className="flex items-center space-x-3 p-2 w-full text-left bg-gray-700 rounded-lg"
            >
              <BellIcon className="h-6 w-6" />
              <span>{t('nav.notifications')}</span>
            </button>
            <button 
              onClick={() => router.push('/settings')} 
              className="flex items-center space-x-3 p-2 w-full text-left hover:bg-gray-700 rounded-lg"
            >
              <Cog6ToothIcon className="h-6 w-6" />
              <span>{t('nav.settings')}</span>
            </button>
            <button 
              onClick={() => window.location.href = '/api/auth/logout'}
              className="flex items-center space-x-3 p-2 w-full text-left hover:bg-gray-700 rounded-lg"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 p-8 ${isSidebarOpen ? 'ml-64' : ''} bg-[var(--background)]`}>
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('notifications.title')}</h1>
            <div className="flex space-x-4">
              <button 
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                {t('notifications.markAllRead')}
              </button>
              <button 
                onClick={clearAllNotifications}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                {t('notifications.clearAll')}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-[var(--card-background)] text-[var(--card-foreground)] rounded-xl shadow-sm p-8 text-center border border-[var(--border-color)]">
              <BellIcon className="h-12 w-12 mx-auto text-[var(--text-muted)] mb-4" />
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-2">{t('notifications.empty')}</h2>
              <p className="text-[var(--text-muted)]">{t('notifications.emptyDesc')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`bg-[var(--card-background)] text-[var(--card-foreground)] rounded-xl shadow-sm p-5 border border-[var(--border-color)]
                    ${!notification.read ? 'border-l-4 border-blue-500' : ''}
                    hover:shadow-md transition-shadow`}
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${!notification.read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-[var(--text-secondary)] mt-1">
                        {notification.message}
                      </p>
                      <div className="mt-2 text-sm text-[var(--text-muted)]">
                        {formatDate(notification.date)}
                      </div>
                    </div>
                    <div className="flex space-x-2 items-start">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full"
                          title={t('notifications.markAsRead')}
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-full"
                        title={t('notifications.delete')}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 