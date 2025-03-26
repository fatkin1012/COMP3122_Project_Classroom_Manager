export const GITHUB_API_URL = 'https://api.github.com';

// 用于验证 GitHub 应用程序的配置
// 实际使用时需要替换为真实值
export const GITHUB_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  redirectUri: process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI || 'http://localhost:3000/api/auth/callback',
};

// GitHub API 请求的访问范围
export const GITHUB_SCOPES = [
  'repo',
  'read:org',
  'read:user',
  'user:email',
].join(' ');

// 从 GitHub API 获取的数据类型
export type GitHubUser = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  email: string | null;
};

export type GitHubOrg = {
  id: number;
  login: string;
  name: string | null;
  description: string | null;
};

export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
};

export type GitHubCommit = {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    id: number;
  } | null;
  html_url: string;
};

export type GitHubIssue = {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user: {
    login: string;
    id: number;
  };
  assignees: {
    login: string;
    id: number;
  }[];
};

export type GitHubPullRequest = {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  user: {
    login: string;
    id: number;
  };
  requested_reviewers: {
    login: string;
    id: number;
  }[];
}; 