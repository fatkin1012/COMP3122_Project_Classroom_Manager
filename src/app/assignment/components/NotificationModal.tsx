import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ClockIcon, CodeBracketIcon, ArrowPathIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/components/LanguageContext';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock notification data
const notifications = [
  {
    id: 1,
    type: 'commit',
    repo: 'intro-to-data-structure-group-version-abc',
    user: 'user123',
    time: '2 hours ago',
    message: 'Committed new code: "Fixed search functionality bug"',
    icon: <CodeBracketIcon className="h-5 w-5 text-green-500" />,
  },
  {
    id: 2,
    type: 'issue',
    repo: 'algorithms-assignment-group-3',
    user: 'student456',
    time: 'Yesterday',
    message: 'Created new issue: "Need to implement quicksort algorithm"',
    icon: <ArrowPathIcon className="h-5 w-5 text-blue-500" />,
  },
  {
    id: 3,
    type: 'member',
    repo: 'database-project-team-b',
    user: 'admin',
    time: '3 days ago',
    message: 'Added new team member "newstudent789"',
    icon: <UserPlusIcon className="h-5 w-5 text-purple-500" />,
  },
  {
    id: 4,
    type: 'commit',
    repo: 'web-dev-class-project',
    user: 'webmaster',
    time: '5 days ago',
    message: 'Committed new code: "Added responsive design"',
    icon: <CodeBracketIcon className="h-5 w-5 text-green-500" />,
  },
  {
    id: 5,
    type: 'commit',
    repo: 'intro-to-data-structure-group-version-abc',
    user: 'user789',
    time: '1 week ago',
    message: 'Committed new code: "Completed binary tree implementation"',
    icon: <CodeBracketIcon className="h-5 w-5 text-green-500" />,
  }
];

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{t.latestUpdates}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="flex items-start">
                <div className="p-2 bg-gray-50 rounded-full mr-3">
                  {notification.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <span className="font-medium">{notification.repo}</span>
                    <span className="mx-1">•</span>
                    <span>{notification.user}</span>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  <span>{notification.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center">
          <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
            {t.viewAllUpdates}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal; 