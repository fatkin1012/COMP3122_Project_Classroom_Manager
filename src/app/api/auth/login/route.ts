import { NextRequest } from 'next/server';
import { GITHUB_CONFIG, GITHUB_SCOPES } from '@/config/github';

export function GET(request: NextRequest) {
  const clientId = GITHUB_CONFIG.clientId;
  const redirectUri = GITHUB_CONFIG.redirectUri;
  
  if (!clientId || !redirectUri) {
    return new Response('GitHub client configuration missing', { status: 500 });
  }
  
  // Build GitHub authorization URL
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', GITHUB_SCOPES);
  
  // Generate random state parameter to prevent CSRF
  const state = Math.random().toString(36).substring(2, 15);
  authUrl.searchParams.set('state', state);
  
  // Redirect to GitHub authorization page
  return Response.redirect(authUrl.toString());
} 