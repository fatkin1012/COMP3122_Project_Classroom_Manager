import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Octokit } from 'octokit';
import { analyticsService } from '@/services/analyticsService';

// Get repository statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  const token = (await cookies().get('github_token'))?.value;
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { owner, repo } = params;
  
  if (!owner || !repo) {
    return NextResponse.json({ error: 'Repository information missing' }, { status: 400 });
  }
  
  try {
    const octokit = new Octokit({ auth: token });
    
    // Fetch repository data in parallel
    const [commitsResponse, issuesResponse, pullsResponse, collaboratorsResponse] = await Promise.all([
      // Get repository commits
      octokit.request('GET /repos/{owner}/{repo}/commits', {
        owner,
        repo,
        per_page: 100
      }),
      
      // Get repository issues
      octokit.request('GET /repos/{owner}/{repo}/issues', {
        owner,
        repo,
        state: 'all',
        per_page: 100
      }),
      
      // Get repository pull requests
      octokit.request('GET /repos/{owner}/{repo}/pulls', {
        owner,
        repo,
        state: 'all',
        per_page: 100
      }),
      
      // Get repository collaborators
      octokit.request('GET /repos/{owner}/{repo}/collaborators', {
        owner,
        repo,
        per_page: 100
      })
    ]);
    
    // Process data using analytics service
    const repoUrl = `https://github.com/${owner}/${repo}`;
    const teamStats = analyticsService.analyzeTeamStats(
      repo,
      repoUrl,
      commitsResponse.data,
      issuesResponse.data,
      pullsResponse.data
    );
    
    // Detect special patterns
    const freeRiders = analyticsService.detectFreeRiders(teamStats);
    
    // Detect deadline rushing
    const today = new Date();
    const deadlineFighters = analyticsService.detectDeadlineFighters(teamStats, today);
    
    return NextResponse.json({ 
      stats: teamStats,
      insights: {
        possibleFreeRiders: freeRiders,
        possibleDeadlineFighters: deadlineFighters
      }
    });
  } catch (error: any) {
    console.error(`Error fetching statistics for repository ${owner}/${repo}:`, error);
    return NextResponse.json(
      { error: `Error fetching statistics: ${error.message}` }, 
      { status: error.status || 500 }
    );
  }
} 