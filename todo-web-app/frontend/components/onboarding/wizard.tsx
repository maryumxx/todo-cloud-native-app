'use client';

import React, { useState } from 'react';
import { useReducedMotion } from '../../hooks/use-reduced-motion';

interface WizardStep {
  id: string;
  title: string;
  component: React.ReactNode;
}

interface WizardProps {
  steps: WizardStep[];
  onComplete: () => void;
}

export function Wizard({ steps, onComplete }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const transitionClass = prefersReducedMotion
    ? ''
    : 'transition-opacity duration-300';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-muted h-2">
        <div
          className={`h-full bg-primary ${prefersReducedMotion ? '' : 'transition-all duration-500'}`}
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center gap-2 py-6">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentStep
                ? 'bg-primary'
                : index < currentStep
                ? 'bg-primary/50'
                : 'bg-muted'
            } ${prefersReducedMotion ? '' : 'transition-colors duration-200'}`}
            aria-label={`Step ${index + 1}: ${step.title}`}
            aria-current={index === currentStep ? 'step' : undefined}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className={`flex-1 flex items-center justify-center p-6 ${transitionClass}`}>
        <div className="w-full max-w-lg">
          {steps[currentStep].component}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between p-6 border-t border-border">
        <button
          onClick={handlePrevious}
          disabled={isFirstStep}
          className={`px-6 py-2 rounded-md border border-input hover:bg-muted transition-colors ${
            isFirstStep ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {isLastStep ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
}

export default Wizard;
