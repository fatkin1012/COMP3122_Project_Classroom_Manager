'use client';
import { useEffect, useState } from 'react';

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
    fetchRepositoryData();
  }, [repository]);

  const fetchRepositoryData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [issuesResponse, commitsResponse, contributorsResponse] = await Promise.all([
        fetch(`/api/repositories/${repository.name}/issues`),
        fetch(`/api/repositories/${repository.name}/commits`),
        fetch(`/api/repositories/${repository.name}/contributors`),
      ]);

      if (!issuesResponse.ok) {
        const errorData = await issuesResponse.json();
        console.error('Issues API Error:', errorData);
        throw new Error(`Failed to fetch issues: ${issuesResponse.status}`);
      }
      if (!commitsResponse.ok) {
        const errorData = await commitsResponse.json();
        console.error('Commits API Error:', errorData);
        throw new Error(`Failed to fetch commits: ${commitsResponse.status}`);
      }
      if (!contributorsResponse.ok) {
        const errorData = await contributorsResponse.json();
        console.error('Contributors API Error:', {
          status: contributorsResponse.status,
          statusText: contributorsResponse.statusText,
          data: errorData,
        });
        throw new Error(`Failed to fetch contributors: ${contributorsResponse.status} ${contributorsResponse.statusText}`);
      }

      const [issuesData, commitsData, contributorsData] = await Promise.all([
        issuesResponse.json(),
        commitsResponse.json(),
        contributorsResponse.json(),
      ]);

      setIssues(issuesData);
      setCommits(commitsData);
      setContributors(contributorsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repository data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
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