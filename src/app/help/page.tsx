'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CodeBracketIcon,
  UserGroupIcon,
  ChartBarIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '@/context/LanguageContext';

const HelpPage = () => {
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration issues
  if (!mounted) {
    return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">{t('help.title')}</h1>
          <p className="text-lg text-[var(--text-secondary)]">
            {t('help.subtitle')}
          </p>
        </div>

        <div className="bg-[var(--card-background)] text-[var(--card-foreground)] rounded-xl shadow-sm p-8 mb-10 border border-[var(--border-color)]">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">{t('help.quickStart')}</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            {t('help.quickStartDesc')}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="border border-[var(--border-color)] rounded-lg p-6 hover:shadow-md transition-shadow bg-[var(--card-background)]">
              <div className="flex items-center mb-4">
                <CodeBracketIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">{t('help.connectGitHub')}</h3>
              </div>
              <p className="text-[var(--text-secondary)]">
                {t('help.connectGitHubDesc')}
              </p>
            </div>
            
            <div className="border border-[var(--border-color)] rounded-lg p-6 hover:shadow-md transition-shadow bg-[var(--card-background)]">
              <div className="flex items-center mb-4">
                <AcademicCapIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">{t('help.browseAssignments')}</h3>
              </div>
              <p className="text-[var(--text-secondary)]">
                {t('help.browseAssignmentsDesc')}
              </p>
            </div>
            
            <div className="border border-[var(--border-color)] rounded-lg p-6 hover:shadow-md transition-shadow bg-[var(--card-background)]">
              <div className="flex items-center mb-4">
                <ChartBarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">{t('help.analyzeData')}</h3>
              </div>
              <p className="text-[var(--text-secondary)]">
                {t('help.analyzeDataDesc')}
              </p>
            </div>
            
            <div className="border border-[var(--border-color)] rounded-lg p-6 hover:shadow-md transition-shadow bg-[var(--card-background)]">
              <div className="flex items-center mb-4">
                <UserGroupIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">{t('help.teamManagement')}</h3>
              </div>
              <p className="text-[var(--text-secondary)]">
                {t('help.teamManagementDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-background)] text-[var(--card-foreground)] rounded-xl shadow-sm p-8 mb-10 border border-[var(--border-color)]">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">{t('help.faq')}</h2>
          
          <div className="space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                {t('help.faq.viewRecords')}
              </h3>
              <p className="text-[var(--text-secondary)]">
                {t('help.faq.viewRecordsDesc')}
              </p>
            </div>
            
            <div className="border-b border-[var(--border-color)] pb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                {t('help.faq.exportReports')}
              </h3>
              <p className="text-[var(--text-secondary)]">
                {t('help.faq.exportReportsDesc')}
              </p>
            </div>
            
            <div className="border-b border-[var(--border-color)] pb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                {t('help.faq.switchThemes')}
              </h3>
              <p className="text-[var(--text-secondary)]">
                {t('help.faq.switchThemesDesc')}
              </p>
            </div>
            
            <div className="border-b border-[var(--border-color)] pb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                {t('help.faq.viewNotifications')}
              </h3>
              <p className="text-[var(--text-secondary)]">
                {t('help.faq.viewNotificationsDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-background)] text-[var(--card-foreground)] rounded-xl shadow-sm p-8 border border-[var(--border-color)]">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">{t('help.moreResources')}</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="https://education.github.com/pack" className="flex items-center p-4 border border-[var(--border-color)] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <BookOpenIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
              <span className="text-[var(--text-primary)]">{t('help.resources.githubEdu')}</span>
              <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-auto text-gray-400" />
            </Link>
            
            <Link href="https://docs.github.com/en/education/manage-coursework-with-github-classroom" className="flex items-center p-4 border border-[var(--border-color)] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <BookOpenIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
              <span className="text-[var(--text-primary)]">{t('help.resources.githubDocs')}</span>
              <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-auto text-gray-400" />
            </Link>
            
            <Link href="https://github.community/c/education/48" className="flex items-center p-4 border border-[var(--border-color)] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
              <span className="text-[var(--text-primary)]">{t('help.resources.githubCommunity')}</span>
              <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-auto text-gray-400" />
            </Link>
            
            <Link href="https://github.blog/category/education/" className="flex items-center p-4 border border-[var(--border-color)] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <LinkIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
              <span className="text-[var(--text-primary)]">{t('help.resources.githubBlog')}</span>
              <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-auto text-gray-400" />
            </Link>
          </div>
          
          <div className="text-center mt-10">
            <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
              <HomeIcon className="h-5 w-5 mr-2" />
              {t('help.returnHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage; 