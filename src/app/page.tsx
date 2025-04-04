import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          GitHub Classroom Tracker
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A tool for teachers to analyze student group projects,
          track GitHub activities, and monitor team collaboration
        </p>
        
        <div className="flex flex-col items-center space-y-6">
          <Link 
            href="/assignment" 
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-md transition"
          >
            Go to Dashboard
          </Link>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Repository Analytics</h3>
              <p className="text-gray-600">
                Track repository activities, commits, and issues
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Team Collaboration</h3>
              <p className="text-gray-600">
                Monitor team contributions and collaboration patterns
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Progress Tracking</h3>
              <p className="text-gray-600">
                Track student progress and project milestones
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
