import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FilingProvider, useFiling } from '../context/FilingContext';
import { getFormConfig } from '../config/formConfig';
import StepIndicator from '../components/filing/StepIndicator';

// Import section components
import FormTypeStep from '../components/filing/FormTypeStep';
import AmendmentSection from '../components/filing/AmendmentSection';
import IssuerSection from '../components/filing/IssuerSection';
import ReportingOwnerSection from '../components/filing/ReportingOwnerSection';
import TransactionSection from '../components/filing/TransactionSection';
import HoldingsSection from '../components/filing/HoldingsSection';
import FootnotesSection from '../components/filing/FootnotesSection';
import ReviewSubmitSection from '../components/filing/ReviewSubmitSection';

// Component map for dynamic rendering
const componentMap = {
  FormTypeStep,
  AmendmentSection,
  IssuerSection,
  ReportingOwnerSection,
  TransactionSection,
  HoldingsSection,
  FootnotesSection,
  ReviewSubmitSection
};

/**
 * Main Filing Wizard Component
 */
function FilingWizardContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, setFormType, nextStep, prevStep, setStep } = useFiling();
  
  // Get form type from URL params or state
  const formTypeParam = searchParams.get('type');
  
  useEffect(() => {
    if (formTypeParam && !state.formType) {
      setFormType(formTypeParam);
    } else if (!formTypeParam && !state.formType) {
      // No form type selected, stay on form type selection
      setFormType(null);
    }
  }, [formTypeParam, state.formType, setFormType]);
  
  // Get configuration for current form type
  const config = state.formType ? getFormConfig(state.formType) : null;
  
  // If no form type selected yet, show form type selection
  if (!state.formType || !config) {
    return (
      <div className="usa-section">
        <div className="grid-container">
          <h1>Create New Filing</h1>
          <FormTypeStep />
        </div>
      </div>
    );
  }
  
  const currentStepConfig = config.steps[state.currentStep];
  const CurrentStepComponent = componentMap[currentStepConfig.component];
  
  const handleNext = () => {
    // TODO: Add validation before allowing next
    nextStep();
  };
  
  const handlePrevious = () => {
    prevStep();
  };
  
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/dashboard');
    }
  };
  
  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === config.steps.length - 1;
  
  return (
    <div className="usa-section">
      <div className="grid-container">
        {/* Header */}
        <div className="margin-bottom-3">
          <h1 className="margin-bottom-1">{config.title}</h1>
          <p className="text-base-dark">{config.description}</p>
        </div>
        
        {/* Step Indicator */}
        <div className="margin-bottom-4">
          <StepIndicator steps={config.steps} currentStep={state.currentStep} />
        </div>
        
        {/* Main Content */}
        <div className="usa-card padding-4 margin-bottom-3">
          <h2 className="margin-top-0">{currentStepConfig.label}</h2>
          
          {/* Render current step component */}
          {CurrentStepComponent ? (
            <CurrentStepComponent />
          ) : (
            <div className="usa-alert usa-alert--warning">
              <div className="usa-alert__body">
                <p className="usa-alert__text">
                  This section is under development.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Buttons */}
        <div className="display-flex flex-justify">
          <div>
            <button
              type="button"
              className="usa-button usa-button--outline"
              onClick={handleCancel}
            >
              Cancel
            </button>
            
            {!isFirstStep && (
              <button
                type="button"
                className="usa-button usa-button--outline margin-left-2"
                onClick={handlePrevious}
              >
                Previous
              </button>
            )}
          </div>
          
          <div>
            <button
              type="button"
              className="usa-button usa-button--secondary margin-right-2"
            >
              Save Draft
            </button>
            
            {!isLastStep ? (
              <button
                type="button"
                className="usa-button"
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="usa-button"
                onClick={() => {/* Handle final submission */}}
              >
                Submit Filing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapper component that provides the FilingContext
 */
const FilingWizard = () => {
  return (
    <FilingProvider>
      <FilingWizardContent />
    </FilingProvider>
  );
};

export default FilingWizard;
