'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ShoppingBagIcon,
  ViewColumnsIcon,
  CodeBracketIcon,
  StarIcon,
  ArrowPathIcon,
  ClockIcon,
  UserIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartPieIcon,
  LinkIcon,
  BookOpenIcon,
  XMarkIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tooltip as TippyTooltip } from 'react-tippy';
import 'react-tippy/dist/tippy.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useParams } from 'next/navigation';

const ORGANIZATION = process.env.NEXT_PUBLIC_GITHUB_ORGANIZATION || '23101659d';

interface Branch {
  name: string;
  commitSha: string;
  commitUrl: string;
}

interface RepositoryDetails {
  name: string;
  description: string;
  owner: string;
  lastUpdated: string;
  stars: number;
  forks: number;
  language: string;
  branchCount: number;
  contributors: number;
  html_url: string;
  readme?: string;
}

interface CommitData {
  author: string;
  date: string;
  message: string;
  sha: string;
  parents?: { sha: string }[];
  timeSpent?: string;
}

interface CommitAuthor {
  login: string;
}

interface AnalysisData {
  commits: CommitData[];
  issues: {
    title: string;
    state: string;
    created_at: string;
    user: { login: string };
    number: number;
  }[];
  contributors: {
    login: string;
    contributions: number;
    additions: number;
    deletions: number;
    timeSpent?: string;
  }[];
  pullRequests: {
    title: string;
    state: string;
    created_at: string;
    user: { login: string };
    number: number;
  }[];
}

interface ViewMoreModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

const ViewMoreModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showDownload?: boolean;
  repoName?: string;
  details?: RepositoryDetails;
  filteredData?: AnalysisData;
  deadlineFighters?: Record<string, number>;
  contributionsByUser?: Record<string, number>;
  topContributors?: [string, number][];
}> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showDownload,
  repoName,
  details,
  filteredData,
  deadlineFighters,
  contributionsByUser,
  topContributors
}) => {
  const contentRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    try {
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let y = margin;

      // Add header
      pdf.setFontSize(24);
      pdf.setTextColor(37, 99, 235); // Blue-600
      pdf.text(`Repository Report: ${repoName}`, pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Add date and organization
      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81); // Gray-700
      pdf.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, margin, y);
      pdf.text(`Organization: ${ORGANIZATION}`, pageWidth - margin, y, { align: 'right' });
      y += 10;

      // Add horizontal line
      pdf.setDrawColor(156, 163, 175); // Gray-400
      pdf.line(margin, y, pageWidth - margin, y);
      y += 15;

      // Add description if available
      if (details?.description) {
        pdf.setFontSize(14);
        pdf.setTextColor(37, 99, 235);
        pdf.text('Project Description', margin, y);
        y += 10;

        pdf.setFontSize(12);
        pdf.setTextColor(55, 65, 81);
        const descriptionLines = pdf.splitTextToSize(details.description, pageWidth - 2 * margin);
        pdf.text(descriptionLines, margin, y);
        y += descriptionLines.length * 7 + 15;
      }

      // Add Summary section
      pdf.setFontSize(16);
      pdf.setTextColor(37, 99, 235);
      pdf.text('Summary', margin, y);
      y += 10;

      // Create summary table
      const summaryData = [
        ['Total Commits', filteredData?.commits.length || 0],
        ['Total Issues', filteredData?.issues.length || 0],
        ['Total Pull Requests', filteredData?.pullRequests.length || 0],
        ['Total Contributors', filteredData?.contributors.length || 0]
      ];

      // Draw summary table
      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      const cellWidth = (pageWidth - 2 * margin) / 2;
      const cellHeight = 10;

      summaryData.forEach(([label, value], index) => {
        if (y > pageHeight - margin - cellHeight) {
          pdf.addPage();
          y = margin;
        }
        
        // Draw cell borders
        pdf.setDrawColor(209, 213, 219); // Gray-300
        pdf.rect(margin, y, cellWidth, cellHeight);
        pdf.rect(margin + cellWidth, y, cellWidth, cellHeight);
        
        // Add text
        pdf.text(String(label), margin + 5, y + 7);
        pdf.text(String(value), margin + cellWidth + 5, y + 7, { align: 'right' });
        y += cellHeight;
      });
      y += 15;

      // Add Individual Contributions section
      pdf.setFontSize(16);
      pdf.setTextColor(37, 99, 235);
      pdf.text('Individual Contributions', margin, y);
      y += 10;

      // Create contributions table
      const tableData = filteredData?.contributors.map(contributor => [
        contributor.login,
        contributor.contributions,
        filteredData.issues.filter(i => i.user.login === contributor.login).length,
        filteredData.pullRequests.filter(pr => pr.user.login === contributor.login).length,
        contributor.additions || 0,
        contributor.deletions || 0,
        contributor.timeSpent || 'N/A'
      ]) || [];

      // Draw contributions table
      const headers = ['Contributor', 'Commits', 'Issues', 'PRs', 'Additions', 'Deletions', 'Time Spent'];
      const colWidths = [40, 20, 20, 20, 25, 25, 30];
      
      // Draw table header
      if (y > pageHeight - margin - cellHeight) {
        pdf.addPage();
        y = margin;
      }
      
      pdf.setFontSize(12);
      pdf.setTextColor(37, 99, 235);
      let x = margin;
      headers.forEach((header, i) => {
        pdf.text(String(header), x + 5, y + 7);
        x += colWidths[i];
      });
      y += cellHeight;

      // Draw table rows
      pdf.setFontSize(11);
      pdf.setTextColor(55, 65, 81);
      tableData.forEach(row => {
        if (y > pageHeight - margin - cellHeight) {
          pdf.addPage();
          y = margin;
        }
        
        x = margin;
        row.forEach((cell, i) => {
          pdf.setDrawColor(209, 213, 219);
          pdf.rect(x, y, colWidths[i], cellHeight);
          pdf.text(String(cell), x + 5, y + 7);
          x += colWidths[i];
        });
        y += cellHeight;
      });
      y += 15;

      // Add Potential Issues section
      pdf.setFontSize(16);
      pdf.setTextColor(37, 99, 235);
      pdf.text('Potential Issues', margin, y);
      y += 10;

      // Deadline Fighters
      pdf.setFontSize(14);
      pdf.setTextColor(202, 138, 4); // Yellow-600
      pdf.text('Deadline Fighters:', margin, y);
      y += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      const deadlineFightersList = deadlineFighters ? Object.entries(deadlineFighters)
        .filter(([_, count]) => count > 5)
        .map(([author]) => author) : [];

      if (deadlineFightersList.length > 0) {
        deadlineFightersList.forEach(fighter => {
          if (y > pageHeight - margin - cellHeight) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(`• ${fighter}`, margin + 5, y + 7);
          y += cellHeight;
        });
      } else {
        pdf.text('No deadline fighters detected', margin + 5, y + 7);
        y += cellHeight;
      }
      y += 10;

      // Free Riders
      pdf.setFontSize(14);
      pdf.setTextColor(220, 38, 38); // Red-600
      pdf.text('Free Riders:', margin, y);
      y += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      const freeRiders = contributionsByUser ? Object.entries(contributionsByUser)
        .filter(([_, count]) => count < 3)
        .map(([author]) => author) : [];

      if (freeRiders.length > 0) {
        freeRiders.forEach(rider => {
          if (y > pageHeight - margin - cellHeight) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(`• ${rider}`, margin + 5, y + 7);
          y += cellHeight;
        });
      } else {
        pdf.text('No free riders detected', margin + 5, y + 7);
        y += cellHeight;
      }
      y += 15;

      // Add Leaderboard section
      pdf.setFontSize(16);
      pdf.setTextColor(37, 99, 235);
      pdf.text('Leaderboard', margin, y);
      y += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      pdf.text('Top 5 Contributors:', margin, y);
      y += 10;

      (topContributors || []).forEach(([author, count], index) => {
        if (y > pageHeight - margin - cellHeight) {
          pdf.addPage();
          y = margin;
        }
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
        pdf.text(`${medal} ${author}: ${count} commits`, margin + 5, y + 7);
        y += cellHeight;
      });
      y += 15;

      // Add Statistics section
      pdf.setFontSize(16);
      pdf.setTextColor(37, 99, 235);
      pdf.text('Statistics', margin, y);
      y += 10;

      // Issue Status Distribution
      const openIssues = filteredData?.issues.filter(i => i.state === 'open').length || 0;
      const closedIssues = filteredData?.issues.filter(i => i.state === 'closed').length || 0;

      pdf.setFontSize(14);
      pdf.setTextColor(37, 99, 235);
      pdf.text('Issue Status Distribution:', margin, y);
      y += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      
      // Draw issue status table
      const issueData = [
        ['Open Issues', openIssues],
        ['Closed Issues', closedIssues]
      ];

      issueData.forEach(([label, value]) => {
        if (y > pageHeight - margin - cellHeight) {
          pdf.addPage();
          y = margin;
        }
        
        pdf.setDrawColor(209, 213, 219);
        pdf.rect(margin, y, cellWidth, cellHeight);
        pdf.rect(margin + cellWidth, y, cellWidth, cellHeight);
        
        pdf.text(String(label), margin + 5, y + 7);
        pdf.text(String(value), margin + cellWidth + 5, y + 7, { align: 'right' });
        y += cellHeight;
      });
      y += 15;

      // Add Additional Information section
      pdf.setFontSize(16);
      pdf.setTextColor(37, 99, 235);
      pdf.text('Additional Information', margin, y);
      y += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      
      const additionalInfo = [
        'Data Source: GitHub API',
        'Note: Data may be incomplete due to API rate limits',
        'For detailed visualizations, please refer to the web interface'
      ];

      additionalInfo.forEach(info => {
        if (y > pageHeight - margin - cellHeight) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(String(info), margin, y + 7);
        y += cellHeight;
      });

      // Add footer
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // Gray-500
      pdf.text('Generated by GitHub Classroom Tracker', pageWidth / 2, pageHeight - margin, { align: 'center' });

      // Save PDF
      pdf.save(`repository-report-${repoName}-${new Date().toISOString().slice(0, 10)}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-lg p-8 max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6" data-html2canvas-ignore>
          <h2 className="text-3xl font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-4">
            {showDownload && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDownloadPDF();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>
        <div 
          ref={contentRef} 
          className="space-y-8 bg-white p-8 rounded-lg"
          style={{ backgroundColor: '#ffffff' }}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper function to check if commit has login-style author
const isCommitWithLogin = (commit: any): boolean => {
  return (
    commit &&
    typeof commit.author === 'object' &&
    commit.author !== null &&
    typeof commit.author.login === 'string'
  );
};

export default function RepositoryDetailsPage() {
  const params = useParams();
  const repoName = params.repo as string;
  
  const [details, setDetails] = useState<RepositoryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showIssuesModal, setShowIssuesModal] = useState(false);
  const [showCommitsModal, setShowCommitsModal] = useState(false);
  const [showPullsModal, setShowPullsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showIssueStatusModal, setShowIssueStatusModal] = useState(false);
  const [showContributorsModal, setShowContributorsModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedContributor, setSelectedContributor] = useState<string>('all');

  // Filter data based on selected contributor
  const filteredData = useMemo(() => {
    if (!analysisData || selectedContributor === 'all') {
      return analysisData;
    }

    return {
      ...analysisData,
      commits: analysisData.commits.filter(commit => commit.author === selectedContributor),
      issues: analysisData.issues.filter(issue => issue.user.login === selectedContributor),
      pullRequests: analysisData.pullRequests.filter(pr => pr.user.login === selectedContributor),
      contributors: analysisData.contributors.filter(contributor => contributor.login === selectedContributor)
    };
  }, [analysisData, selectedContributor]);

  // Calculate contribution metrics
  const contributionsByUser = useMemo(() => {
    if (!filteredData?.commits) return {};
    return filteredData.commits.reduce((acc: Record<string, number>, commit) => {
      acc[commit.author] = (acc[commit.author] || 0) + 1;
      return acc;
    }, {});
  }, [filteredData?.commits]);

  // Calculate deadline fighters
  const deadlineFighters = useMemo(() => {
    if (!filteredData?.commits) return {};
    const lastDay = new Date();
    lastDay.setDate(lastDay.getDate() - 1);
    return filteredData.commits
      .filter(commit => new Date(commit.date) > lastDay)
      .reduce((acc: Record<string, number>, commit) => {
        acc[commit.author] = (acc[commit.author] || 0) + 1;
        return acc;
      }, {});
  }, [filteredData?.commits]);

  // Calculate top contributors
  const topContributors = useMemo(() => {
    if (!contributionsByUser) return [];
    return Object.entries(contributionsByUser)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [contributionsByUser]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`/api/repositories/${repoName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch repository details');
        }
        const data = await response.json();
        setDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [repoName]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`/api/repositories/${repoName}/branches`);
        if (!response.ok) {
          throw new Error('Failed to fetch branches');
        }
        const data = await response.json();
        setBranches(data);
      } catch (err) {
        console.error('Error fetching branches:', err);
      }
    };

    fetchBranches();
  }, [repoName]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const [commitsRes, issuesRes, contributorsRes, pullsRes] = await Promise.all([
        fetch(`/api/repositories/${repoName}/commits`),
        fetch(`/api/repositories/${repoName}/issues`),
        fetch(`/api/repositories/${repoName}/contributors`),
        fetch(`/api/repositories/${repoName}/pulls`),
      ]);

      if (!commitsRes.ok || !issuesRes.ok || !contributorsRes.ok || !pullsRes.ok) {
        const errorResponses = await Promise.all([
          commitsRes.ok ? null : commitsRes.text(),
          issuesRes.ok ? null : issuesRes.text(),
          contributorsRes.ok ? null : contributorsRes.text(),
          pullsRes.ok ? null : pullsRes.text(),
        ]);
        
        const errors = errorResponses
          .map((res, index) => {
            if (!res) return null;
            const endpoints = ['commits', 'issues', 'contributors', 'pulls'];
            return `${endpoints[index]}: ${res}`;
          })
          .filter(Boolean)
          .join(', ');

        throw new Error(`Failed to fetch analysis data: ${errors}`);
      }

      const [commits, issues, contributors, pullRequests] = await Promise.all([
        commitsRes.json(),
        issuesRes.json(),
        contributorsRes.json(),
        pullsRes.json(),
      ]);

      // Calculate time spent for each contributor
      const contributorsWithTime = contributors.map((contributor: { login: string; additions: number; deletions: number; [key: string]: any }) => {
        // Filter commits by matching either author.login or commit.author.name
        const userCommits = commits.filter((commit: any) => {
          const authorLogin = commit.author?.login || commit.author;
          const authorName = commit.commit?.author?.name;
          return authorLogin === contributor.login || authorName === contributor.login;
        });
        
        if (userCommits.length === 0) {
          return { ...contributor, timeSpent: '0 minutes' };
        }

        // Calculate total time based on:
        // 1. Base time: 15 minutes per commit
        // 2. Additional time: 1 hour per 100 lines of code changed
        const baseTimeMinutes = userCommits.length * 15;
        const totalChanges = (contributor.additions || 0) + (contributor.deletions || 0);
        const changeTimeMinutes = Math.round((totalChanges / 100) * 60); // 1 hour = 60 minutes per 100 lines

        // Total time in minutes
        const totalMinutes = baseTimeMinutes + changeTimeMinutes;

        // Format time based on duration
        if (totalMinutes >= 10080) { // More than 1 week (7 * 24 * 60 = 10080 minutes)
          const weeks = Math.floor(totalMinutes / 10080);
          const remainingDays = Math.floor((totalMinutes % 10080) / 1440); // 1440 = 24 * 60
          return { ...contributor, timeSpent: `${weeks}w ${remainingDays}d` };
        } else if (totalMinutes >= 1440) { // More than 1 day
          const days = Math.floor(totalMinutes / 1440);
          const remainingHours = Math.floor((totalMinutes % 1440) / 60);
          return { ...contributor, timeSpent: `${days}d ${remainingHours}h` };
        } else if (totalMinutes >= 60) { // More than 1 hour
          const hours = Math.floor(totalMinutes / 60);
          const remainingMinutes = totalMinutes % 60;
          return { ...contributor, timeSpent: `${hours}h ${remainingMinutes}m` };
        } else {
          return { ...contributor, timeSpent: `${totalMinutes}m` };
        }
      });

      setAnalysisData({ 
        commits, 
        issues, 
        contributors: contributorsWithTime, 
        pullRequests 
      });
      setShowAnalysis(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze repository');
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const renderIssueItem = (issue: any) => (
    <div key={issue.title} className="border-b border-gray-100 pb-4 last:border-b-0">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">{issue.title}</h4>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs ${
            issue.state === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {issue.state}
          </span>
          <a
            href={`https://github.com/${ORGANIZATION}/${repoName}/issues/${issue.number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800"
          >
            <LinkIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        by {issue.user.login} • {new Date(issue.created_at).toLocaleDateString()}
      </p>
    </div>
  );

  const renderCommitItem = (commit: any) => (
    <div key={commit.sha} className="border-b border-gray-100 pb-4 last:border-b-0">
      <p className="font-medium text-gray-900">{commit.message}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-sm text-gray-500">
          by {commit.author} • {new Date(commit.date).toLocaleDateString()}
        </p>
        <a
          href={`https://github.com/${ORGANIZATION}/${repoName}/commit/${commit.sha}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-800"
        >
          <LinkIcon className="h-5 w-5" />
        </a>
      </div>
    </div>
  );

  const renderPullRequestItem = (pr: any) => (
    <div key={pr.title} className="border-b border-gray-100 pb-4 last:border-b-0">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">{pr.title}</h4>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs ${
            pr.state === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {pr.state}
          </span>
          <a
            href={`https://github.com/${ORGANIZATION}/${repoName}/pull/${pr.number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800"
          >
            <LinkIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        by {pr.user.login} • {new Date(pr.created_at).toLocaleDateString()}
      </p>
    </div>
  );

  const renderAnalytics = (): React.ReactNode => {
    if (!filteredData) return <div>No analysis data available</div>;

    const contributors = filteredData.contributors;
    const commits = filteredData.commits;
    
    // Calculate contribution metrics
    const totalCommits = commits.length;
    const contributionsByUser = commits.reduce((acc: Record<string, number>, commit) => {
      acc[commit.author] = (acc[commit.author] || 0) + 1;
      return acc;
    }, {});

    // Identify deadline fighters (users who made many commits in the last 24 hours)
    const lastDay = new Date();
    lastDay.setDate(lastDay.getDate() - 1);
    const deadlineFighters = commits
      .filter(commit => new Date(commit.date) > lastDay)
      .reduce((acc: Record<string, number>, commit) => {
        acc[commit.author] = (acc[commit.author] || 0) + 1;
        return acc;
      }, {});

    const deadlineFightersList = Object.entries(deadlineFighters)
      .filter(([_, count]) => count > 5)
      .map(([author]) => author);

    // Identify free riders (users with very few contributions)
    const freeRiders = Object.entries(contributionsByUser)
      .filter(([_, count]) => count < 3)
      .map(([author]) => author);

    // Calculate top contributors
    const topContributors = Object.entries(contributionsByUser)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Deadline Fighters Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-yellow-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Deadline Fighters</h4>
            </div>
            {deadlineFightersList.length > 0 ? (
              <ul className="space-y-3">
                {deadlineFightersList.map(fighter => (
                  <li key={fighter} className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    <span className="text-gray-700 break-all">
                      @{fighter}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No deadline fighters detected</p>
            )}
          </div>

          {/* Free Riders Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-red-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Free Riders</h4>
            </div>
            <ul className="space-y-3">
              {freeRiders.map(rider => (
                <li key={rider} className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-gray-700 break-all">
                    @{rider}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Contributors Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-yellow-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <TrophyIcon className="h-6 w-6 text-yellow-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Top Contributors</h4>
            </div>
            <ol className="space-y-3">
              {topContributors.map(([author, count], index) => (
                <li key={author} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <span className="text-lg flex-shrink-0">
                      {index === 0 && "🥇"}
                      {index === 1 && "🥈"}
                      {index === 2 && "🥉"}
                      {index > 2 && "🏅"}
                    </span>
                    <span className="text-gray-700 break-all">
                      @{author}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                    {count} {count === 1 ? 'commit' : 'commits'}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-sm text-gray-500">Total Commits</div>
              <div className="text-2xl font-bold text-gray-800">{totalCommits}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Contributors</div>
              <div className="text-2xl font-bold text-gray-800">{Object.keys(contributionsByUser).length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Avg. Commits/Person</div>
              <div className="text-2xl font-bold text-gray-800">
                {Math.round(totalCommits / Object.keys(contributionsByUser).length)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderIssueStatusChart = () => (
    <div className="space-y-4">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[
                { name: 'Open', value: filteredData?.issues.filter(i => i.state === 'open').length || 0 },
                { name: 'Closed', value: filteredData?.issues.filter(i => i.state === 'closed').length || 0 }
              ]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, value }) => `${name}: ${value}`}
            >
              <Cell fill="#82ca9d" />
              <Cell fill="#ffc658" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center text-sm text-gray-500">
        Total Issues: {filteredData?.issues.length || 0}
      </div>
    </div>
  );

  const renderContributorsChart = () => {
    if (!filteredData?.contributors) return null;

    const contributorsData = filteredData.contributors.map(contributor => ({
      name: contributor.login,
      commits: contributor.contributions,
      additions: contributor.additions || 0,
      deletions: contributor.deletions || 0,
      timeSpent: contributor.timeSpent || '0 minutes'
    }));

    return (
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contributor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contributorsData.map((contributor) => (
                <tr key={contributor.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">@{contributor.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contributor.commits}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <span className="text-green-600">+{contributor.additions}</span>
                      <span className="mx-1">/</span>
                      <span className="text-red-600">-{contributor.deletions}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contributor.timeSpent}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={contributorsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="commits" name="Commits" fill="#3b82f6" />
              <Bar yAxisId="right" dataKey="additions" name="Additions" fill="#10b981" />
              <Bar yAxisId="right" dataKey="deletions" name="Deletions" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white p-6">
          <div className="text-2xl font-bold mb-10">GitHub Classroom Tracker</div>
          <nav className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
              <HomeIcon className="h-6 w-6" />
              <span>Home</span>
            </Link>
            {[
              { icon: <ShoppingBagIcon className="h-6 w-6" />, text: 'Assignments', href: '/assignment' }
            ].map((item) => (
              <Link key={item.text} href={item.href} className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
                {item.icon}
                <span>{item.text}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6">
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
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/assignment"
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Assignments
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">{repoName}</h1>
          </div>
          <div className="flex space-x-4">
            {!showAnalysis && (
              <button 
                onClick={handleAnalyze}
                disabled={analyzing}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  analyzing 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <ChartPieIcon className="h-5 w-5" />
                <span>{analyzing ? 'Analyzing...' : 'Analyze'}</span>
              </button>
            )}
            {showAnalysis && (
              <>
                <button
                  onClick={() => setShowAnalyticsModal(true)}
                  className="px-4 py-2 rounded-lg flex items-center space-x-2 bg-green-600 text-white hover:bg-green-700"
                >
                  <UsersIcon className="h-5 w-5" />
                  <span>Team Analysis</span>
                </button>
                {filteredData && (
                  <div className="relative">
                    <select
                      value={selectedContributor}
                      onChange={(e) => setSelectedContributor(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Contributors</option>
                      {filteredData.contributors.map(contributor => (
                        <option key={contributor.login} value={contributor.login}>
                          @{contributor.login}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
            <button className="p-2 rounded-full hover:bg-gray-200">
              <QuestionMarkCircleIcon className="h-6 w-6 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200">
              <BellIcon className="h-6 w-6 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200">
              <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
            </button>
            <button className="p-2 rounded-full bg-gray-200">
              <span className="font-medium text-gray-700">JD</span>
            </button>
          </div>
        </div>

        {/* Repository Details */}
        {details && (
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <CodeBracketIcon className="h-6 w-6 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-800">{details.name}</h2>
                  </div>
                  <p className="text-gray-600 mt-2">{details.description}</p>
                </div>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                  {details.language}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">{details.owner}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <StarIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">{details.stars} stars</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowPathIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">{details.forks} forks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">
                    Updated {new Date(details.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center space-x-3">
                  <ChartBarIcon className="h-8 w-8 text-gray-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-800">2</div>
                    <div className="text-sm text-gray-500">Branches</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center space-x-3">
                  <UsersIcon className="h-8 w-8 text-gray-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{details.contributors}</div>
                    <div className="text-sm text-gray-500">Contributors</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center space-x-3">
                  <LinkIcon className="h-8 w-8 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">GitHub Link</div>
                    <a
                      href={details.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Project
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Add README section after Statistics Cards */}
            {details && details.readme && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <BookOpenIcon className="h-6 w-6 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">README</h2>
                </div>
                <div className="prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {details.readme}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Analysis Section */}
            {showAnalysis && filteredData && (
              <div className="space-y-6">
                {/* Summary and Contributors Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Summary Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
                  >
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Summary</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-500">📝</span>
                        <p className="text-gray-700">Commits: <span className="font-medium">{filteredData.commits.length}</span></p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-500">⚠️</span>
                        <p className="text-gray-700">Issues: <span className="font-medium">{filteredData.issues.length}</span></p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">🔄</span>
                        <p className="text-gray-700">Pull Requests: <span className="font-medium">{filteredData.pullRequests.length}</span></p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Contributors Analysis */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">Contributors</h3>
                      <button
                        onClick={() => setShowContributorsModal(true)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        title="View Contribution Statistics"
                      >
                        <ChartBarIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {filteredData?.contributors.slice(0, 5).map((contributor, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="border-b border-gray-100 pb-4 last:border-0"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              <a
                                href={`https://github.com/${contributor.login}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 hover:underline"
                              >
                                @{contributor.login}
                              </a>
                            </h4>
                            <span className="text-sm text-gray-500">{contributor.contributions} commits</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-sm text-gray-500">
                              <span className="text-green-600">+{contributor.additions || 0}</span>
                              <span className="mx-1">/</span>
                              <span className="text-red-600">-{contributor.deletions || 0}</span>
                              <span className="ml-1 text-xs text-gray-400">(added/removed)</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Activity Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pull Requests */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">Pull Requests</h3>
                      {filteredData?.pullRequests && filteredData.pullRequests.length > 4 && (
                        <button
                          onClick={() => setShowPullsModal(true)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View More
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {filteredData?.pullRequests?.slice(0, 4).map(pr => renderPullRequestItem(pr))}
                    </div>
                  </div>

                  {/* Issues */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">                      
                      <h3 className="text-xl font-semibold text-gray-800">Issues</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowIssueStatusModal(true)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          title="View Issue Statistics"
                        >
                          <ChartBarIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                        </button>
                        {filteredData?.issues && filteredData.issues.length > 4 && (
                          <button
                            onClick={() => setShowIssuesModal(true)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View More
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {filteredData?.issues?.slice(0, 4).map(issue => renderIssueItem(issue))}
                    </div>
                  </div>

                  {/* Commits */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">Commits</h3>
                      {filteredData?.commits && filteredData.commits.length > 4 && (
                        <button
                          onClick={() => setShowCommitsModal(true)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View More
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {filteredData?.commits?.slice(0, 4).map(commit => renderCommitItem(commit))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <AnimatePresence>
          {showIssuesModal && (
            <ViewMoreModal
              isOpen={showIssuesModal}
              onClose={() => setShowIssuesModal(false)}
              title="All Issues"
            >
              {filteredData?.issues.map(issue => renderIssueItem(issue))}
            </ViewMoreModal>
          )}

          {showCommitsModal && (
            <ViewMoreModal
              isOpen={showCommitsModal}
              onClose={() => setShowCommitsModal(false)}
              title="All Commits"
            >
              {filteredData?.commits.map(commit => renderCommitItem(commit))}
            </ViewMoreModal>
          )}

          {showPullsModal && (
            <ViewMoreModal
              isOpen={showPullsModal}
              onClose={() => setShowPullsModal(false)}
              title="All Pull Requests"
            >
              {filteredData?.pullRequests.map(pr => renderPullRequestItem(pr))}
            </ViewMoreModal>
          )}

          {showAnalyticsModal && (
            <ViewMoreModal
              isOpen={showAnalyticsModal}
              onClose={() => setShowAnalyticsModal(false)}
              title="Team Analysis"
              showDownload={true}
              repoName={repoName}
              details={details || undefined}
              filteredData={filteredData || undefined}
              deadlineFighters={deadlineFighters}
              contributionsByUser={contributionsByUser}
              topContributors={topContributors}
            >
              {renderAnalytics()}
            </ViewMoreModal>
          )}

          {showIssueStatusModal && (
            <ViewMoreModal
              isOpen={showIssueStatusModal}
              onClose={() => setShowIssueStatusModal(false)}
              title="Issue Status Distribution"
              repoName={repoName}
              details={details || undefined}
              filteredData={filteredData || undefined}
            >
              {renderIssueStatusChart()}
            </ViewMoreModal>
          )}

          {showContributorsModal && (
            <ViewMoreModal
              isOpen={showContributorsModal}
              onClose={() => setShowContributorsModal(false)}
              title="Contribution Statistics"
              repoName={repoName}
              details={details || undefined}
              filteredData={filteredData || undefined}
            >
              {renderContributorsChart()}
            </ViewMoreModal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 