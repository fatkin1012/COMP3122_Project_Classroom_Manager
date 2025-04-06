import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/components/LanguageContext';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{t.howToUseThisPage}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="prose max-w-none">
          <h3 className="text-lg font-semibold">{t.basicFeatures}</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>On this page, you can view all GitHub repositories related to your classroom</li>
            <li>Click on any repository to view detailed information, including commits, issues, and contributor statistics</li>
            <li>Use the search bar at the top to quickly find repositories by name</li>
          </ul>

          <h3 className="text-lg font-semibold">{t.monitoringFeatures}</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>View basic statistics for each repository, such as stars, branches, and views</li>
            <li>Monitor the last update time to understand recent student activity</li>
            <li>Access more in-depth statistics by clicking on a repository to enter its details page</li>
          </ul>

          <h3 className="text-lg font-semibold">{t.reportsAndAnalysis}</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>In the details page, you can view various charts and visualizations</li>
            <li>Analyze student contribution patterns and team collaboration</li>
            <li>Monitor commit frequency and code quality</li>
          </ul>

          <h3 className="text-lg font-semibold">{t.keyboardShortcuts}</h3>
          <ul className="list-disc pl-6">
            <li><strong>Search</strong>: Press <code>Ctrl+F</code> or <code>Cmd+F</code> to quickly focus the search box</li>
            <li><strong>Return to Home</strong>: Click Home in the side navigation or the title</li>
            <li><strong>Refresh Data</strong>: Press <code>F5</code> or click the browser refresh button</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HelpModal; 