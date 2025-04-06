import React from 'react';
import { XMarkIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/context/LanguageContext';

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
  loading: boolean;
  error: string | null;
}

const BranchModal: React.FC<BranchModalProps> = ({
  isOpen,
  onClose,
  branches,
  repoName,
  loading,
  error,
}) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--card-background)] rounded-lg w-full max-w-2xl text-[var(--card-foreground)]">
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-color)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {t('branch.title')} - {repoName}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            aria-label={t('branch.close')}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8 text-[var(--text-secondary)]">{t('branch.loading')}</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : branches.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)]">{t('branch.empty')}</div>
          ) : (
            <div className="space-y-2">
              {branches.map((branch) => (
                <div
                  key={branch.sha}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <CodeBracketIcon className="h-5 w-5 text-[var(--text-muted)]" />
                    <div>
                      <div className="font-medium text-[var(--text-primary)] flex items-center">
                        {branch.name}
                        {branch.protected && (
                          <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
                            {t('branch.protected')}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[var(--text-muted)]">
                        {branch.sha.substring(0, 7)}
                      </div>
                    </div>
                  </div>
                  <a
                    href={branch.url.replace('api.github.com/repos', 'github.com')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded-full text-white"
                  >
                    {t('branch.viewCode')}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-[var(--border-color)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-[var(--text-primary)]"
          >
            {t('branch.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchModal; 