'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 獲取倉庫詳細信息
        const repoResponse = await fetch(`/api/repositories/${repository.name}`);
        if (!repoResponse.ok) {
          const errorData = await repoResponse.json();
          throw new Error(errorData.error || '獲取倉庫信息失敗');
        }
        const repoData = await repoResponse.json();

        // 獲取倉庫問題信息
        const issuesResponse = await fetch(`/api/repositories/${repository.name}/issues`);
        if (!issuesResponse.ok) {
          const errorData = await issuesResponse.json();
          throw new Error(errorData.error || '獲取倉庫問題信息失敗');
        }
        const issuesData = await issuesResponse.json();
        setIssues(issuesData);

        // 獲取倉庫提交信息
        const commitsResponse = await fetch(`/api/repositories/${repository.name}/commits`);
        if (!commitsResponse.ok) {
          const errorData = await commitsResponse.json();
          throw new Error(errorData.error || '獲取倉庫提交信息失敗');
        }
        const commitsData = await commitsResponse.json();
        setCommits(commitsData);

        // 獲取貢獻者信息
        const contributorsResponse = await fetch(`/api/repositories/${repository.name}/contributors`);
        if (!contributorsResponse.ok) {
          const errorData = await contributorsResponse.json();
          throw new Error(errorData.error || '獲取貢獻者信息失敗');
        }
        const contributorsData = await contributorsResponse.json();
        
        // 添加 2 秒延遲
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">{repository.name}</h2>
        <p className="text-gray-600 mb-4">{repository.description}</p>
        <a
          href={repository.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600"
        >
          View on GitHub →
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Recent Issues</h3>
          <div className="space-y-4">
            {issues.slice(0, 5).map((issue) => (
              <div
                key={issue.id}
                className="border-b border-gray-100 pb-4 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{issue.title}</h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      issue.state === 'open'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    {issue.state}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  by {issue.user.login} •{' '}
                  {new Date(issue.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Recent Commits</h3>
          <div className="space-y-4">
            {commits.slice(0, 5).map((commit) => (
              <div
                key={commit.sha}
                className="border-b border-gray-100 pb-4 last:border-0"
              >
                <p className="font-medium text-gray-900 line-clamp-2">
                  {commit.commit.message}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  by {commit.commit.author.name} •{' '}
                  {new Date(commit.commit.author.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Contributors</h3>
        
        {/* Add Chart */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4 text-gray-700">Contribution Statistics</h4>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contributors}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="login" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="#8884d8"
                  label={{ value: 'Number of Commits', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#82ca9d"
                  label={{ value: 'Lines of Code', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString(), '']}
                  labelFormatter={(label) => `Contributor: ${label}`}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="commits" 
                  name="Commits" 
                  fill="#8884d8" 
                />
                <Bar 
                  yAxisId="right"
                  dataKey="additions" 
                  name="Additions" 
                  fill="#82ca9d" 
                />
                <Bar 
                  yAxisId="right"
                  dataKey="deletions" 
                  name="Deletions" 
                  fill="#ffc658" 
                />
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
                <tr key={contributor.login}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={contributor.avatar_url}
                        alt={contributor.login}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {contributor.login}
                        </div>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 