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
      `https://api.github.com/repos/${GITHUB_ORGANIZATION}/${repo}/pulls`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return NextResponse.json(
        { error: `Failed to fetch pull requests: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    return NextResponse.json({ error: 'Failed to fetch pull requests' }, { status: 500 });
  }
}