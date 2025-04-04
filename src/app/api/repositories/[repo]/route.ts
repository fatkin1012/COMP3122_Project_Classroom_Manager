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
    // Fetch repository details
    const repoResponse = await fetch(
      `https://api.github.com/repos/${ORGANIZATION}/${params.repo}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!repoResponse.ok) {
      throw new Error('Failed to fetch repository details');
    }

    const repoData = await repoResponse.json();

    // Fetch README content
    const readmeResponse = await fetch(
      `https://api.github.com/repos/${ORGANIZATION}/${params.repo}/readme`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.raw+json',
        },
      }
    );

    let readme = null;
    if (readmeResponse.ok) {
      readme = await readmeResponse.text();
    }

    // Format the response
    const formattedData = {
      name: repoData.name,
      description: repoData.description || 'No description available',
      owner: repoData.owner.login,
      lastUpdated: repoData.updated_at,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      language: repoData.language || 'Not specified',
      branches: 0, // We'll update this below
      contributors: 0, // We'll update this below
      html_url: repoData.html_url,
      readme: readme,
    };

    // Fetch branch count
    try {
      const branchesResponse = await fetch(
        `https://api.github.com/repos/${ORGANIZATION}/${params.repo}/branches`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (branchesResponse.ok) {
        const branchesData = await branchesResponse.json();
        formattedData.branches = branchesData.length;
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }

    // Fetch contributors count
    try {
      const contributorsResponse = await fetch(
        `https://api.github.com/repos/${ORGANIZATION}/${params.repo}/contributors`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (contributorsResponse.ok) {
        const contributorsData = await contributorsResponse.json();
        formattedData.contributors = contributorsData.length;
      }
    } catch (error) {
      console.error('Error fetching contributors:', error);
    }

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error in repository details API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch repository details' },
      { status: 500 }
    );
  }
} 