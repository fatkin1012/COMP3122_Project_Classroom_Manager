// src/app/api/repositories/[repo]/contributors/route.ts
import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ORGANIZATION = process.env.GITHUB_ORGANIZATION;

export async function GET(
  request: Request,
  { params }: { params: { repo: string } }
) {
  try {
    const { repo } = params;

    if (!GITHUB_TOKEN) {
      console.error('GitHub token is not configured');
      return NextResponse.json(
        { error: 'GitHub token is not configured' },
        { status: 500 }
      );
    }

    if (!ORGANIZATION) {
      console.error('GitHub organization is not configured');
      return NextResponse.json(
        { error: 'GitHub organization is not configured' },
        { status: 500 }
      );
    }

    if (!repo) {
      console.error('Repository name is missing');
      return NextResponse.json(
        { error: 'Repository name is missing' },
        { status: 400 }
      );
    }

    // Get contributors list
    const contributorsUrl = `https://api.github.com/repos/${ORGANIZATION}/${repo}/contributors`;
    const contributorsResponse = await fetch(contributorsUrl, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!contributorsResponse.ok) {
      throw new Error(`Failed to fetch contributors: ${contributorsResponse.status}`);
    }

    const contributors = await contributorsResponse.json();

    // Get detailed information for each contributor
    const contributorsWithDetails = await Promise.all(
      contributors.map(async (contributor: any) => {
        try {
          // Get contributor's commit stats
          const statsUrl = `https://api.github.com/repos/${ORGANIZATION}/${repo}/stats/contributors`;
          const statsResponse = await fetch(statsUrl, {
            headers: {
              Authorization: `token ${GITHUB_TOKEN}`,
              Accept: 'application/vnd.github.v3+json',
            },
          });

          if (!statsResponse.ok) {
            return {
              login: contributor.login,
              avatar_url: contributor.avatar_url,
              contributions: contributor.contributions,
              additions: 0,
              deletions: 0,
              commits: contributor.contributions,
            };
          }

          const stats = await statsResponse.json();
          const contributorStats = Array.isArray(stats) 
            ? stats.find((stat: any) => stat.author.login === contributor.login)
            : null;

          if (!contributorStats) {
            return {
              login: contributor.login,
              avatar_url: contributor.avatar_url,
              contributions: contributor.contributions,
              additions: 0,
              deletions: 0,
              commits: contributor.contributions,
            };
          }

          const totalAdditions = contributorStats.weeks.reduce(
            (acc: number, week: any) => acc + week.a,
            0
          );
          const totalDeletions = contributorStats.weeks.reduce(
            (acc: number, week: any) => acc + week.d,
            0
          );

          return {
            login: contributor.login,
            avatar_url: contributor.avatar_url,
            contributions: contributor.contributions,
            additions: totalAdditions,
            deletions: totalDeletions,
            commits: contributor.contributions,
          };
        } catch (error) {
          console.error('Error processing contributor:', contributor.login, error);
          return {
            login: contributor.login,
            avatar_url: contributor.avatar_url,
            contributions: contributor.contributions,
            additions: 0,
            deletions: 0,
            commits: contributor.contributions,
          };
        }
      })
    );

    return NextResponse.json(contributorsWithDetails);
  } catch (error) {
    console.error('Error fetching contributor data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch contributor data' },
      { status: 500 }
    );
  }
}