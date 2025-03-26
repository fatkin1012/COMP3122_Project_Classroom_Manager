import { GitHubCommit, GitHubIssue, GitHubPullRequest, GitHubUser } from '../config/github';
import { formatDistance, parseISO, startOfDay, endOfDay, eachDayOfInterval, isSameDay } from 'date-fns';

export type CommitStats = {
  totalCommits: number;
  commitsByUser: Record<string, number>;
  commitsByDay: Record<string, number>;
  averageCommitsPerDay: number;
};

export type IssueStats = {
  totalIssues: number;
  openIssues: number;
  closedIssues: number;
  issuesByUser: Record<string, number>;
  issuesByDay: Record<string, number>;
  averageIssueCloseTime: string;
};

export type PullRequestStats = {
  totalPRs: number;
  openPRs: number;
  closedPRs: number;
  mergedPRs: number;
  prsByUser: Record<string, number>;
  prsByDay: Record<string, number>;
  averagePRMergeTime: string;
};

export type UserContribution = {
  user: string;
  userId: number;
  commits: number;
  issues: number;
  pullRequests: number;
  totalContributions: number;
  contributionPercentage: number;
};

export type TeamStats = {
  teamName: string;
  repoUrl: string;
  commitStats: CommitStats;
  issueStats: IssueStats;
  pullRequestStats: PullRequestStats;
  userContributions: UserContribution[];
  lastActivityDate: string;
  activityTrend: 'increasing' | 'decreasing' | 'stable';
};

export class AnalyticsService {
  // Analyze commit statistics
  analyzeCommits(commits: GitHubCommit[]): CommitStats {
    const commitsByUser: Record<string, number> = {};
    const commitsByDay: Record<string, number> = {};
    
    // Count commits by user and date
    commits.forEach(commit => {
      const author = commit.author?.login || commit.commit.author.name;
      const date = startOfDay(parseISO(commit.commit.author.date)).toISOString().split('T')[0];
      
      commitsByUser[author] = (commitsByUser[author] || 0) + 1;
      commitsByDay[date] = (commitsByDay[date] || 0) + 1;
    });
    
    // Calculate average daily commits
    const days = Object.keys(commitsByDay).length || 1;
    const averageCommitsPerDay = commits.length / days;
    
    return {
      totalCommits: commits.length,
      commitsByUser,
      commitsByDay,
      averageCommitsPerDay
    };
  }
  
  // Analyze issue statistics
  analyzeIssues(issues: GitHubIssue[]): IssueStats {
    const issuesByUser: Record<string, number> = {};
    const issuesByDay: Record<string, number> = {};
    let totalCloseTime = 0;
    let closedIssuesCount = 0;
    
    // Count issues by user and date
    issues.forEach(issue => {
      const creator = issue.user.login;
      const date = startOfDay(parseISO(issue.created_at)).toISOString().split('T')[0];
      
      issuesByUser[creator] = (issuesByUser[creator] || 0) + 1;
      issuesByDay[date] = (issuesByDay[date] || 0) + 1;
      
      // Calculate close time
      if (issue.state === 'closed' && issue.closed_at) {
        const closeTime = parseISO(issue.closed_at).getTime() - parseISO(issue.created_at).getTime();
        totalCloseTime += closeTime;
        closedIssuesCount++;
      }
    });
    
    // Calculate average close time
    const averageCloseTimeMs = closedIssuesCount > 0 ? totalCloseTime / closedIssuesCount : 0;
    const averageIssueCloseTime = averageCloseTimeMs > 0 
      ? formatDistance(0, averageCloseTimeMs) 
      : 'No data';
    
    return {
      totalIssues: issues.length,
      openIssues: issues.filter(i => i.state === 'open').length,
      closedIssues: issues.filter(i => i.state === 'closed').length,
      issuesByUser,
      issuesByDay,
      averageIssueCloseTime
    };
  }
  
