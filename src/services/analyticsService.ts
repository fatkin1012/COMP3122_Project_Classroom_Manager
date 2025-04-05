import { GitHubCommit, GitHubIssue, GitHubPullRequest } from '../types/github';
import { GitHubUser } from '../config/github';
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

interface UserContribution {
  user: string;
  userId: number;
  commits: number;
  issues: number;
  pullRequests: number;
  codeReviews: number;
  discussions: number;
  documentation: number;
  lastActiveDate: Date;
  totalContributions: number;
  contributionPercentage: number;
}

interface TeamStats {
  userContributions: UserContribution[];
  commitStats: {
    totalCommits: number;
    commitsByDay: Record<string, number>;
    commitsByUser: Record<string, number>;
  };
  issueStats: {
    totalIssues: number;
    openIssues: number;
    closedIssues: number;
    issuesByUser: Record<string, number>;
  };
  prStats: {
    totalPRs: number;
    openPRs: number;
    closedPRs: number;
    prsByUser: Record<string, number>;
  };
  activityTrend: 'increasing' | 'decreasing' | 'stable';
}

// Define contribution types
interface ContributionMetrics {
  commits: number;
  issues: number;
  prs: number;
  codeReviews: number;
  discussions: number;
  documentation: number;
  lastActiveDate: Date;
}

