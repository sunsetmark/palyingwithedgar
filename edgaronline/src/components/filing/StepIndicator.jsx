import React from 'react';

/**
 * Step indicator component showing progress through the filing wizard
 */
const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="usa-step-indicator usa-step-indicator--counters" aria-label="progress">
      <ol className="usa-step-indicator__segments">
        {steps.map((step, index) => {
          const isCurrent = index === currentStep;
          const isComplete = index < currentStep;
          
          let statusClass = '';
          if (isCurrent) statusClass = 'usa-step-indicator__segment--current';
          else if (isComplete) statusClass = 'usa-step-indicator__segment--complete';
          
          return (
            <li
              key={step.id}
              className={`usa-step-indicator__segment ${statusClass}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="usa-step-indicator__segment-label">
                {step.label}
                {isCurrent && <span className="usa-sr-only"> current step</span>}
                {isComplete && <span className="usa-sr-only"> completed</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default StepIndicator;






