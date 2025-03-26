import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Octokit } from 'octokit';

export async function GET(request: NextRequest) {
  const token = (await cookies().get('github_token'))?.value;
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const octokit = new Octokit({ auth: token });
    
    // Get user's organizations
    const response = await octokit.request('GET /user/orgs');
    
    return NextResponse.json({ orgs: response.data });
  } catch (error: any) {
    console.error('Error fetching GitHub organizations:', error);
    return NextResponse.json(
      { error: `Error fetching organizations: ${error.message}` }, 
      { status: 500 }
    );
  }
} 