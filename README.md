# GitHub Classroom Tracker

A web application for teachers to track and analyze student group projects on GitHub. This tool helps monitor team collaboration, track contributions, and analyze project progress.

## Features

- Repository Analytics
  - Track repository activities
  - Monitor commits and issues
  - View contribution statistics

- Team Collaboration
  - Monitor team contributions
  - Track collaboration patterns
  - Identify individual contributions

- Progress Tracking
  - Track student progress
  - Monitor project milestones
  - View project timeline

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- GitHub API

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/fatkin1012/COMP3122_Project_Classroom_Manager.git
cd COMP3122_Project_Classroom_Manager
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_ORGANIZATION=your_organization_name
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

- `/api/repositories` - Get all repositories under the organization
- `/api/repositories/:repo` - Get details of a specific repository
- `/api/repositories/:repo/issues` - Get all issues under a repository
- `/api/repositories/:repo/commits` - Get commits under a repository
- `/api/repositories/:repo/contributors` - Get contributors of a repository

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
