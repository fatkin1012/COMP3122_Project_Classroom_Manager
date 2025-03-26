# GitHub Classroom Tracker

A web application that helps instructors track student activities and collaboration in GitHub repositories for group projects.

## Features

- **Real-time GitHub data fetching**: Connect to the GitHub API to monitor repositories, commits, issues, and pull requests
- **Comprehensive tracking**: Track student activities like commit frequency, project boards, issues, code changes, discussions/comments, and more
- **Contribution analysis**: Identify each student's contributions and detect patterns like free-riders or deadline fighters
- **Dashboard visualization**: Visual representation of team performance and individual contributions
- **Insights and recommendations**: Automated analysis of team dynamics and collaboration patterns

## Prerequisites

- Node.js (v14+)
- npm
- GitHub account with access to student repositories

## Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd github-classroom-tracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure GitHub OAuth**

- Go to GitHub Developer Settings > OAuth Apps > New OAuth App
- Set the Application name, Homepage URL (http://localhost:3000), and Authorization callback URL (http://localhost:3000/api/auth/callback)
- After creating the application, copy the Client ID and Client Secret

4. **Environment Configuration**

Create a `.env.local` file in the project root with:

```
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. **Login with GitHub**: Authenticate with your GitHub account
2. **Select Organization**: Choose the GitHub organization that contains student repositories
3. **Select Repository**: Choose a student team repository to analyze
4. **View Analytics**: Explore the dashboard with detailed insights:
   - Commit activity and distribution
   - Issue tracking and resolution times
   - Pull request statistics
   - Individual student contributions
   - Potential collaboration issues

## Common Issues

- **Authentication Errors**: Ensure your GitHub OAuth credentials are correctly configured in `.env.local`
- **Missing Data**: The application can only access repositories that your GitHub account has permission to view
- **Rate Limiting**: GitHub API has rate limits. For large projects, you might need to implement pagination

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Data Visualization**: Chart.js
- **API Integration**: GitHub API via Octokit

## License

This project is licensed under the MIT License - see the LICENSE file for details.
