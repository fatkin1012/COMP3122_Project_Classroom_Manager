'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

// Define available languages
export type Language = 'en' | 'zh-TW';

// Type for the language context
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

// English translations
const en = {
  // Common
  'app.title': 'GitHub Classroom Tracker',
  'app.loading': 'Loading...',
  
  // Navigation
  'nav.home': 'Home',
  'nav.assignments': 'Assignments',
  'nav.goToClassroom': 'Go to Classroom',
  'nav.help': 'Help',
  'nav.notifications': 'Notifications',
  'nav.settings': 'Settings',
  'nav.logout': 'Logout',

  // Login
  'login.withGithub': 'Login with GitHub',
  'login.connecting': 'Connecting to GitHub...',
  'login.failed': 'Login failed, please try again',
  
  // Assignments
  'assignments.title': 'Assignments',
  'assignments.search': 'Search repositories...',
  'assignments.loading': 'Loading repositories...',
  'assignments.empty': 'No repositories found',
  'assignments.language': 'Not specified',
  'assignments.viewBranches': 'View Branches',
  'assignments.noDescription': 'No description provided',
  'assignments.updated': 'Updated',
  'assignments.today': 'today',
  'assignments.yesterday': 'yesterday',
  'assignments.daysAgo': 'days ago',
  'assignments.monthAgo': 'month ago',
  'assignments.monthsAgo': 'months ago',
  'assignments.yearAgo': 'year ago',
  'assignments.yearsAgo': 'years ago',
  
  // Branch Modal
  'branch.title': 'Repository Branches',
  'branch.loading': 'Loading branches...',
  'branch.empty': 'No branches found',
  'branch.default': 'Default',
  'branch.protected': 'Protected',
  'branch.viewCode': 'View Code',
  'branch.close': 'Close',
  
  // Settings
  'settings.title': 'Settings',
  'settings.theme': 'Theme',
  'settings.theme.light': 'Light',
  'settings.theme.dark': 'Dark',
  'settings.theme.system': 'System',
  'settings.language': 'Language',
  'settings.language.english': 'English',
  'settings.language.chinese': '繁體中文',
  
  // Help
  'help.title': 'GitHub Classroom Tracker User Guide',
  'help.subtitle': 'Comprehensive guide on how to use this platform to track and manage your GitHub Classroom assignments',
  'help.quickStart': 'Quick Start',
  'help.quickStartDesc': 'GitHub Classroom Tracker is a tool that helps teachers track and analyze student group projects on GitHub. Through this platform, you can monitor team collaboration, track contributions, and analyze project progress.',
  'help.connectGitHub': 'Connect Your GitHub',
  'help.connectGitHubDesc': 'Log in through GitHub OAuth to gain access to the Classroom repositories you manage.',
  'help.browseAssignments': 'Browse Assignments',
  'help.browseAssignmentsDesc': 'View all GitHub Classroom assignments relevant to you and their status.',
  'help.analyzeData': 'Analyze Data',
  'help.analyzeDataDesc': 'View detailed analysis of team member contributions, commit frequency, and code quality.',
  'help.teamManagement': 'Team Management',
  'help.teamManagementDesc': 'Understand the contribution situation of each team member, facilitating more fair grading and feedback.',
  'help.faq': 'Frequently Asked Questions',
  'help.faq.viewRecords': 'How do I view submission records for a specific student?',
  'help.faq.viewRecordsDesc': 'After entering the assignment page, click the "Analyze" button, then select a specific student from the contributors list to view their submission records and contribution situation.',
  'help.faq.exportReports': 'How do I export analysis reports?',
  'help.faq.exportReportsDesc': 'In the analysis view, you can see the "Export Report" option, which allows you to export data in PDF format for grading and archiving.',
  'help.faq.switchThemes': 'How do I switch themes?',
  'help.faq.switchThemesDesc': 'Click "Settings" at the bottom of the sidebar, then toggle the dark mode or light mode in the theme options.',
  'help.faq.viewNotifications': 'How do I view notifications?',
  'help.faq.viewNotificationsDesc': 'Click the "Notifications" icon at the bottom of the sidebar to view all assignment-related notifications and updates.',
  'help.moreResources': 'More Resources',
  'help.resources.githubEdu': 'GitHub Education Pack',
  'help.resources.githubDocs': 'GitHub Classroom Documentation',
  'help.resources.githubCommunity': 'GitHub Education Community',
  'help.resources.githubBlog': 'GitHub Education Blog',
  'help.returnHome': 'Return to Home',
  
  // Notifications
  'notifications.title': 'Notifications',
  'notifications.markAllRead': 'Mark All as Read',
  'notifications.clearAll': 'Clear All',
  'notifications.empty': 'No Notifications',
  'notifications.emptyDesc': 'You don\'t have any notifications at the moment',
  'notifications.minutesAgo': 'minutes ago',
  'notifications.hoursAgo': 'hours ago',
  'notifications.daysAgo': 'days ago',
  'notifications.markAsRead': 'Mark as read',
  'notifications.delete': 'Delete',
  'notifications.newAssignment': 'New Assignment Released',
  'notifications.newAssignmentDesc': 'Your course has a new assignment released, please check and complete it.',
  'notifications.assignmentDue': 'Assignment Due Soon',
  'notifications.assignmentDueDesc': 'Your assignment "Data Structures and Algorithms" is due tomorrow, please complete it as soon as possible.',
  'notifications.commentUpdated': 'Comment Updated',
  'notifications.commentUpdatedDesc': 'Your latest submission has received teacher feedback, please check the feedback.',
};

