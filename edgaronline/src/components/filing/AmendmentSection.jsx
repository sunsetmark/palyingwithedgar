import React from 'react';
import { useForm } from 'react-hook-form';
import { useFiling } from '../../context/FilingContext';

/**
 * Amendment Information Section (for /A forms)
 */
const AmendmentSection = () => {
  const { state, updateAmendment } = useFiling();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: state.amendment
  });
  
  const onSubmit = (data) => {
    updateAmendment(data);
  };
  
  return (
    <div>
      <p className="usa-intro">
        This is an amendment to a previously filed form. Please provide the original filing information.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="usa-form-group">
          <label className="usa-label" htmlFor="dateOfOriginalSubmission">
            Date of Original Submission <span className="text-secondary-dark">*</span>
          </label>
          <span className="usa-hint">Format: YYYY-MM-DD</span>
          <input
            className={`usa-input ${errors.dateOfOriginalSubmission ? 'usa-input--error' : ''}`}
            id="dateOfOriginalSubmission"
            type="date"
            {...register('dateOfOriginalSubmission', {
              required: 'Date of original submission is required',
              validate: (value) => {
                const date = new Date(value);
                const today = new Date();
                return date <= today || 'Date cannot be in the future';
              }
            })}
            onBlur={handleSubmit(onSubmit)}
          />
          {errors.dateOfOriginalSubmission && (
            <span className="usa-error-message">
              {errors.dateOfOriginalSubmission.message}
            </span>
          )}
        </div>
        
        <div className="usa-alert usa-alert--info margin-top-3">
          <div className="usa-alert__body">
            <p className="usa-alert__text">
              An amendment replaces the original filing in its entirety. You must complete all sections of this form, 
              not just the information being corrected.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AmendmentSection;






