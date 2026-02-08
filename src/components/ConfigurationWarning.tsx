import { AlertTriangle, ExternalLink } from 'lucide-react';

export function ConfigurationWarning() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Configuration Required
            </h1>
            <p className="text-sm text-gray-600">
              Newton's Lens needs to be configured before use
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 mb-2 font-semibold">
              Missing Supabase Configuration
            </p>
            <p className="text-sm text-yellow-700">
              The application cannot connect to the database because the Supabase 
              environment variables are not configured.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Setup (5 minutes)
            </h2>
            
            <ol className="space-y-4 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <div>
                  <p className="font-semibold mb-1">Create a Supabase Project</p>
                  <p className="text-gray-600 mb-2">
                    Sign up for free at Supabase and create a new project
                  </p>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    Go to Supabase Dashboard
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <div>
                  <p className="font-semibold mb-1">Get Your API Credentials</p>
                  <p className="text-gray-600">
                    Go to Settings → API in your Supabase project and copy:
                  </p>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
                    <li>Project URL</li>
                    <li>Anon/Public Key</li>
                  </ul>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div>
                  <p className="font-semibold mb-1">Create Environment File</p>
                  <p className="text-gray-600 mb-2">
                    Create a <code className="bg-gray-100 px-1 rounded">.env</code> file 
                    in the project root:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key`}
                  </pre>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <div>
                  <p className="font-semibold mb-1">Restart the Application</p>
                  <p className="text-gray-600">
                    Stop the development server and run <code className="bg-gray-100 px-1 rounded">npm run dev</code> again
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Note:</strong> A <code className="bg-gray-100 px-1 rounded">.env.example</code> file 
              is provided in the project root as a template.
            </p>
            <p className="text-sm text-gray-600">
              For detailed setup instructions, see the{' '}
              <a 
                href="https://github.com/Sandeep4364/newtons-lens/blob/main/QUICKSTART.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                QUICKSTART.md
              </a>
              {' '}guide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
