import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { GITHUB_CONFIG } from '@/config/github';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  if (!code) {
    return new Response('Authorization code missing', { status: 400 });
  }
  
  try {
    // Exchange access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CONFIG.clientId,
        client_secret: GITHUB_CONFIG.clientSecret,
        code,
        redirect_uri: GITHUB_CONFIG.redirectUri,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('GitHub token exchange error:', tokenData.error);
      return new Response(`Authorization error: ${tokenData.error_description || tokenData.error}`, { 
        status: 400 
      });
    }
    
    const { access_token } = tokenData;
    
    // Get user information
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });
    
    const userData = await userResponse.json();
    
    // Store session data
    await cookies().set('github_token', access_token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    // Redirect back to the application
    return Response.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('GitHub authorization processing error:', error);
    return new Response('Authorization processing error', { status: 500 });
  }
} 