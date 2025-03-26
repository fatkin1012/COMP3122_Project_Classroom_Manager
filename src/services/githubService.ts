import { Octokit } from 'octokit';
import { GITHUB_API_URL, GitHubCommit, GitHubIssue, GitHubOrg, GitHubPullRequest, GitHubRepo, GitHubUser } from '../config/github';

class GitHubService {
  private octokit: Octokit | null = null;

  constructor() {
    this.octokit = null;
  }

  initialize(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  isInitialized(): boolean {
    return this.octokit !== null;
  }

  // Get current user information
  async getCurrentUser(): Promise<GitHubUser> {
    if (!this.octokit) throw new Error('GitHubService not initialized');

    const response = await this.octokit.request('GET /user');
    return response.data as GitHubUser;
  }

  // Get user's organizations
  async getUserOrgs(): Promise<GitHubOrg[]> {
    if (!this.octokit) throw new Error('GitHubService not initialized');

    const response = await this.octokit.request('GET /user/orgs');
    return response.data as GitHubOrg[];
  }

  // Get organization's repository list
  async getOrgRepos(org: string): Promise<GitHubRepo[]> {
    if (!this.octokit) throw new Error('GitHubService not initialized');

    const response = await this.octokit.request('GET /orgs/{org}/repos', {
      org,
      type: 'all',
      per_page: 100
    });

    return response.data as GitHubRepo[];
  }

  // Get repository commits
  async getRepoCommits(owner: string, repo: string): Promise<GitHubCommit[]> {
    if (!this.octokit) throw new Error('GitHubService not initialized');

    const response = await this.octokit.request('GET /repos/{owner}/{repo}/commits', {
      owner,
      repo,
      per_page: 100
    });

    return response.data as GitHubCommit[];
  }

  // Get repository issues
  async getRepoIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
    if (!this.octokit) throw new Error('GitHubService not initialized');

    const response = await this.octokit.request('GET /repos/{owner}/{repo}/issues', {
      owner,
      repo,
      state: 'all',
      per_page: 100
    });

    return response.data as GitHubIssue[];
  }

  // Get repository pull requests
  async getRepoPullRequests(owner: string, repo: string): Promise<GitHubPullRequest[]> {
    if (!this.octokit) throw new Error('GitHubService not initialized');

    const response = await this.octokit.request('GET /repos/{owner}/{repo}/pulls', {
      owner,
      repo,
      state: 'all',
      per_page: 100
    });

    return response.data as GitHubPullRequest[];
  }

  // Get organization members
  async getOrgMembers(org: string): Promise<GitHubUser[]> {
    if (!this.octokit) throw new Error('GitHubService not initialized');

    const response = await this.octokit.request('GET /orgs/{org}/members', {
      org,
      per_page: 100
    });

    return response.data as GitHubUser[];
  }

  // Get repository collaborators
  async getRepoCollaborators(owner: string, repo: string): Promise<GitHubUser[]> {
    if (!this.octokit) throw new Error('GitHubService not initialized');

    const response = await this.octokit.request('GET /repos/{owner}/{repo}/collaborators', {
      owner,
      repo,
      per_page: 100
    });

    return response.data as GitHubUser[];
  }
}

// Export singleton instance
export const githubService = new GitHubService(); 