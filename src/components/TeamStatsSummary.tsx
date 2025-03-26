'use client';

import { useState } from 'react';
import type { TeamStats } from '@/services/analyticsService';
import CommitActivityChart from './charts/CommitActivityChart';
import ContributionPieChart from './charts/ContributionPieChart';

interface TeamStatsSummaryProps {
  teamStats: TeamStats;
  insights: {
    possibleFreeRiders: string[];
    possibleDeadlineFighters: string[];
  };
}

export default function TeamStatsSummary({ teamStats, insights }: TeamStatsSummaryProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const activityTrendColor = {
    increasing: 'text-green-600',
    decreasing: 'text-red-600',
    stable: 'text-yellow-600'
  }[teamStats.activityTrend];
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{teamStats.teamName} Team</h2>
          <a 
            href={teamStats.repoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center text-sm"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="mr-1">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            View Repository
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600 mb-1">Total Commits</h3>
            <div className="text-3xl font-bold text-blue-900">
              {teamStats.commitStats.totalCommits}
            </div>
            <div className="text-sm text-blue-700 mt-1">
              Average {teamStats.commitStats.averageCommitsPerDay.toFixed(1)} commits per day
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600 mb-1">Issues</h3>
            <div className="text-3xl font-bold text-purple-900">
              {teamStats.issueStats.totalIssues}
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-green-600">
                Closed: {teamStats.issueStats.closedIssues}
              </span>
              <span className="text-red-600">
                Open: {teamStats.issueStats.openIssues}
              </span>
            </div>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-indigo-600 mb-1">Pull Requests</h3>
            <div className="text-3xl font-bold text-indigo-900">
              {teamStats.pullRequestStats.totalPRs}
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-green-600">
                Merged: {teamStats.pullRequestStats.mergedPRs}
              </span>
              <span className="text-yellow-600">
                Pending: {teamStats.pullRequestStats.openPRs}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap mb-4 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('contributors')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'contributors'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Contributors
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'insights'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Insights
          </button>
        </div>
        
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Last Activity</h3>
                <div className="text-lg font-semibold">
                  {teamStats.lastActivityDate}
                </div>
                <div className={`text-sm mt-1 ${activityTrendColor}`}>
                  Activity Trend: {
                    teamStats.activityTrend === 'increasing' ? 'Increasing ↑' : 
                    teamStats.activityTrend === 'decreasing' ? 'Decreasing ↓' : 'Stable →'
                  }
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Average Issue/PR Cycle</h3>
                <div>
                  <span className="text-sm text-gray-600">Issue Resolution: </span>
                  <span className="font-semibold">{teamStats.issueStats.averageIssueCloseTime}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">PR Merge: </span>
                  <span className="font-semibold">{teamStats.pullRequestStats.averagePRMergeTime}</span>
                </div>
              </div>
            </div>
            
            <CommitActivityChart commitsByDay={teamStats.commitStats.commitsByDay} />
          </div>
        )}
        
        {activeTab === 'contributors' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commits</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRs</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contrib %</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teamStats.userContributions.map((user) => (
                      <tr key={user.userId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.user}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.commits}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.issues}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.pullRequests}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.contributionPercentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <ContributionPieChart userContributions={teamStats.userContributions} />
            </div>
          </div>
        )}
        
        {activeTab === 'insights' && (
          <div>
            <div className="space-y-6">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Potential Issues</h3>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-yellow-700 mb-1">Possible Free Riders:</h4>
                  {insights.possibleFreeRiders.length > 0 ? (
                    <ul className="list-disc pl-5 text-yellow-700">
                      {insights.possibleFreeRiders.map(user => (
                        <li key={user}>{user}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-green-600">No free riders detected</p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-yellow-700 mb-1">Possible Deadline Fighters:</h4>
                  {insights.possibleDeadlineFighters.length > 0 ? (
                    <ul className="list-disc pl-5 text-yellow-700">
                      {insights.possibleDeadlineFighters.map(user => (
                        <li key={user}>{user}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-green-600">No deadline fighters detected</p>
                  )}
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800 mb-2">Recommendations</h3>
                <ul className="list-disc pl-5 text-green-700 space-y-2">
                  {teamStats.issueStats.openIssues > 5 && (
                    <li>There are several open issues, consider focusing on issue resolution</li>
                  )}
                  {teamStats.pullRequestStats.openPRs > 3 && (
                    <li>Multiple open pull requests exist, consider reviewing and merging or closing them</li>
                  )}
                  {teamStats.activityTrend === 'decreasing' && (
                    <li>Team activity is decreasing, consider checking team engagement</li>
                  )}
                  {teamStats.commitStats.totalCommits < 10 && (
                    <li>Low commit count, consider checking project progress</li>
                  )}
                  {insights.possibleFreeRiders.length > 0 && (
                    <li>Some members may have unbalanced contributions, consider checking participation</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 