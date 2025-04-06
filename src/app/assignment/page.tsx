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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Branch modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState<string | null>(null);

  useEffect(() => {
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="w-64 bg-gray-800 text-white p-6 fixed h-full">
          <div className="text-2xl font-bold mb-10">GitHub Classroom Tracker</div>
          <nav className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
              <HomeIcon className="h-6 w-6" />
              <span>Home</span>
            </Link>
            {[
              { icon: <ShoppingBagIcon className="h-6 w-6" />, text: 'Assignments', href: '/assignment' },
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
              <span>Go to Classroom</span>
            </Link>
          </nav>

          {/* Sidebar Buttons */}
          <div className="absolute bottom-6 left-6 right-6 space-y-4">
            <button className="flex items-center space-x-3 p-2 w-full text-left hover:bg-gray-700 rounded-lg">
              <QuestionMarkCircleIcon className="h-6 w-6" />
              <span>Help</span>
            </button>
            <button className="flex items-center space-x-3 p-2 w-full text-left hover:bg-gray-700 rounded-lg">
              <BellIcon className="h-6 w-6" />
              <span>Notifications</span>
            </button>
            <button className="flex items-center space-x-3 p-2 w-full text-left hover:bg-gray-700 rounded-lg">
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
              <span>Logout</span>
            </button>
          </div>
          
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 p-8 ${isSidebarOpen ? 'ml-64' : ''}`}>
        {/* Toggle Sidebar Button */}
        {/* <button
          onClick={toggleSidebar}
          className="p-2 bg-gray-800 text-white rounded-lg mb-4 hover:bg-gray-700"
        >
          {isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
        </button> */}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>  
          {/* Classroom Repositories */}
          <div className="w-96">
            <input
              type="text"
              placeholder=" Search repositories..."
              className="w-full p-2 rounded-full border border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Assignment Content */}
        <div className="grid gap-6">
          {loading ? (
            <div className="text-center py-8">Loading repositories...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No repositories found</div>
          ) : (
            filteredAssignments.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/assignment/${assignment.name}`}
                className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <CodeBracketIcon className="h-6 w-6 text-gray-600" />
                      <h2 className="text-xl font-semibold text-gray-800">{assignment.name}</h2>
                    </div>
                    <p className="text-gray-600 mt-2">{assignment.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                      {assignment.language || "Not specified"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <UserIcon className="h-4 w-4" />
                    <span>{assignment.owner}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{new Date(assignment.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4" />
                    <span>{assignment.stars}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ArrowPathIcon className="h-4 w-4" />
                    <span>{assignment.forks}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <EyeIcon className="h-4 w-4" />
                    <span>{assignment.views}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Branch Modal */}
      <BranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        branches={branches}
        repoName={selectedRepo}
        isLoading={branchesLoading}
        error={branchesError}
      />
    </div>
  );
};

export default AssignmentPage;