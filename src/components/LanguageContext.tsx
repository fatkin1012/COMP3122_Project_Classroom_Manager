'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the structure of our translations
interface Translations {
  // Navbar
  homeLink: string;
  assignmentsLink: string;
  
  // Repository page
  analyze: string;
  analyzing: string;
  teamAnalysis: string;
  aiSummary: string;
  allContributors: string;
  backToAssignments: string;
  
  // Repository Details
  language: string;
  owner: string;
  stars: string;
  forks: string;
  updated: string;
  branches: string;
  contributors: string;
  githubLink: string;
  viewProject: string;
  readme: string;
  
  // Analysis
  summary: string;
  commits: string;
  issues: string;
  pullRequests: string;
  viewMore: string;
  
  // Settings
  settings: string;
  colorTheme: string;
  light: string;
  dark: string;
  system: string;
  languageSettings: string;
  otherSettings: string;
  emailNotifications: string;
  autoRefreshData: string;
  cancel: string;
  saveSettings: string;
  
  // Help modal
  howToUseThisPage: string;
  basicFeatures: string;
  monitoringFeatures: string;
  reportsAndAnalysis: string;
  keyboardShortcuts: string;
  
  // Notifications modal
  latestUpdates: string;
  viewAllUpdates: string;
}

// Define available languages
export type Language = 'en' | 'zh-TW' | 'zh-CN' | 'ja';

// Define the English translations (default)
const englishTranslations: Translations = {
  // Navbar
  homeLink: 'Home',
  assignmentsLink: 'Assignments',
  
  // Repository page
  analyze: 'Analyze',
  analyzing: 'Analyzing...',
  teamAnalysis: 'Team Analysis',
  aiSummary: 'AI Summary',
  allContributors: 'All Contributors',
  backToAssignments: '← Back to Assignments',
  
  // Repository Details
  language: 'Language',
  owner: 'Owner',
  stars: 'stars',
  forks: 'forks',
  updated: 'Updated',
  branches: 'Branches',
  contributors: 'Contributors',
  githubLink: 'GitHub Link',
  viewProject: 'View Project',
  readme: 'README',
  
  // Analysis
  summary: 'Summary',
  commits: 'Commits',
  issues: 'Issues',
  pullRequests: 'Pull Requests',
  viewMore: 'View More',
  
  // Settings
  settings: 'Settings',
  colorTheme: 'Color Theme',
  light: 'Light',
  dark: 'Dark',
  system: 'System',
  languageSettings: 'Language',
  otherSettings: 'Other Settings',
  emailNotifications: 'Email Notifications',
  autoRefreshData: 'Auto-refresh Data',
  cancel: 'Cancel',
  saveSettings: 'Save Settings',
  
  // Help modal
  howToUseThisPage: 'How to Use This Page',
  basicFeatures: 'Basic Features',
  monitoringFeatures: 'Monitoring Features',
  reportsAndAnalysis: 'Reports and Analysis',
  keyboardShortcuts: 'Keyboard Shortcuts',
  
  // Notifications modal
  latestUpdates: 'Latest Updates',
  viewAllUpdates: 'View All Updates'
};

// Define Traditional Chinese translations
const traditionalChineseTranslations: Translations = {
  // Navbar
  homeLink: '首頁',
  assignmentsLink: '作業',
  
  // Repository page
  analyze: '分析',
  analyzing: '分析中...',
  teamAnalysis: '團隊分析',
  aiSummary: 'AI 摘要',
  allContributors: '所有貢獻者',
  backToAssignments: '← 返回作業列表',
  
  // Repository Details
  language: '語言',
  owner: '擁有者',
  stars: '星標',
  forks: '分支',
  updated: '更新於',
  branches: '分支',
  contributors: '貢獻者',
  githubLink: 'GitHub 連結',
  viewProject: '查看專案',
  readme: '說明文件',
  
  // Analysis
  summary: '摘要',
  commits: '提交',
  issues: '問題',
  pullRequests: '合併請求',
  viewMore: '查看更多',
  
  // Settings
  settings: '設定',
  colorTheme: '顏色主題',
  light: '淺色',
  dark: '深色',
  system: '跟隨系統',
  languageSettings: '語言',
  otherSettings: '其他設定',
  emailNotifications: '電子郵件通知',
  autoRefreshData: '自動刷新資料',
  cancel: '取消',
  saveSettings: '儲存設定',
  
  // Help modal
  howToUseThisPage: '如何使用此頁面',
  basicFeatures: '基本功能',
  monitoringFeatures: '監控功能',
  reportsAndAnalysis: '報告和分析',
  keyboardShortcuts: '快捷鍵',
  
  // Notifications modal
  latestUpdates: '最新更新',
  viewAllUpdates: '查看所有更新'
};

