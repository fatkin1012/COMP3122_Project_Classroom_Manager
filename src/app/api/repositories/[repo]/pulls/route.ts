import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ORGANIZATION = process.env.GITHUB_ORGANIZATION || '23101659d';

export async function GET(
  request: Request,
  { params }: { params: { repo: string } }
) {
  if (!GITHUB_TOKEN) {
    return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${ORGANIZATION}/${params.repo}/pulls`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}`);
    }

    const pulls = await response.json();
    const formattedPulls = pulls.map((pr: any) => ({
      title: pr.title,
      state: pr.state,
      created_at: pr.created_at,
      user: {
        login: pr.user.login
      },
      number: pr.number,
      html_url: pr.html_url
    }));

    return NextResponse.json(formattedPulls);
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pull requests' },
      { status: 500 }
    );
  }
} 