// Calculate contribution score
function calculateContributionScore(metrics: ContributionMetrics): number {
  const weights = {
    commits: 0.15,      // 提交次數 (15%)
    issues: 0.2,        // 問題參與 (20%)
    prs: 0.2,           // Pull Requests (20%)
    codeReviews: 0.25,  // 代碼審查 (25%)
    discussions: 0.1,   // 討論參與 (10%)
    documentation: 0.1  // 文檔貢獻 (10%)
  };

  return (
    metrics.commits * weights.commits +
    metrics.issues * weights.issues +
    metrics.prs * weights.prs +
    metrics.codeReviews * weights.codeReviews +
    metrics.discussions * weights.discussions +
    metrics.documentation * weights.documentation
  );
}

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
      pullRequests: number,
      codeReviews: number,
      discussions: number,
      documentation: number,
      lastActiveDate: Date
    }>();
    
    // Count commits and track last active date
    commits.forEach(commit => {
      if (commit.author) {
        const { login, id } = commit.author;
        const userData = userMap.get(login) || { 
          userId: id, 
          commits: 0, 
          issues: 0, 
          pullRequests: 0,
          codeReviews: 0,
          discussions: 0,
          documentation: 0,
          lastActiveDate: new Date(0)
        };
        userData.commits++;
        
        // Check if commit message contains documentation keywords
        if (commit.commit.message.toLowerCase().includes('doc') || 
            commit.commit.message.toLowerCase().includes('readme')) {
          userData.documentation++;
        }
        
        // Update last active date
        const commitDate = new Date(commit.commit.author.date);
        if (commitDate > userData.lastActiveDate) {
          userData.lastActiveDate = commitDate;
        }
        
        userMap.set(login, userData);
      }
    });
    
    // Count issues and discussions
    issues.forEach(issue => {
      const { login, id } = issue.user;
      const userData = userMap.get(login) || { 
        userId: id, 
        commits: 0, 
        issues: 0, 
        pullRequests: 0,
        codeReviews: 0,
        discussions: 0,
        documentation: 0,
        lastActiveDate: new Date(0)
      };
      userData.issues++;
      
      // Count discussions (comments)
      userData.discussions += issue.comments;
      
      userMap.set(login, userData);
    });
    
    // Count pull requests and code reviews
    prs.forEach(pr => {
      const { login, id } = pr.user;
      const userData = userMap.get(login) || { 
        userId: id, 
        commits: 0, 
        issues: 0, 
        pullRequests: 0,
        codeReviews: 0,
        discussions: 0,
        documentation: 0,
        lastActiveDate: new Date(0)
      };
      userData.pullRequests++;
      
      // Count discussions (comments and review comments)
      userData.discussions += pr.comments + pr.review_comments;
      
      // Count code reviews (review comments)
      userData.codeReviews += pr.review_comments;
      
      userMap.set(login, userData);
    });
    
    // Calculate total contributions and percentages
    const totalContributions = Array.from(userMap.values()).reduce(
      (sum, { commits, issues, pullRequests, codeReviews, discussions, documentation }) => 
        sum + commits + issues + pullRequests + codeReviews + discussions + documentation, 
      0
    );
    
    return Array.from(userMap.entries()).map(([user, data]) => {
      const total = data.commits + data.issues + data.pullRequests + 
                   data.codeReviews + data.discussions + data.documentation;
      const percentage = totalContributions > 0 
        ? (total / totalContributions) * 100 
        : 0;
        
      return {
        user,
        userId: data.userId,
        commits: data.commits,
        issues: data.issues,
        pullRequests: data.pullRequests,
        codeReviews: data.codeReviews,
        discussions: data.discussions,
        documentation: data.documentation,
        lastActiveDate: data.lastActiveDate,
        totalContributions: total,
        contributionPercentage: Math.round(percentage * 100) / 100
      };
    }).sort((a, b) => b.totalContributions - a.totalContributions);
  }
  
  // Calculate activity trend
  calculateActivityTrend(commitsByDay: Record<string, number>): 'increasing' | 'decreasing' | 'stable' {
    const dates = Object.keys(commitsByDay).sort();
    if (dates.length < 2) return 'stable';

    // Calculate average commits per day
    const totalCommits = Object.values(commitsByDay).reduce((sum, count) => sum + count, 0);
    const avgCommitsPerDay = totalCommits / dates.length;

    // Split the timeline into two halves
    const midPoint = Math.floor(dates.length / 2);
    const firstHalf = dates.slice(0, midPoint);
    const secondHalf = dates.slice(midPoint);

    // Calculate average commits for each half
    const firstHalfAvg = firstHalf.reduce((sum, date) => sum + (commitsByDay[date] || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, date) => sum + (commitsByDay[date] || 0), 0) / secondHalf.length;

    // Determine trend
    const threshold = avgCommitsPerDay * 0.2; // 20% threshold for significant change
    if (secondHalfAvg > firstHalfAvg + threshold) {
      return 'increasing';
    } else if (secondHalfAvg < firstHalfAvg - threshold) {
      return 'decreasing';
    } else {
      return 'stable';
    }
  }
  
  // Analyze team statistics
  analyzeTeamStats(
    repo: string,
    repoUrl: string,
    commits: GitHubCommit[],
    issues: GitHubIssue[],
    prs: GitHubPullRequest[]
  ): TeamStats {
    // Analyze commits
    const commitStats = this.analyzeCommits(commits);
    
    // Analyze issues
    const issueStats = this.analyzeIssues(issues);
    
    // Analyze pull requests
    const prStats = this.analyzePullRequests(prs);
    
    // Analyze user contributions with new metrics
    const userContributions = this.analyzeUserContributions(commits, issues, prs);
    
    // Calculate activity trend
    const activityTrend = this.calculateActivityTrend(commitStats.commitsByDay);
    
    return {
      userContributions,
      commitStats,
      issueStats,
      prStats,
      activityTrend
    };
  }
  
  // Detect possible free riders with comprehensive metrics
  detectFreeRiders(teamStats: TeamStats): { 
    freeRiders: string[],
    warnings: Array<{ user: string, message: string }>,
    recommendations: Array<{ user: string, suggestions: string[] }>
  } {
    const { userContributions, commitStats, issueStats, prStats } = teamStats;
    const totalUsers = userContributions.length;
    
    if (totalUsers <= 1) return { freeRiders: [], warnings: [], recommendations: [] };
    
    // Calculate expected average contribution percentage
    const expectedPercentage = 100 / totalUsers;
    const warningThreshold = expectedPercentage * 0.6; // 60% of average
    const freeRiderThreshold = expectedPercentage * 0.4; // 40% of average
    
    const results = {
      freeRiders: [] as string[],
      warnings: [] as Array<{ user: string, message: string }>,
      recommendations: [] as Array<{ user: string, suggestions: string[] }>
    };

    // Calculate team's average activity metrics
    const teamMetrics: ContributionMetrics = {
      commits: commitStats.totalCommits / totalUsers,
      issues: issueStats.totalIssues / totalUsers,
      prs: prStats.totalPRs / totalUsers,
      codeReviews: prStats.totalPRs * 0.5 / totalUsers, // Assuming each PR gets 0.5 reviews on average
      discussions: (issueStats.totalIssues + prStats.totalPRs) * 0.3 / totalUsers, // Assuming 0.3 discussions per issue/PR
      documentation: commitStats.totalCommits * 0.1 / totalUsers, // Assuming 10% of commits are documentation
      lastActiveDate: new Date() // Not used in team metrics
    };

    userContributions.forEach(user => {
      // Calculate user's contribution metrics
      const userMetrics: ContributionMetrics = {
        commits: user.commits,
        issues: user.issues,
        prs: user.pullRequests,
        codeReviews: user.codeReviews || 0,
        discussions: user.discussions || 0,
        documentation: user.documentation || 0,
        lastActiveDate: user.lastActiveDate || new Date(0)
      };

      // Calculate contribution score
      const userScore = calculateContributionScore(userMetrics);
      const expectedScore = calculateContributionScore(teamMetrics);
      const contributionPercentage = (userScore / expectedScore) * 100;

      // Check for free rider status
      if (contributionPercentage < freeRiderThreshold) {
        results.freeRiders.push(user.user);
      } 
      // Check for warning status
      else if (contributionPercentage < warningThreshold) {
        results.warnings.push({
          user: user.user,
          message: `Low contribution level detected (${contributionPercentage.toFixed(1)}% of expected)`
        });
      }

      // Generate recommendations
      const suggestions: string[] = [];
      
      if (userMetrics.commits < teamMetrics.commits * 0.5) {
        suggestions.push('Consider making more code contributions');
      }
      if (userMetrics.issues < teamMetrics.issues * 0.5) {
        suggestions.push('Consider participating more in issue discussions');
      }
      if (userMetrics.prs < teamMetrics.prs * 0.5) {
        suggestions.push('Consider submitting more pull requests');
      }
      if (userMetrics.codeReviews < teamMetrics.codeReviews * 0.5) {
        suggestions.push('Consider participating more in code reviews');
      }
      if (userMetrics.discussions < teamMetrics.discussions * 0.5) {
        suggestions.push('Consider engaging more in team discussions');
      }
      if (userMetrics.documentation < teamMetrics.documentation * 0.5) {
        suggestions.push('Consider contributing more to documentation');
      }

      // Check for inactivity
      const daysInactive = Math.floor((new Date().getTime() - userMetrics.lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysInactive > 7) {
        suggestions.push(`You have been inactive for ${daysInactive} days. Consider re-engaging with the project.`);
      }

      if (suggestions.length > 0) {
        results.recommendations.push({
          user: user.user,
          suggestions
        });
      }
    });

    return results;
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