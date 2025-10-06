import Link from 'next/link'
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

export default function HomePage() {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">

          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-16">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  altrp CMS
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  Content Management System powered by Payload CMS
                </p>

                <div className="space-y-4">
                  <Link
                    href="/admin"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                  >
                    Open Admin Panel
                  </Link>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>Admin Panel: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">/admin</code></p>
                    <p>API Endpoint: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">/api</code></p>
                  </div>
                </div>
              </div>

              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Content Management
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Manage posts, pages, categories, and media files with an intuitive interface.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    User Management
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Control user access and permissions with role-based authentication.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    API Ready
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Built-in REST and GraphQL APIs for seamless integration with your frontend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
