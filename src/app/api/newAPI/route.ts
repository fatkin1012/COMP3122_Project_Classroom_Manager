import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ORGANIZATION = process.env.GITHUB_ORGANIZATION;

export async function GET() {
  console.log('API Route: Starting to fetch assignments');
  console.log('Organization:', ORGANIZATION);
  
  if (!GITHUB_TOKEN || !ORGANIZATION) {
    console.error('Missing environment variables:', { 
      hasToken: !!GITHUB_TOKEN, 
      hasOrg: !!ORGANIZATION 
    });
    return NextResponse.json(
      { error: 'Missing required environment variables' },
      { status: 500 }
    );
  }

  try {
    console.log('Fetching from GitHub API...');
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
      const errorData = await response.json();
      console.error('GitHub API Error:', errorData);
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Received repositories:', data.length);
    
    // Transform all repositories without filtering
    const repositories = data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      lastUpdated: repo.updated_at,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      views: 0,
      owner: repo.owner.login,
      language: repo.language,
      url: repo.html_url,
    }));

    console.log('Transformed repositories:', repositories.length);
    return NextResponse.json(repositories);
  } catch (error) {
    console.error('Error in assignments API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
} 