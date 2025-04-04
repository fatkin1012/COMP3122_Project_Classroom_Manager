// src/app/api/pulls/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get('repo');
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_ORGANIZATION = process.env.GITHUB_ORGANIZATION;

  if (!repo) {
    return NextResponse.json({ error: 'Repository name is required' }, { status: 400 });
  }

  if (!GITHUB_TOKEN || !GITHUB_ORGANIZATION) {
    return NextResponse.json(
      { error: 'Missing GITHUB_TOKEN or GITHUB_ORGANIZATION in environment variables' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_ORGANIZATION}/${repo}/pulls?state=all`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pull requests: ${response.status}`);
    }

    const data = await response.json();
    
    // Format the pull requests data for the UI
    const formattedPulls = data.map((pr: any) => ({
      title: pr.title,
      state: pr.state,
      created_at: pr.created_at,
      user: {
        login: pr.user.login
      }
    }));

    return NextResponse.json(formattedPulls);
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch pull requests' },
      { status: 500 }
    );
  }
}