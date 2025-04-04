// src/components/RepositoryDetails.tsx
'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';

interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
}

interface RepositoryDetailsProps {
  repository: Repository;
}

interface Issue {
  id: number;
  title: string;
  state: string;
  created_at: string;
  user: {
    login: string;
  };
}

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

interface PullRequest {
  id: number;
  title: string;
  state: string;
  created_at: string;
  user: {
    login: string;
  };
}

interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
  additions: number;
  deletions: number;
  commits: number;
  timeSpent: string;
}

export default function RepositoryDetails({ repository }: RepositoryDetailsProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const issuesResponse = await fetch(`/api/repositories/${repository.name}/issues`);
        if (!issuesResponse.ok) {
          const errorText = await issuesResponse.text();
          throw new Error(`Failed to fetch issues: ${issuesResponse.status} ${issuesResponse.statusText} - ${errorText}`);
        }
        const issuesData = await issuesResponse.json();
        setIssues(issuesData);

        const commitsResponse = await fetch(`/api/repositories/${repository.name}/commits`);
        if (!commitsResponse.ok) {
          const errorText = await commitsResponse.text();
          throw new Error(`Failed to fetch commits: ${commitsResponse.status} ${commitsResponse.statusText} - ${errorText}`);
        }
        const commitsData = await commitsResponse.json();
        setCommits(commitsData);

        const prsResponse = await fetch(`/api/pulls?repo=${repository.name}`);
        if (!prsResponse.ok) {
          const errorText = await prsResponse.text();
          throw new Error(`Failed to fetch pull requests: ${prsResponse.status} ${prsResponse.statusText} - ${errorText}`);
        }
        const prsData = await prsResponse.json();
        setPullRequests(prsData);

        const contributorsResponse = await fetch(`/api/repositories/${repository.name}/contributors`);
        if (!contributorsResponse.ok) {
          const errorText = await contributorsResponse.text();
          throw new Error(`Failed to fetch contributors: ${contributorsResponse.status} ${contributorsResponse.statusText} - ${errorText}`);
        }
        const contributorsData = await contributorsResponse.json();
        setContributors(contributorsData);
      } catch (err) {
        console.error('獲取數據失敗:', err);
        setError(err instanceof Error ? err.message : '獲取數據失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [repository.name]);

  // 計算個人貢獻
  const calculateContributions = () => {
    const contributions: { [key: string]: { commits: number; issues: number; prs: number } } = {};

    commits.forEach((commit) => {
      const author = commit.commit.author.name;
      if (!contributions[author]) {
        contributions[author] = { commits: 0, issues: 0, prs: 0 };
      }
      contributions[author].commits += 1;
    });

    issues.forEach((issue) => {
      const author = issue.user.login;
      if (!contributions[author]) {
        contributions[author] = { commits: 0, issues: 0, prs: 0 };
      }
      contributions[author].issues += 1;
    });

    pullRequests.forEach((pr) => {
      const author = pr.user.login;
      if (!contributions[author]) {
        contributions[author] = { commits: 0, issues: 0, prs: 0 };
      }
      contributions[author].prs += 1;
    });

    return contributions;
  };

  // 識別 Deadline Fighters
  const identifyDeadlineFighters = (deadline: Date) => {
    const deadlineWindow = 24 * 60 * 60 * 1000; // 24 小時
    const deadlineCommits = commits.filter((commit) => {
      const commitDate = new Date(commit.commit.author.date);
      return deadline.getTime() - commitDate.getTime() < deadlineWindow;
    });

    const deadlineContributions: { [key: string]: number } = {};
    deadlineCommits.forEach((commit) => {
      const author = commit.commit.author.name;
      deadlineContributions[author] = (deadlineContributions[author] || 0) + 1;
    });

    return Object.entries(deadlineContributions)
      .filter(([_, count]) => count > 5)
      .map(([author]) => author);
  };

  // 識別 Free-riders
  const identifyFreeRiders = (threshold: number = 3) => {
    const contributions = calculateContributions();
    return Object.entries(contributions)
      .filter(([_, stats]) => stats.commits + stats.issues + stats.prs < threshold)
      .map(([author]) => author);
  };

  // 計算積分
  const calculatePoints = () => {
    const points: { [key: string]: number } = {};
    Object.entries(contributions).forEach(([author, stats]) => {
      points[author] = stats.commits * 1 + stats.issues * 2 + stats.prs * 3;
    });
    return points;
  };

  // 計算 Issues 狀態分佈
  const getIssueStatusDistribution = () => {
    const openIssues = issues.filter((issue) => issue.state === 'open').length;
    const closedIssues = issues.filter((issue) => issue.state === 'closed').length;
    return [
      { name: 'Open', value: openIssues },
      { name: 'Closed', value: closedIssues },
    ];
  };

  const contributions = calculateContributions();
  const deadline = new Date('2024-10-16');
  const deadlineFighters = identifyDeadlineFighters(deadline);
  const freeRiders = identifyFreeRiders();
  const points = calculatePoints();
  const leaderboard = Object.entries(points).sort((a, b) => b[1] - a[1]);
  const topContributor = leaderboard[0]?.[0] || 'None';
  const issueStatusData = getIssueStatusDistribution();

  // 生成 PDF 報表
  const generateReport = () => {
    const doc = new jsPDF();
    let yOffset = 10;

    doc.setFontSize(16);
    doc.text(`Repository Report: ${repository.name}`, 10, yOffset);
    yOffset += 10;

    doc.setFontSize(12);
    doc.text(`Description: ${repository.description || 'No description'}`, 10, yOffset);
    yOffset += 10;

    doc.setFontSize(14);
    doc.text('Summary', 10, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    doc.text(`Commits: ${commits.length}`, 10, yOffset);
    yOffset += 5;
    doc.text(`Issues: ${issues.length}`, 10, yOffset);
    yOffset += 5;
    doc.text(`Pull Requests: ${pullRequests.length}`, 10, yOffset);
    yOffset += 10;

    doc.setFontSize(14);
    doc.text('Individual Contributions', 10, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    Object.entries(contributions).forEach(([author, stats]) => {
      doc.text(`${author}: ${stats.commits} commits, ${stats.issues} issues, ${stats.prs} PRs`, 10, yOffset);
      yOffset += 5;
    });
    yOffset += 5;

    doc.setFontSize(14);
    doc.text('Potential Issues', 10, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    doc.text(`Deadline Fighters: ${deadlineFighters.join(', ') || 'None'}`, 10, yOffset);
    yOffset += 5;
    doc.text(`Free-riders: ${freeRiders.join(', ') || 'None'}`, 10, yOffset);
    yOffset += 10;

    doc.setFontSize(14);
    doc.text('Leaderboard', 10, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    doc.text(`Top Contributor: ${topContributor} - ${points[topContributor] || 0} points`, 10, yOffset);
    yOffset += 5;
    leaderboard.slice(0, 5).forEach(([author, score], index) => {
      doc.text(`${index + 1}. ${author}: ${score} points`, 10, yOffset);
      yOffset += 5;
    });

    doc.save(`${repository.name}-report.pdf`);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
        className="bg-red-50 border border-red-200 rounded-lg p-4"
      >
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
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-3xl font-bold mb-2">{repository.name}</h2>
            <p className="text-blue-100">{repository.description || 'No description available'}</p>
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-200 hover:text-white transition-colors"
            >
              View on GitHub →
            </a>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateReport}
            className="bg-white text-blue-600 font-medium py-2 px-4 rounded-md shadow hover:bg-gray-100 transition"
          >
            Download Report
          </motion.button>
        </div>
      </div>

      {/* Summary, Issues, and Commits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className="text-gray-700">Commits: <span className="font-medium">{commits.length}</span></p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">⚠️</span>
              <p className="text-gray-700">Issues: <span className="font-medium">{issues.length}</span></p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">🔄</span>
              <p className="text-gray-700">Pull Requests: <span className="font-medium">{pullRequests.length}</span></p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Recent Issues</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {issues.length === 0 ? (
              <p className="text-gray-500 text-center">No issues available</p>
            ) : (
              issues.slice(0, 5).map((issue) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-gray-100 pb-4 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 truncate">{issue.title}</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        issue.state === 'open'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {issue.state}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    by {issue.user.login} • {new Date(issue.created_at).toLocaleDateString()}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Recent Commits</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {commits.length === 0 ? (
              <p className="text-gray-500 text-center">No commits available</p>
            ) : (
              commits.slice(0, 5).map((commit) => (
                <motion.div
                  key={commit.sha}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-gray-100 pb-4 last:border-0"
                >
                  <p className="font-medium text-gray-900 line-clamp-2">{commit.commit.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    by {commit.commit.author.name} • {new Date(commit.commit.author.date).toLocaleDateString()}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Issue Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Issue Status Distribution</h3>
        {issueStatusData.every((data) => data.value === 0) ? (
          <p className="text-gray-500 text-center">No issues to display</p>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issueStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {issueStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#82ca9d' : '#ffc658'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Contribution Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Contribution Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium mb-2 text-gray-700">Individual Contributions</h4>
            <ul className="space-y-2">
              {Object.entries(contributions).map(([author, stats]) => (
                <li key={author} className="text-gray-600">
                  {author}: {stats.commits} commits, {stats.issues} issues, {stats.prs} PRs
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-2 text-gray-700">Potential Issues</h4>
            <p className="text-gray-600">
              <strong>Deadline Fighters:</strong>{' '}
              <span className={deadlineFighters.length > 0 ? 'text-red-600' : 'text-gray-600'}>
                {deadlineFighters.join(', ') || 'None'}
              </span>
            </p>
            <p className="text-gray-600">
              <strong>Free-riders:</strong>{' '}
              <span className={freeRiders.length > 0 ? 'text-red-600' : 'text-gray-600'}>
                {freeRiders.join(', ') || 'None'}
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-md border border-green-200 p-6"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Leaderboard</h3>
        <div className="mb-4">
          <h4 className="text-lg font-medium mb-2 text-gray-700">Top Contributor</h4>
          <p className="text-gray-600">
            {topContributor} 🏆 - <span className="font-medium text-green-600">{points[topContributor] || 0} points</span>
          </p>
        </div>
        <h4 className="text-lg font-medium mb-2 text-gray-700">Rankings</h4>
        <ol className="list-decimal pl-4 space-y-2">
          {leaderboard.slice(0, 5).map(([author, score], index) => (
            <motion.li
              key={author}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="text-gray-600 flex items-center"
            >
              <span className="mr-2">{index + 1}.</span>
              <span className="font-medium">{author}</span>: {score} points
              {index === 0 && <span className="ml-2 text-yellow-500">🥇</span>}
              {index === 1 && <span className="ml-2 text-gray-400">🥈</span>}
              {index === 2 && <span className="ml-2 text-amber-600">🥉</span>}
            </motion.li>
          ))}
        </ol>
      </motion.div>

      {/* Contributors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Contributors</h3>
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4 text-gray-700">Contribution Statistics</h4>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contributors}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="login"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#3b82f6"
                  label={{ value: 'Number of Commits', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981"
                  label={{ value: 'Lines of Code', angle: 90, position: 'insideRight', fill: '#6b7280' }}
                />
                <Tooltip
                  formatter={(value: number) => [value.toLocaleString(), '']}
                  labelFormatter={(label) => `Contributor: ${label}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="commits" name="Commits" fill="#3b82f6" />
                <Bar yAxisId="right" dataKey="additions" name="Additions" fill="#10b981" />
                <Bar yAxisId="right" dataKey="deletions" name="Deletions" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

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
              {contributors.map((contributor) => (
                <motion.tr
                  key={contributor.login}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={contributor.avatar_url}
                        alt={contributor.login}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{contributor.login}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contributor.commits}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      +{(contributor.additions || 0).toLocaleString()} / -{(contributor.deletions || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contributor.timeSpent}</div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}