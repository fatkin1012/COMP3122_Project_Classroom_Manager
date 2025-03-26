import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Octokit } from 'octokit';

// Get the list of repositories for an organization
export async function GET(
  request: NextRequest,
  { params }: { params: { org: string } }
) {
  const token = (await cookies().get('github_token'))?.value;
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { org } = params;
  
  if (!org) {
    return NextResponse.json({ error: 'Organization name is missing' }, { status: 400 });
  }
  
  try {
    const octokit = new Octokit({ auth: token });
    
    // Get organization repositories
    const response = await octokit.request('GET /orgs/{org}/repos', {
      org,
      type: 'all',
      per_page: 100
    });
    
    return NextResponse.json({ repos: response.data });
  } catch (error: any) {
    console.error(`Error fetching repositories for organization ${org}:`, error);
    return NextResponse.json(
      { error: `Error fetching repository information: ${error.message}` }, 
      { status: error.status || 500 }
    );
  }
} 