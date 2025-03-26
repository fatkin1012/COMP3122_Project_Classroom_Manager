import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ORGANIZATION = process.env.GITHUB_ORGANIZATION;

export async function GET(
  request: Request,
  { params }: { params: { repo: string } }
) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${ORGANIZATION}/${params.repo}/commits`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch repository commits');
    }

    const commits = await response.json();
    return NextResponse.json(commits);
  } catch (error) {
    console.error('Error fetching repository commits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repository commits' },
      { status: 500 }
    );
  }
} 