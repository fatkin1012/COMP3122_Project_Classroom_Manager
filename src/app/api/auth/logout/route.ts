import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  // Clear cookies
  await cookies().delete('github_token');
  
  // Redirect to homepage
  return Response.redirect(new URL('/', request.url));
} 