// Define Simplified Chinese translations
const simplifiedChineseTranslations: Translations = {
  // Navbar
  homeLink: '首页',
  assignmentsLink: '作业',
  
  // Repository page
  analyze: '分析',
  analyzing: '分析中...',
  teamAnalysis: '团队分析',
  aiSummary: 'AI 摘要',
  allContributors: '所有贡献者',
  backToAssignments: '← 返回作业列表',
  
  // Repository Details
  language: '语言',
  owner: '拥有者',
  stars: '星标',
  forks: '分支',
  updated: '更新于',
  branches: '分支',
  contributors: '贡献者',
  githubLink: 'GitHub 链接',
  viewProject: '查看项目',
  readme: '说明文档',
  
  // Analysis
  summary: '摘要',
  commits: '提交',
  issues: '问题',
  pullRequests: '合并请求',
  viewMore: '查看更多',
  
  // Settings
  settings: '设置',
  colorTheme: '颜色主题',
  light: '浅色',
  dark: '深色',
  system: '跟随系统',
  languageSettings: '语言',
  otherSettings: '其他设置',
  emailNotifications: '电子邮件通知',
  autoRefreshData: '自动刷新数据',
  cancel: '取消',
  saveSettings: '保存设置',
  
  // Help modal
  howToUseThisPage: '如何使用此页面',
  basicFeatures: '基本功能',
  monitoringFeatures: '监控功能',
  reportsAndAnalysis: '报告和分析',
  keyboardShortcuts: '快捷键',
  
  // Notifications modal
  latestUpdates: '最新更新',
  viewAllUpdates: '查看所有更新'
};

// Define Japanese translations
const japaneseTranslations: Translations = {
  // Navbar
  homeLink: 'ホーム',
  assignmentsLink: '課題',
  
  // Repository page
  analyze: '分析',
  analyzing: '分析中...',
  teamAnalysis: 'チーム分析',
  aiSummary: 'AI要約',
  allContributors: '全ての貢献者',
  backToAssignments: '← 課題リストに戻る',
  
  // Repository Details
  language: '言語',
  owner: 'オーナー',
  stars: 'スター',
  forks: 'フォーク',
  updated: '更新日',
  branches: 'ブランチ',
  contributors: '貢献者',
  githubLink: 'GitHubリンク',
  viewProject: 'プロジェクトを表示',
  readme: 'README',
  
  // Analysis
  summary: '概要',
  commits: 'コミット',
  issues: '課題',
  pullRequests: 'プルリクエスト',
  viewMore: '詳細を見る',
  
  // Settings
  settings: '設定',
  colorTheme: 'カラーテーマ',
  light: 'ライト',
  dark: 'ダーク',
  system: 'システム設定に従う',
  languageSettings: '言語',
  otherSettings: 'その他の設定',
  emailNotifications: 'メール通知',
  autoRefreshData: '自動データ更新',
  cancel: 'キャンセル',
  saveSettings: '設定を保存',
  
  // Help modal
  howToUseThisPage: 'このページの使い方',
  basicFeatures: '基本機能',
  monitoringFeatures: '監視機能',
  reportsAndAnalysis: 'レポートと分析',
  keyboardShortcuts: 'キーボードショートカット',
  
  // Notifications modal
  latestUpdates: '最新の更新',
  viewAllUpdates: 'すべての更新を表示'
};

// Map of all translations
const translations: Record<Language, Translations> = {
  'en': englishTranslations,
  'zh-TW': traditionalChineseTranslations,
  'zh-CN': simplifiedChineseTranslations,
  'ja': japaneseTranslations
};

// Define the context shape
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create a provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [t, setT] = useState<Translations>(translations['en']);

  useEffect(() => {
    // Get saved language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem('language') as Language || 'en';
    setLanguage(savedLanguage);
    setT(translations[savedLanguage]);
  }, []);

  // Update translations when language changes
  useEffect(() => {
    setT(translations[language]);
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 