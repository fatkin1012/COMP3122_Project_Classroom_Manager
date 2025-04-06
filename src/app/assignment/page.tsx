'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  ShoppingBagIcon,
  ViewColumnsIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  CodeBracketIcon,
  StarIcon,
  ArrowPathIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  ViewfinderCircleIcon,
} from '@heroicons/react/24/outline';
import BranchModal from './components/BranchModal';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

interface Assignment {
  id: number;
  name: string;
  description: string;
  lastUpdated: string;
  stars: number;
  forks: number;
  views: number;
  owner: string;
  language: string;
  url: string;
}

interface Branch {
  name: string;
  sha: string;
  url: string;
  protected: boolean;
}

const AssignmentPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 控制側邊欄的狀態
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Branch modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const fetchAssignments = async () => {
      try {
        const response = await fetch('/api/assignments', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add cache control to prevent caching
            'Cache-Control': 'no-cache',
          },
        });
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch assignments');
        }

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server');
        }

        setAssignments(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleViewBranches = async (repoName: string) => {
    setSelectedRepo(repoName);
    setIsModalOpen(true);
    setBranchesLoading(true);
    setBranchesError(null);

    try {
      const response = await fetch(`/api/repositories/${repoName}/branches`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch branches');
      }

      setBranches(data);
    } catch (err) {
      setBranchesError(err instanceof Error ? err.message : 'Failed to load branches');
    } finally {
      setBranchesLoading(false);
    }
  };

  // Filter assignments based on search query
  const filteredAssignments = assignments.filter(assignment => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (assignment.name?.toLowerCase() || '').includes(searchLower) ||
      (assignment.description?.toLowerCase() || '').includes(searchLower) ||
      (assignment.owner?.toLowerCase() || '').includes(searchLower)
    );
  });

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
            {[
              { icon: <ShoppingBagIcon className="h-6 w-6" />, text: t('nav.assignments'), href: '/assignment' },
            ].map((item) => (
              <Link key={item.text} href={item.href} className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
                {item.icon}
                <span>{item.text}</span>
              </Link>
            ))}

            {/* New Link to GitHub Classroom */}
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
              className="flex items-center space-x-3 p-2 w-full text-left hover:bg-gray-700 rounded-lg"
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('assignments.title')}</h1>  
          {/* Classroom Repositories */}
          <div className="w-96">
            <input
              type="text"
              placeholder={t('assignments.search')}
              className="w-full p-2 rounded-full border border-[var(--border-color)] bg-[var(--card-background)] text-[var(--card-foreground)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Assignment Content */}
        <div className="grid gap-6">
          {loading ? (
            <div className="text-center py-8 text-[var(--text-secondary)]">{t('assignments.loading')}</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)]">{t('assignments.empty')}</div>
          ) : (
            filteredAssignments.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/assignment/${assignment.name}`}
                className="block bg-[var(--card-background)] text-[var(--card-foreground)] shadow-sm hover:shadow-md transition-shadow p-6 rounded-xl border border-[var(--border-color)]"
              >
                <div className="flex justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] hover:text-blue-600">{assignment.name}</h2>
                    <p className="mt-2 text-[var(--text-secondary)]">{assignment.description || (
                      <span className="text-[var(--text-muted)] italic">{t('assignments.noDescription')}</span>
                    )}</p>
                    
                    <div className="mt-4 flex items-center text-[var(--text-muted)] space-x-6">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-1" />
                        <span>{assignment.owner}</span>
                      </div>
                      
                      {assignment.language && (
                        <div className="flex items-center">
                          <CodeBracketIcon className="h-4 w-4 mr-1" />
                          <span>{assignment.language || t('assignments.language')}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>{t('assignments.updated')} {formatDate(assignment.lastUpdated)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-4 text-[var(--text-secondary)]">
                      <div className="flex items-center">
                        <StarIcon className="h-5 w-5 mr-1 text-yellow-500" />
                        <span>{assignment.stars}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <ViewColumnsIcon className="h-5 w-5 mr-1 text-purple-500" />
                        <span>{assignment.forks}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <EyeIcon className="h-5 w-5 mr-1 text-blue-500" />
                        <span>{assignment.views}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();  // Prevent navigation to repository page
                        handleViewBranches(assignment.name);
                      }}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      {t('assignments.viewBranches')}
                    </button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        
        {/* Branch Modal */}
        {isModalOpen && (
          <BranchModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            repoName={selectedRepo}
            branches={branches}
            loading={branchesLoading}
            error={branchesError}
          />
        )}
      </div>
    </div>
  );
};

// Helper function to format dates
const formatDate = (dateString: string) => {
  // Cannot use hooks at function component level - need to pass in t
  // const { t } = useLanguage(); 
  
  // Instead we'll resolve this by using a function component
  return <FormattedDate dateString={dateString} />;
};

const FormattedDate: React.FC<{dateString: string}> = ({ dateString }) => {
  const { t } = useLanguage();
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  let formattedDate;
  if (diffDays === 0) {
    formattedDate = t('assignments.today');
  } else if (diffDays === 1) {
    formattedDate = t('assignments.yesterday');
  } else if (diffDays < 30) {
    formattedDate = `${diffDays} ${t('assignments.daysAgo')}`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    formattedDate = `${months} ${months === 1 ? t('assignments.monthAgo') : t('assignments.monthsAgo')}`;
  } else {
    const years = Math.floor(diffDays / 365);
    formattedDate = `${years} ${years === 1 ? t('assignments.yearAgo') : t('assignments.yearsAgo')}`;
  }
  
  return <>{formattedDate}</>;
};

export default AssignmentPage;