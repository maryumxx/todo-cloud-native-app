import { ReactNode } from 'react';

interface ResponsiveGuideProps {
  children: ReactNode;
}

export default function ResponsiveGuide({ children }: ResponsiveGuideProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Responsive Design Guide</h1>
        <p className="text-gray-600 dark:text-gray-400">
          This application is built with responsive design in mind, using Tailwind CSS utility classes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-2">Mobile (320px - 768px)</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Bottom navigation bar, collapsible sidebar, compact layouts.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-2">Tablet (768px - 1024px)</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Adaptive layouts, optimized touch targets, balanced spacing.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-2">Desktop (1024px+)</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Full sidebar navigation, spacious layouts, advanced features.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-200 mb-2">Responsive Features Implemented:</h3>
        <ul className="list-disc pl-5 space-y-1 text-blue-700 dark:text-blue-300">
          <li>Mobile-first approach with progressive enhancement</li>
          <li>Flexible grid layouts using Tailwind's grid system</li>
          <li>Adaptive navigation (sidebar on desktop, bottom nav on mobile)</li>
          <li>Touch-friendly controls and adequate spacing</li>
          <li>Properly sized text and interactive elements</li>
          <li>Optimized images and media for different screen sizes</li>
        </ul>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Test Responsive Behavior:</h3>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>Resize your browser window to test different screen sizes</li>
          <li>Check that navigation adapts appropriately (sidebar vs bottom nav)</li>
          <li>Verify that cards and content remain readable on all devices</li>
          <li>Test touch interactions on mobile screen sizes</li>
          <li>Confirm that text remains legible and properly sized</li>
          <li>Ensure buttons and interactive elements are adequately spaced</li>
        </ol>
      </div>
    </div>
  );
}