'use client';

import React from 'react';

export function CompleteStep() {
  return (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-bold">You&apos;re All Set!</h2>

      <p className="text-lg text-muted-foreground max-w-md mx-auto">
        Your account is ready. Start creating tasks, scheduling events, and
        staying organized.
      </p>

      <div className="pt-4 space-y-2">
        <p className="text-sm font-medium">Quick tips:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Use the + button to quickly add tasks</li>
          <li>Check the calendar for upcoming events</li>
          <li>Customize your theme in settings</li>
        </ul>
      </div>
    </div>
  );
}

export default CompleteStep;
