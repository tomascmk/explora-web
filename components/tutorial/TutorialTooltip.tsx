'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TutorialStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface TutorialTooltipProps {
  steps: TutorialStep[];
  tutorialKey: string;
}

export function TutorialTooltip({ steps, tutorialKey }: TutorialTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const completed = localStorage.getItem(`tutorial_${tutorialKey}_completed`);
    if (!completed && steps.length > 0) {
      setTimeout(() => setShow(true), 500);
    }
  }, [tutorialKey, steps.length]);

  useEffect(() => {
    if (!show || currentStep >= steps.length) return;

    const step = steps[currentStep];
    const element = document.querySelector(step.target);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      const placement = step.placement || 'bottom';
      
      let top = 0;
      let left = 0;

      switch (placement) {
        case 'bottom':
          top = rect.bottom + window.scrollY + 10;
          left = rect.left + window.scrollX + rect.width / 2;
          break;
        case 'top':
          top = rect.top + window.scrollY - 10;
          left = rect.left + window.scrollX + rect.width / 2;
          break;
        case 'left':
          top = rect.top + window.scrollY + rect.height / 2;
          left = rect.left + window.scrollX - 10;
          break;
        case 'right':
          top = rect.top + window.scrollY + rect.height / 2;
          left = rect.right + window.scrollX + 10;
          break;
      }

      setPosition({ top, left });
      
      // Highlight element
      element.classList.add('tutorial-highlight');
      
      return () => {
        element.classList.remove('tutorial-highlight');
      };
    }
  }, [show, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(`tutorial_${tutorialKey}_completed`, 'true');
    setShow(false);
  };

  if (!show || currentStep >= steps.length) return null;

  const step = steps[currentStep];

  return (
    <>
      <style jsx global>{`
        .tutorial-highlight {
          position: relative;
          z-index: 9999;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5);
          border-radius: 8px;
        }
      `}</style>
      
      <div
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
          transform: 'translateX(-50%)',
          zIndex: 10000,
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-primary)',
        }}
        className="w-80 rounded-lg shadow-2xl p-4 border-2"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{step.title}</h3>
          <button
            onClick={handleSkip}
            className=""
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-body)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="mb-4" style={{ color: 'var(--color-text-body)' }}>{step.content}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {currentStep + 1} / {steps.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="px-3 py-1 text-sm"
              style={{ color: 'var(--color-text-body)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-heading)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-body)')}
            >
              Saltar
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-1 text-sm text-white rounded"
              style={{ backgroundColor: 'var(--color-primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
            >
              {currentStep < steps.length - 1 ? 'Siguiente' : 'Finalizar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
