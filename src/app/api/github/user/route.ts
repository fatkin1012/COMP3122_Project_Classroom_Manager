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
    
    // Get user information
    const response = await octokit.request('GET /user');
    
    return NextResponse.json({ user: response.data });
  } catch (error: any) {
    console.error('Error fetching GitHub user info:', error);
    return NextResponse.json(
      { error: `Error fetching user info: ${error.message}` }, 
      { status: error.status || 500 }
    );
  }
} 