// Traditional Chinese translations
const zhTW = {
  // Common
  'app.title': 'GitHub 教室追蹤器',
  'app.loading': '載入中...',
  
  // Navigation
  'nav.home': '首頁',
  'nav.assignments': '作業',
  'nav.goToClassroom': '前往教室',
  'nav.help': '幫助',
  'nav.notifications': '通知',
  'nav.settings': '設定',
  'nav.logout': '登出',

  // Login
  'login.withGithub': '使用 GitHub 登入',
  'login.connecting': '正在連接到 GitHub...',
  'login.failed': '登入失敗，請重試',
  
  // Assignments
  'assignments.title': '作業',
  'assignments.search': '搜尋儲存庫...',
  'assignments.loading': '載入儲存庫中...',
  'assignments.empty': '找不到儲存庫',
  'assignments.language': '未指定',
  'assignments.viewBranches': '查看分支',
  'assignments.noDescription': '未提供描述',
  'assignments.updated': '更新於',
  'assignments.today': '今天',
  'assignments.yesterday': '昨天',
  'assignments.daysAgo': '天前',
  'assignments.monthAgo': '個月前',
  'assignments.monthsAgo': '個月前',
  'assignments.yearAgo': '年前',
  'assignments.yearsAgo': '年前',
  
  // Branch Modal
  'branch.title': '儲存庫分支',
  'branch.loading': '載入分支中...',
  'branch.empty': '找不到分支',
  'branch.default': '預設',
  'branch.protected': '受保護',
  'branch.viewCode': '查看代碼',
  'branch.close': '關閉',
  
  // Settings
  'settings.title': '設定',
  'settings.theme': '主題',
  'settings.theme.light': '亮色',
  'settings.theme.dark': '暗色',
  'settings.theme.system': '系統',
  'settings.language': '語言',
  'settings.language.english': 'English',
  'settings.language.chinese': '繁體中文',
  
  // Help
  'help.title': 'GitHub 教室追蹤器使用指南',
  'help.subtitle': '全面的指南，介紹如何使用此平台追蹤和管理您的 GitHub 教室作業',
  'help.quickStart': '快速開始',
  'help.quickStartDesc': 'GitHub 教室追蹤器是一個幫助教師追蹤和分析學生 GitHub 上團隊項目的工具。通過此平台，您可以監控團隊協作、追蹤貢獻並分析項目進度。',
  'help.connectGitHub': '連接您的 GitHub',
  'help.connectGitHubDesc': '通過 GitHub OAuth 登入以獲取您管理的教室儲存庫的訪問權限。',
  'help.browseAssignments': '瀏覽作業',
  'help.browseAssignmentsDesc': '查看與您相關的所有 GitHub 教室作業及其狀態。',
  'help.analyzeData': '分析數據',
  'help.analyzeDataDesc': '查看團隊成員貢獻、提交頻率和代碼質量的詳細分析。',
  'help.teamManagement': '團隊管理',
  'help.teamManagementDesc': '了解每個團隊成員的貢獻情況，有助於更公平的評分和反饋。',
  'help.faq': '常見問題',
  'help.faq.viewRecords': '如何查看特定學生的提交記錄？',
  'help.faq.viewRecordsDesc': '進入作業頁面後，點擊「分析」按鈕，然後從貢獻者列表中選擇特定學生，查看其提交記錄和貢獻情況。',
  'help.faq.exportReports': '如何匯出分析報告？',
  'help.faq.exportReportsDesc': '在分析視圖中，您可以看到「匯出報告」選項，可以將數據以 PDF 格式匯出用於評分和存檔。',
  'help.faq.switchThemes': '如何切換主題？',
  'help.faq.switchThemesDesc': '點擊側邊欄底部的「設定」，然後在主題選項中切換暗色或亮色模式。',
  'help.faq.viewNotifications': '如何查看通知？',
  'help.faq.viewNotificationsDesc': '點擊側邊欄底部的「通知」圖標，查看所有與作業相關的通知和更新。',
  'help.moreResources': '更多資源',
  'help.resources.githubEdu': 'GitHub 教育包',
  'help.resources.githubDocs': 'GitHub 教室文檔',
  'help.resources.githubCommunity': 'GitHub 教育社區',
  'help.resources.githubBlog': 'GitHub 教育博客',
  'help.returnHome': '返回首頁',
  
  // Notifications
  'notifications.title': '通知',
  'notifications.markAllRead': '標記所有為已讀',
  'notifications.clearAll': '清除所有',
  'notifications.empty': '無通知',
  'notifications.emptyDesc': '您目前沒有任何通知',
  'notifications.minutesAgo': '分鐘前',
  'notifications.hoursAgo': '小時前',
  'notifications.daysAgo': '天前',
  'notifications.markAsRead': '標記為已讀',
  'notifications.delete': '刪除',
  'notifications.newAssignment': '新作業發布',
  'notifications.newAssignmentDesc': '您的課程發布了新作業，請查看並完成。',
  'notifications.assignmentDue': '作業即將到期',
  'notifications.assignmentDueDesc': '您的「數據結構與算法」作業明天截止，請盡快完成。',
  'notifications.commentUpdated': '評論已更新',
  'notifications.commentUpdatedDesc': '您的最新提交已收到教師反饋，請查看反饋。',
};

// All translations combined
const translations = {
  en,
  'zh-TW': zhTW,
};

// Provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read saved language preference
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh-TW')) {
      setLanguageState(savedLanguage as Language);
      document.documentElement.lang = savedLanguage;
    } else {
      // Try to detect browser language
      const browserLang = navigator.language;
      if (browserLang.startsWith('zh')) {
        setLanguageState('zh-TW');
        document.documentElement.lang = 'zh-TW';
      } else {
        setLanguageState('en');
        document.documentElement.lang = 'en';
      }
    }
  }, []);

  // Set language with side effects
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  // Translation function
  const t = (key: string): string => {
    const currentTranslations = translations[language] || translations.en;
    return currentTranslations[key] || key;
  };

  // Avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext); 