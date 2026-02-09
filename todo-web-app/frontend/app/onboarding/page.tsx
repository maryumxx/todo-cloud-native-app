'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wizard } from '../../components/onboarding/wizard';
import { WelcomeStep } from '../../components/onboarding/steps/welcome';
import { FeaturesStep } from '../../components/onboarding/steps/features';
import { FirstTaskStep } from '../../components/onboarding/steps/first-task';
import { CompleteStep } from '../../components/onboarding/steps/complete';
import { apiClient } from '../../lib/api-client';

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleComplete = async () => {
    try {
      await apiClient.completeOnboarding();
      router.push('/dashboard/tasks');
    } catch (error) {
      // Still navigate even if the API call fails
      router.push('/dashboard/tasks');
    }
  };

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome',
      component: <WelcomeStep />,
    },
    {
      id: 'features',
      title: 'Features',
      component: <FeaturesStep />,
    },
    {
      id: 'first-task',
      title: 'First Task',
      component: <FirstTaskStep />,
    },
    {
      id: 'complete',
      title: 'Complete',
      component: <CompleteStep />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to TodoApp</h1>
            <p className="text-gray-600 dark:text-gray-400">Let's get you set up in just a few steps</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
            <Wizard steps={steps} onComplete={handleComplete} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