  // Analyze pull request statistics
  analyzePullRequests(prs: GitHubPullRequest[]): PullRequestStats {
    const prsByUser: Record<string, number> = {};
    const prsByDay: Record<string, number> = {};
    let totalMergeTime = 0;
    let mergedPRsCount = 0;
    
    // Count PRs by user and date
    prs.forEach(pr => {
      const creator = pr.user.login;
      const date = startOfDay(parseISO(pr.created_at)).toISOString().split('T')[0];
      
      prsByUser[creator] = (prsByUser[creator] || 0) + 1;
      prsByDay[date] = (prsByDay[date] || 0) + 1;
      
      // Calculate merge time
      if (pr.merged_at) {
        const mergeTime = parseISO(pr.merged_at).getTime() - parseISO(pr.created_at).getTime();
        totalMergeTime += mergeTime;
        mergedPRsCount++;
      }
    });
    
    // Calculate average merge time
    const averageMergeTimeMs = mergedPRsCount > 0 ? totalMergeTime / mergedPRsCount : 0;
    const averagePRMergeTime = averageMergeTimeMs > 0 
      ? formatDistance(0, averageMergeTimeMs) 
      : 'No data';
    
    return {
      totalPRs: prs.length,
      openPRs: prs.filter(p => p.state === 'open').length,
      closedPRs: prs.filter(p => p.state === 'closed' && !p.merged_at).length,
      mergedPRs: prs.filter(p => Boolean(p.merged_at)).length,
      prsByUser,
      prsByDay,
      averagePRMergeTime
    };
  }
  
  // Analyze user contributions
  analyzeUserContributions(
    commits: GitHubCommit[], 
    issues: GitHubIssue[], 
    prs: GitHubPullRequest[]
  ): UserContribution[] {
    const userMap = new Map<string, { 
      userId: number, 
      commits: number, 
      issues: number, 
      prs: number 
    }>();
    
    // Count commits
    commits.forEach(commit => {
      if (commit.author) {
        const { login, id } = commit.author;
        const userData = userMap.get(login) || { userId: id, commits: 0, issues: 0, prs: 0 };
        userData.commits++;
        userMap.set(login, userData);
      }
    });
    
    // Count issues
    issues.forEach(issue => {
      const { login, id } = issue.user;
      const userData = userMap.get(login) || { userId: id, commits: 0, issues: 0, prs: 0 };
      userData.issues++;
      userMap.set(login, userData);
    });
    
    // Count pull requests
    prs.forEach(pr => {
      const { login, id } = pr.user;
      const userData = userMap.get(login) || { userId: id, commits: 0, issues: 0, prs: 0 };
      userData.prs++;
      userMap.set(login, userData);
    });
    
    // Calculate total contributions and percentages
    const totalContributions = Array.from(userMap.values()).reduce(
      (sum, { commits, issues, prs }) => sum + commits + issues + prs, 
      0
    );
    
    return Array.from(userMap.entries()).map(([user, data]) => {
      const total = data.commits + data.issues + data.prs;
      const percentage = totalContributions > 0 
        ? (total / totalContributions) * 100 
        : 0;
        
      return {
        user,
        userId: data.userId,
        commits: data.commits,
        issues: data.issues,
        pullRequests: data.prs,
        totalContributions: total,
        contributionPercentage: Math.round(percentage * 100) / 100
      };
    }).sort((a, b) => b.totalContributions - a.totalContributions);
  }
  
