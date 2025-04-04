import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ORGANIZATION = process.env.GITHUB_ORGANIZATION;

export async function GET(
  request: Request,
  { params }: { params: { repo: string } }
) {
  if (!GITHUB_TOKEN || !ORGANIZATION) {
    return NextResponse.json(
      { error: 'Missing required environment variables' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${ORGANIZATION}/${params.repo}/branches`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const branches = await response.json();
    
    // Transform branch data
    const transformedBranches = branches.map((branch: any) => ({
      name: branch.name,
      sha: branch.commit.sha,
      url: branch.commit.url,
      protected: branch.protected,
    }));

    return NextResponse.json(transformedBranches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch branches' },
      { status: 500 }
    );
  }
} 