import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ORGANIZATION = process.env.GITHUB_ORGANIZATION;

interface GithubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

interface Branch {
  name: string;
  commitSha: string;
  commitUrl: string;
}

export async function GET(
  request: Request,
  { params }: { params: { repo: string } }
) {
  try {
    console.log(`Fetching branches for repo: ${params.repo}`);
    
    const response = await fetch(
      `https://api.github.com/repos/${ORGANIZATION}/${params.repo}/branches`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      console.error(`GitHub API Error: ${response.status}`);
      throw new Error(`Failed to fetch branches: ${response.statusText}`);
    }

    const branchesData: GithubBranch[] = await response.json();
    console.log(`Retrieved ${branchesData.length} branches for ${params.repo}`);
    
    // Transform the GitHub API response to our simplified Branch format
    const branches: Branch[] = branchesData.map(branch => ({
      name: branch.name,
      commitSha: branch.commit.sha,
      commitUrl: branch.commit.url
    }));
    
    return NextResponse.json(branches);
  } catch (error) {
    console.error('Error fetching repository branches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repository branches' },
      { status: 500 }
    );
  }
} 