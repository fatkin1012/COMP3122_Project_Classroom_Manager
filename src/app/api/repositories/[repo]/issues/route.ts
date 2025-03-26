import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ORGANIZATION = process.env.GITHUB_ORGANIZATION;

export async function GET(
  request: Request,
  { params }: { params: { repo: string } }
) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${ORGANIZATION}/${params.repo}/issues`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch repository issues');
    }

    const issues = await response.json();
    return NextResponse.json(issues);
  } catch (error) {
    console.error('Error fetching repository issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repository issues' },
      { status: 500 }
    );
  }
} 