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
      `https://api.github.com/repos/${ORGANIZATION}/${params.repo}/commits`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}`);
    }

    const commits = await response.json();
    
    // Track unique contributors
    const uniqueContributors = new Set();
    commits.forEach((commit: any) => {
      const author = commit.author?.login || commit.commit?.author?.name;
      if (author) {
        uniqueContributors.add(author);
      }
    });
    
    // Fetch detailed commit information for each commit
    const detailedCommits = await Promise.all(
      commits.map(async (commit: any) => {
        const detailResponse = await fetch(
          `https://api.github.com/repos/${ORGANIZATION}/${params.repo}/commits/${commit.sha}`,
          {
            headers: {
              Authorization: `Bearer ${GITHUB_TOKEN}`,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        );

        if (!detailResponse.ok) {
          console.error(`Failed to fetch details for commit ${commit.sha}`);
          return {
            sha: commit.sha,
            message: commit.commit.message,
            author: commit.author?.login || commit.commit.author.name,
            date: commit.commit.author.date,
            stats: { additions: 0, deletions: 0 },
            files: []
          };
        }

        const details = await detailResponse.json();
        return {
          sha: details.sha,
          message: details.commit.message,
          author: details.author?.login || details.commit.author.name,
          date: details.commit.author.date,
          stats: details.stats,
          files: details.files
        };
      })
    );

    return NextResponse.json({
      commits: detailedCommits,
      totalContributors: uniqueContributors.size
    });
  } catch (error) {
    console.error('Error fetching commits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commits' },
      { status: 500 }
    );
  }
} 