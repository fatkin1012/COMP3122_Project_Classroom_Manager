import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ORGANIZATION = process.env.NEXT_PUBLIC_GITHUB_ORGANIZATION || '23101659d';

export async function GET() {
  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: 'GitHub token not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.github.com/orgs/${ORGANIZATION}/repos`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch repositories from GitHub');
    }

    const repos = await response.json();

    // Transform the data to match the Assignment interface
    const assignments = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description || '',
      lastUpdated: repo.updated_at,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      views: 0, // GitHub API doesn't provide this directly
      owner: repo.owner.login,
      language: repo.language,
      url: repo.html_url,
    }));

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
} 