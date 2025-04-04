import React from 'react';
import { XMarkIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

interface Branch {
  name: string;
  sha: string;
  url: string;
  protected: boolean;
}

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  repoName: string;
  isLoading: boolean;
  error: string | null;
}

const BranchModal: React.FC<BranchModalProps> = ({
  isOpen,
  onClose,
  branches,
  repoName,
  isLoading,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Branches - {repoName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">Loading branches...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : branches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No branches found</div>
          ) : (
            <div className="space-y-2">
              {branches.map((branch) => (
                <div
                  key={branch.sha}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <CodeBracketIcon className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {branch.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {branch.sha.substring(0, 7)}
                      </div>
                    </div>
                  </div>
                  <a
                    href={branch.url.replace('api.github.com/repos', 'github.com')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchModal; 