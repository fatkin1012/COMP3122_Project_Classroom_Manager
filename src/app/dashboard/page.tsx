'use client';

import { useEffect, useState ,useRef} from 'react';
import Link from 'next/link';
import { animate, motion } from 'framer-motion';
import RepositoryList from '@/components/RepositoryList';
import RepositoryDetails from '@/components/RepositoryDetails';

interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
}

export default function Dashboard() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effectRan = useRef(false)
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const response = await fetch('/api/repositories');
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        const data = await response.json();
        setRepositories(data);
      
      } catch (err) {
        setError('Failed to load repositories');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      } 
    };

    if(effectRan.current === false){
      fetchRepositories();
    }

    return () => {
      effectRan.current = true;
    }
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">錯誤</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Header with Back to Home Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-blue-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">GitHub Classroom Dashboard</h1>
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 text-white font-medium py-2 px-4 rounded-md shadow hover:bg-blue-600 transition"
          >
            Back to Home
          </motion.button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Project List</h2>
            </div>
            <div className="p-4">
              <RepositoryList
                repositories={repositories}
                selectedRepo={selectedRepo}
                onSelectRepo={setSelectedRepo}
              />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          {selectedRepo ? (
            <RepositoryDetails repository={selectedRepo} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 p-6 text-gray-500 dark:text-gray-400 text-center h-full flex items-center justify-center">
              <div>
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p>Select a repository to view details</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}