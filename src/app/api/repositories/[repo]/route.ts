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
    // Fetch repository details
    const repoResponse = await fetch(
      `https://api.github.com/repos/${ORGANIZATION}/${params.repo}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!repoResponse.ok) {
      throw new Error(`GitHub API responded with status ${repoResponse.status}`);
    }

    const repoData = await repoResponse.json();

    // Fetch commits to count unique contributors
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${ORGANIZATION}/${params.repo}/commits`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!commitsResponse.ok) {
      throw new Error(`GitHub API responded with status ${commitsResponse.status}`);
    }

    const commits = await commitsResponse.json();
    
    // Count unique contributors from commits, excluding github-classroom[bot]
    const uniqueContributors = new Set();
    commits.forEach((commit: any) => {
      const author = commit.author?.login || commit.commit?.author?.name;
      if (author && author !== 'github-classroom[bot]') {
        uniqueContributors.add(author);
      }
    });

    // Fetch README content if available
    let readme = null;
    try {
      const readmeResponse = await fetch(
        `https://api.github.com/repos/${ORGANIZATION}/${params.repo}/readme`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3.raw',
          },
        }
      );
      if (readmeResponse.ok) {
        readme = await readmeResponse.text();
      }
    } catch (error) {
      console.error('Error fetching README:', error);
    }

    return NextResponse.json({
      name: repoData.name,
      description: repoData.description,
      owner: repoData.owner.login,
      lastUpdated: repoData.updated_at,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      language: repoData.language,
      branchCount: repoData.default_branch ? 1 : 0,
      contributors: uniqueContributors.size,
      html_url: repoData.html_url,
      readme,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repository details' },
      { status: 500 }
    );
  }
} 