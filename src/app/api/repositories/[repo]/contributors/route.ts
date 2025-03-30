import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ORGANIZATION = process.env.GITHUB_ORGANIZATION;

export async function GET(
  request: Request,
  { params }: { params: { repo: string } }
) {
  try {
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

    const repo = await params.repo;
    if (!repo) {
      console.error('Repository name is missing');
      return NextResponse.json(
        { error: 'Repository name is missing' },
        { status: 400 }
      );
    }

    console.log('Processing repository:', repo);
    console.log('Organization:', ORGANIZATION);

    // 獲取貢獻者列表
    const contributorsUrl = `https://api.github.com/repos/${ORGANIZATION}/${repo}/contributors`;
    console.log('Fetching contributors from:', contributorsUrl);

    const contributorsResponse = await fetch(contributorsUrl, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!contributorsResponse.ok) {
      const errorData = await contributorsResponse.json().catch(() => ({}));
      console.error('GitHub API Error:', {
        status: contributorsResponse.status,
        statusText: contributorsResponse.statusText,
        data: errorData,
        url: contributorsUrl,
      });
      return NextResponse.json(
        { 
          error: `Failed to fetch contributors: ${contributorsResponse.status} ${contributorsResponse.statusText}`,
          details: errorData
        },
        { status: contributorsResponse.status }
      );
    }

    const contributors = await contributorsResponse.json();
    if (!Array.isArray(contributors)) {
      console.error('Invalid contributors response:', contributors);
      return NextResponse.json(
        { error: 'Invalid contributors response format' },
        { status: 500 }
      );
    }

    console.log('Found contributors:', contributors.length);

    // 獲取每個貢獻者的詳細信息
    const contributorsWithDetails = await Promise.all(
      contributors.map(async (contributor: any) => {
        try {
          // 獲取貢獻者的提交統計
          const statsUrl = `https://api.github.com/repos/${ORGANIZATION}/${repo}/stats/contributors`;
          console.log('Fetching stats for contributor:', contributor.login);

          const statsResponse = await fetch(statsUrl, {
            headers: {
              Authorization: `token ${GITHUB_TOKEN}`,
              Accept: 'application/vnd.github.v3+json',
            },
          });

          if (!statsResponse.ok) {
            console.error('Failed to fetch stats for contributor:', {
              contributor: contributor.login,
              status: statsResponse.status,
              statusText: statsResponse.statusText,
            });
            return {
              login: contributor.login,
              avatar_url: contributor.avatar_url,
              contributions: contributor.contributions,
              additions: 0,
              deletions: 0,
              commits: 0,
              timeSpent: '0 hours',
            };
          }

          const stats = await statsResponse.json();
          if (!Array.isArray(stats)) {
            console.error('Invalid stats response for contributor:', contributor.login);
            return {
              login: contributor.login,
              avatar_url: contributor.avatar_url,
              contributions: contributor.contributions,
              additions: 0,
              deletions: 0,
              commits: 0,
              timeSpent: '0 hours',
            };
          }

          const contributorStats = stats.find((stat: any) => stat.author.login === contributor.login);

          if (!contributorStats) {
            console.log('No stats found for contributor:', contributor.login);
            return {
              login: contributor.login,
              avatar_url: contributor.avatar_url,
              contributions: contributor.contributions,
              additions: 0,
              deletions: 0,
              commits: 0,
              timeSpent: '0 hours',
            };
          }

          // 計算總的添加和刪除行數
          const totalAdditions = contributorStats.weeks.reduce(
            (acc: number, week: any) => acc + week.a,
            0
          );
          const totalDeletions = contributorStats.weeks.reduce(
            (acc: number, week: any) => acc + week.d,
            0
          );

          // 計算總提交數
          const totalCommits = contributorStats.weeks.reduce(
            (acc: number, week: any) => acc + week.c,
            0
          );

          // 計算總時間（以小時為單位）
          let totalHours = 0;
          contributorStats.weeks.forEach((week: any) => {
            // 根據代碼變更量計算時間
            const codeChanges = week.a + week.d; // 總代碼變更行數
            const commits = week.c; // 提交次數

            if (commits > 0) {
              // 基礎時間：每個提交至少需要 15 分鐘
              totalHours += commits * 0.25;

              // 根據代碼變更量調整時間
              if (codeChanges > 0) {
                // 每 100 行代碼變更增加 1 小時
                totalHours += (codeChanges / 100);
              }
            }
          });

          // 格式化時間
          let timeSpent;
          if (totalHours >= 24 * 7) { // 超過一週
            timeSpent = `${Math.round(totalHours / (24 * 7))} weeks`;
          } else if (totalHours >= 24) { // 超過一天
            timeSpent = `${Math.round(totalHours / 24)} days`;
          } else if (totalHours >= 1) { // 超過一小時
            timeSpent = `${Math.round(totalHours)} hours`;
          } else { // 少於一小時
            timeSpent = `${Math.round(totalHours * 60)} minutes`;
          }

          return {
            login: contributor.login,
            avatar_url: contributor.avatar_url,
            contributions: contributor.contributions,
            additions: totalAdditions,
            deletions: totalDeletions,
            commits: totalCommits,
            timeSpent,
          };
        } catch (error) {
          console.error('Error processing contributor:', contributor.login, error);
          return {
            login: contributor.login,
            avatar_url: contributor.avatar_url,
            contributions: contributor.contributions,
            additions: 0,
            deletions: 0,
            commits: 0,
            timeSpent: '0 hours',
          };
        }
      })
    );

    return NextResponse.json(contributorsWithDetails);
  } catch (error) {
    console.error('Error fetching contributor data:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch contributor data',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 