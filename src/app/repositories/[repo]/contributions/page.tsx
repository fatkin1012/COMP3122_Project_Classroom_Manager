import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

interface Commit {
  sha: string;
  message: string;
  date: string;
  url: string;
}

interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
  total_changes: number;
  name: string;
  bio: string;
  commits_count: number;
  last_contribution: string;
  recent_commits: Commit[];
}

interface Props {
  params: {
    repo: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.repo} - 貢獻者統計`,
    description: `查看 ${params.repo} 倉庫的貢獻者統計信息`,
  };
}

async function getContributors(repo: string): Promise<Contributor[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/repositories/${repo}/contributions`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch contributors');
  }

  return res.json();
}

export default async function ContributionsPage({ params }: Props) {
  const contributors = await getContributors(params.repo);

  if (!contributors) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-gray-800 dark:bg-gray-950 text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{params.repo} - 貢獻者統計</h1>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href={`/repositories/${params.repo}`}
                className="text-blue-300 hover:text-blue-100 bg-gray-700 px-3 py-2 rounded-md transition-colors"
              >
                返回倉庫詳情
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          {contributors.map((contributor) => (
            <div
              key={contributor.login}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={contributor.avatar_url}
                  alt={contributor.login}
                  className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-600"
                />
                <div>
                  <h2 className="text-xl font-semibold dark:text-white">{contributor.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">@{contributor.login}</p>
                </div>
                <div className="ml-auto bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 text-center">{contributor.contributions}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">總貢獻</div>
                </div>
              </div>

              {contributor.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md italic">{contributor.bio}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">統計信息</h3>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">提交次數</span>
                    <span className="font-semibold dark:text-white">{contributor.commits_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">代碼變更行數</span>
                    <span className="font-semibold dark:text-white">{contributor.total_changes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">最後貢獻時間</span>
                    <span className="font-semibold dark:text-white">
                      {new Date(contributor.last_contribution).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">最近提交</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {contributor.recent_commits.map((commit) => (
                      <div key={commit.sha} className="border-l-2 border-blue-500 pl-3 bg-white dark:bg-gray-800 p-2 rounded-md">
                        <a
                          href={commit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <span className="font-mono text-sm">{commit.sha.substring(0, 7)}</span>
                        </a>
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{commit.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(commit.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 