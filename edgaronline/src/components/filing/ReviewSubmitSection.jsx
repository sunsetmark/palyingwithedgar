import React, { useState } from 'react';
import { useFiling } from '../../context/FilingContext';
import { getFormConfig } from '../../config/formConfig';
import api from '../../services/api';

/**
 * Review and Submit Section
 */
const ReviewSubmitSection = () => {
  const { state, setSubmitting, setSubmissionError } = useFiling();
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const config = getFormConfig(state.formType);
  
  // Validate the filing
  const validateFiling = () => {
    const errors = [];
    
    // Validate issuer
    if (!state.issuer.cik) errors.push('Issuer CIK is required');
    if (!state.issuer.name) errors.push('Issuer name is required');
    
    // Validate reporting owners
    if (state.reportingOwners.length === 0) {
      errors.push('At least one reporting owner is required');
    } else {
      state.reportingOwners.forEach((owner, index) => {
        if (!owner.cik) errors.push(`Reporting Owner ${index + 1}: CIK is required`);
        if (!owner.ccc) errors.push(`Reporting Owner ${index + 1}: CCC is required`);
        if (!owner.name) errors.push(`Reporting Owner ${index + 1}: Name is required`);
        
        const hasRelationship = owner.relationships?.isDirector || 
                               owner.relationships?.isOfficer || 
                               owner.relationships?.isTenPercentOwner || 
                               owner.relationships?.isOther;
        if (!hasRelationship) {
          errors.push(`Reporting Owner ${index + 1}: At least one relationship must be selected`);
        }
      });
    }
    
    // Validate transactions (for Forms 4 & 5)
    if (config.sections.showTransactions) {
      const totalTransactions = state.nonDerivativeTransactions.length + state.derivativeTransactions.length;
      const totalHoldings = state.nonDerivativeHoldings.length + state.derivativeHoldings.length;
      
      if (totalTransactions === 0 && totalHoldings === 0) {
        errors.push('At least one transaction or holding is required for this form type');
      }
    }
    
    // Validate holdings (for Form 3)
    if (state.formType === '3' || state.formType === '3/A') {
      const totalHoldings = state.nonDerivativeHoldings.length + state.derivativeHoldings.length;
      if (totalHoldings === 0) {
        errors.push('Form 3 requires at least one holding to be reported');
      }
    }
    
    // Validate amendment
    if (config.isAmendment && !state.amendment.dateOfOriginalSubmission) {
      errors.push('Date of original submission is required for amendments');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };
  
  const handleValidate = async () => {
    setIsValidating(true);
    setValidationErrors([]);
    
    // Client-side validation
    if (!validateFiling()) {
      setIsValidating(false);
      return;
    }
    
    try {
      // Server-side validation
      const response = await api.post('/api/filings/validate', {
        formType: state.formType,
        data: state
      });
      
      if (response.data.valid) {
        setValidationErrors([]);
        alert('Filing validation passed! You can now submit your filing.');
      } else {
        setValidationErrors(response.data.errors || ['Validation failed']);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationErrors([error.response?.data?.error || 'Validation failed. Please try again.']);
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!validateFiling()) {
      alert('Please fix validation errors before submitting.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to submit this filing to the SEC? This action cannot be undone.')) {
      return;
    }
    
    setSubmitting(true);
    setSubmissionError(null);
    
    try {
      const response = await api.post('/api/filings/submit', {
        formType: state.formType,
        data: state
      });
      
      alert('Filing submitted successfully!');
      // TODO: Navigate to submission confirmation page
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionError(error.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div>
      <p className="usa-intro">
        Review your filing carefully before submission. Once submitted, the filing will be sent to the SEC.
      </p>
      
      {/* Summary */}
      <div className="usa-summary-box margin-bottom-3">
        <div className="usa-summary-box__body">
          <h3 className="usa-summary-box__heading">Filing Summary</h3>
          <div className="usa-summary-box__text">
            <ul className="usa-list">
              <li><strong>Form Type:</strong> {state.formType}</li>
              <li><strong>Issuer:</strong> {state.issuer.name || 'Not specified'} (CIK: {state.issuer.cik || 'Not specified'})</li>
              <li><strong>Reporting Owners:</strong> {state.reportingOwners.length}</li>
              {config.sections.showTransactions && (
                <>
                  <li><strong>Non-Derivative Transactions:</strong> {state.nonDerivativeTransactions.length}</li>
                  <li><strong>Derivative Transactions:</strong> {state.derivativeTransactions.length}</li>
                </>
              )}
              <li><strong>Non-Derivative Holdings:</strong> {state.nonDerivativeHoldings.length}</li>
              <li><strong>Derivative Holdings:</strong> {state.derivativeHoldings.length}</li>
              <li><strong>Footnotes:</strong> {state.footnotes.length}</li>
              {state.remarks && <li><strong>Remarks:</strong> Yes</li>}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="usa-alert usa-alert--error margin-bottom-3">
          <div className="usa-alert__body">
            <h4 className="usa-alert__heading">Validation Errors</h4>
            <ul className="usa-list">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Submission Error */}
      {state.submissionError && (
        <div className="usa-alert usa-alert--error margin-bottom-3">
          <div className="usa-alert__body">
            <h4 className="usa-alert__heading">Submission Error</h4>
            <p className="usa-alert__text">{state.submissionError}</p>
          </div>
        </div>
      )}
      
      {/* Details Sections */}
      <div className="usa-accordion margin-bottom-3">
        {/* Issuer Details */}
        <div className="usa-accordion__item">
          <h4 className="usa-accordion__heading">
            <button
              type="button"
              className="usa-accordion__button"
              aria-expanded="false"
              aria-controls="issuer-details"
            >
              Issuer Information
            </button>
          </h4>
          <div id="issuer-details" className="usa-accordion__content usa-prose" hidden>
            <dl>
              <dt><strong>CIK:</strong></dt>
              <dd>{state.issuer.cik || 'Not specified'}</dd>
              
              <dt><strong>Name:</strong></dt>
              <dd>{state.issuer.name || 'Not specified'}</dd>
              
              <dt><strong>Trading Symbol:</strong></dt>
              <dd>{state.issuer.tradingSymbol || 'Not specified'}</dd>
              
              <dt><strong>Address:</strong></dt>
              <dd>
                {state.issuer.address.street1}<br />
                {state.issuer.address.street2 && <>{state.issuer.address.street2}<br /></>}
                {state.issuer.address.city}, {state.issuer.address.state} {state.issuer.address.zipCode}
              </dd>
            </dl>
          </div>
        </div>
        
        {/* Reporting Owners Details */}
        <div className="usa-accordion__item">
          <h4 className="usa-accordion__heading">
            <button
              type="button"
              className="usa-accordion__button"
              aria-expanded="false"
              aria-controls="owners-details"
            >
              Reporting Owners ({state.reportingOwners.length})
            </button>
          </h4>
          <div id="owners-details" className="usa-accordion__content usa-prose" hidden>
            {state.reportingOwners.map((owner, index) => (
              <div key={index} className="margin-bottom-3 padding-bottom-2 border-bottom-1px border-base-lighter">
                <h5>Owner {index + 1}: {owner.name || 'Not specified'}</h5>
                <dl>
                  <dt><strong>CIK:</strong></dt>
                  <dd>{owner.cik || 'Not specified'}</dd>
                  
                  <dt><strong>Relationships:</strong></dt>
                  <dd>
                    {owner.relationships?.isDirector && 'Director, '}
                    {owner.relationships?.isOfficer && `Officer (${owner.officerTitle || 'Title not specified'}), `}
                    {owner.relationships?.isTenPercentOwner && '10% Owner, '}
                    {owner.relationships?.isOther && `Other (${owner.relationships.otherText || 'Not specified'})`}
                  </dd>
                </dl>
              </div>
            ))}
          </div>
        </div>
        
        {/* Transactions (if applicable) */}
        {config.sections.showTransactions && (state.nonDerivativeTransactions.length > 0 || state.derivativeTransactions.length > 0) && (
          <div className="usa-accordion__item">
            <h4 className="usa-accordion__heading">
              <button
                type="button"
                className="usa-accordion__button"
                aria-expanded="false"
                aria-controls="transactions-details"
              >
                Transactions ({state.nonDerivativeTransactions.length + state.derivativeTransactions.length})
              </button>
            </h4>
            <div id="transactions-details" className="usa-accordion__content usa-prose" hidden>
              <p>Transaction details will be displayed here.</p>
            </div>
          </div>
        )}
        
        {/* Holdings */}
        {(state.nonDerivativeHoldings.length > 0 || state.derivativeHoldings.length > 0) && (
          <div className="usa-accordion__item">
            <h4 className="usa-accordion__heading">
              <button
                type="button"
                className="usa-accordion__button"
                aria-expanded="false"
                aria-controls="holdings-details"
              >
                Holdings ({state.nonDerivativeHoldings.length + state.derivativeHoldings.length})
              </button>
            </h4>
            <div id="holdings-details" className="usa-accordion__content usa-prose" hidden>
              <p>Holdings details will be displayed here.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="display-flex flex-justify margin-top-4">
        <button
          type="button"
          className="usa-button usa-button--outline"
          onClick={handleValidate}
          disabled={isValidating || state.isSubmitting}
        >
          {isValidating ? 'Validating...' : 'Validate Filing'}
        </button>
        
        <button
          type="button"
          className="usa-button"
          onClick={handleSubmit}
          disabled={state.isSubmitting || validationErrors.length > 0}
        >
          {state.isSubmitting ? 'Submitting...' : 'Submit to SEC'}
        </button>
      </div>
      
      {/* Important Notice */}
      <div className="usa-alert usa-alert--warning margin-top-3">
        <div className="usa-alert__body">
          <h4 className="usa-alert__heading">Important Notice</h4>
          <p className="usa-alert__text">
            By submitting this filing, you certify that the information provided is true, complete, and correct 
            to the best of your knowledge. False or misleading statements may result in civil and criminal penalties.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmitSection;






