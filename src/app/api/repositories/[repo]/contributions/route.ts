import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ORGANIZATION = process.env.GITHUB_ORGANIZATION;

export async function GET(
  request: Request,
  { params }: { params: { repo: string } }
) {
  try {
    // 獲取貢獻者列表
    const contributorsResponse = await fetch(
      `https://api.github.com/repos/${ORGANIZATION}/${params.repo}/contributors`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!contributorsResponse.ok) {
      throw new Error('Failed to fetch contributors');
    }

    const contributors = await contributorsResponse.json();

    // 獲取每個貢獻者的詳細信息
    const contributorsWithDetails = await Promise.all(
      contributors.map(async (contributor: any) => {
        // 獲取用戶詳細信息
        const userResponse = await fetch(contributor.url, {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        const userDetails = await userResponse.json();

        // 獲取用戶的提交統計（限制為最近的5個提交）
        const statsResponse = await fetch(
          `https://api.github.com/repos/${ORGANIZATION}/${params.repo}/commits?author=${contributor.login}&per_page=5`,
          {
            headers: {
              Authorization: `token ${GITHUB_TOKEN}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );

        const commits = await statsResponse.json();

        // 計算代碼變更統計
        const totalChanges = commits.reduce((acc: number, commit: any) => {
          return acc + (commit.stats?.total || 0);
        }, 0);

        // 格式化最近的提交
        const recentCommits = commits.map((commit: any) => ({
          sha: commit.sha.substring(0, 7),
          message: commit.commit.message,
          date: commit.commit.author.date,
          url: commit.html_url,
        }));

        return {
          login: contributor.login,
          avatar_url: contributor.avatar_url,
          contributions: contributor.contributions,
          total_changes: totalChanges,
          name: userDetails.name || contributor.login,
          bio: userDetails.bio,
          commits_count: commits.length,
          last_contribution: commits[0]?.commit?.author?.date,
          recent_commits: recentCommits,
        };
      })
    );

    return NextResponse.json(contributorsWithDetails);
  } catch (error) {
    console.error('Error fetching contribution details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contribution details' },
      { status: 500 }
    );
  }
} 