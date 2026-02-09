'use client';

import React from 'react';

export function WelcomeStep() {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold">Welcome to Todo App!</h1>

      <p className="text-lg text-muted-foreground max-w-md mx-auto">
        We&apos;re excited to have you here. Let&apos;s take a quick tour to help you get started
        with managing your tasks effectively.
      </p>

      <div className="pt-4">
        <p className="text-sm text-muted-foreground">
          This will only take a minute
        </p>
      </div>
    </div>
  );
}

export default WelcomeStep;