  // Calculate activity trend
  calculateActivityTrend(
    commits: GitHubCommit[], 
    issues: GitHubIssue[], 
    prs: GitHubPullRequest[]
  ): { lastActivityDate: string, activityTrend: 'increasing' | 'decreasing' | 'stable' } {
    // Find the most recent activity date
    const allDates = [
      ...commits.map(c => parseISO(c.commit.author.date)),
      ...issues.map(i => parseISO(i.created_at)),
      ...prs.map(p => parseISO(p.created_at))
    ].sort((a, b) => b.getTime() - a.getTime());
    
    if (allDates.length === 0) {
      return { 
        lastActivityDate: 'No activity', 
        activityTrend: 'stable' 
      };
    }
    
    const lastActivityDate = allDates[0].toISOString().split('T')[0];
    
    // Calculate activity over the past two weeks and compare trend
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const secondWeekActivity = allDates.filter(
      date => date >= twoWeeksAgo && date < oneWeekAgo
    ).length;
    
    const lastWeekActivity = allDates.filter(
      date => date >= oneWeekAgo
    ).length;
    
    let activityTrend: 'increasing' | 'decreasing' | 'stable';
    
    if (lastWeekActivity > secondWeekActivity * 1.2) {
      activityTrend = 'increasing';
    } else if (lastWeekActivity < secondWeekActivity * 0.8) {
      activityTrend = 'decreasing';
    } else {
      activityTrend = 'stable';
    }
    
    return { lastActivityDate, activityTrend };
  }
  
  // Analyze team statistics
  analyzeTeamStats(
    teamName: string,
    repoUrl: string,
    commits: GitHubCommit[],
    issues: GitHubIssue[],
    prs: GitHubPullRequest[]
  ): TeamStats {
    const commitStats = this.analyzeCommits(commits);
    const issueStats = this.analyzeIssues(issues);
    const pullRequestStats = this.analyzePullRequests(prs);
    const userContributions = this.analyzeUserContributions(commits, issues, prs);
    const { lastActivityDate, activityTrend } = this.calculateActivityTrend(commits, issues, prs);
    
    return {
      teamName,
      repoUrl,
      commitStats,
      issueStats,
      pullRequestStats,
      userContributions,
      lastActivityDate,
      activityTrend
    };
  }
  
  // Detect possible free riders
  detectFreeRiders(teamStats: TeamStats): string[] {
    const { userContributions } = teamStats;
    const totalUsers = userContributions.length;
    
    if (totalUsers <= 1) return [];
    
    // Calculate expected average contribution percentage
    const expectedPercentage = 100 / totalUsers;
    const threshold = expectedPercentage * 0.4; // Below 40% of average
    
    return userContributions
      .filter(u => u.contributionPercentage < threshold)
      .map(u => u.user);
  }
  
  // Detect deadline fighters (students who rush near deadline)
  detectDeadlineFighters(
    teamStats: TeamStats, 
    deadlineDate: Date
  ): string[] {
    const { userContributions, commitStats } = teamStats;
    const deadlineDayStr = startOfDay(deadlineDate).toISOString().split('T')[0];
    const deadlinePrevDayStr = startOfDay(
      new Date(deadlineDate.getTime() - 86400000)
    ).toISOString().split('T')[0];
    
    // Calculate commits in the last two days before deadline
    const deadlineCommits = (commitStats.commitsByDay[deadlineDayStr] || 0) + 
                           (commitStats.commitsByDay[deadlinePrevDayStr] || 0);
    
    // Calculate average daily commits for remaining days
    let totalOtherDays = 0;
    let totalOtherCommits = 0;
    
    Object.entries(commitStats.commitsByDay).forEach(([day, count]) => {
      if (day !== deadlineDayStr && day !== deadlinePrevDayStr) {
        totalOtherDays++;
        totalOtherCommits += count;
      }
    });
    
    const avgDailyCommits = totalOtherDays > 0 ? totalOtherCommits / totalOtherDays : 0;
    
    // If commits in the last two days are significantly higher than average
    if (deadlineCommits > avgDailyCommits * 3) {
      // Since we don't have detailed commit data by date and user, simplify by returning users with high commit contribution
      return userContributions
        .filter(u => u.commits > 0 && u.contributionPercentage > 30)
        .map(u => u.user);
    }
    
    return [];
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService(); 