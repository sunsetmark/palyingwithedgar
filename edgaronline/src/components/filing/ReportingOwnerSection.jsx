import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFiling } from '../../context/FilingContext';
import { getFormConfig } from '../../config/formConfig';
import api from '../../services/api';

/**
 * Single Reporting Owner Form
 */
const ReportingOwnerForm = ({ owner, index, onUpdate, onRemove, canRemove }) => {
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [isExpanded, setIsExpanded] = useState(!owner?.cik);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: owner || {
      cik: '',
      ccc: '',
      name: '',
      address: {
        street1: '',
        street2: '',
        city: '',
        state: '',
        zipCode: ''
      },
      relationships: {
        isDirector: false,
        isOfficer: false,
        isTenPercentOwner: false,
        isOther: false,
        otherText: ''
      },
      officerTitle: ''
    }
  });
  
  const watchIsOther = watch('relationships.isOther');
  const watchIsOfficer = watch('relationships.isOfficer');
  
  const onSubmit = (data) => {
    onUpdate(data);
  };
  
  const handleLookupCik = async () => {
    const cik = document.getElementById(`owner-${index}-cik`).value;
    if (!cik || cik.length < 1) {
      setLookupError('Please enter a CIK number');
      return;
    }
    
    setLoading(true);
    setLookupError('');
    
    try {
      const response = await api.get(`/api/cik/validate/${cik}`);
      const { entity } = response.data;
      
      // Populate form fields
      setValue('name', entity.name || '');
      
      // Parse address
      const addresses = entity.addresses?.mailing;
      if (addresses) {
        setValue('address.street1', addresses.street1 || '');
        setValue('address.street2', addresses.street2 || '');
        setValue('address.city', addresses.city || '');
        setValue('address.state', addresses.stateOrCountry || '');
        setValue('address.zipCode', addresses.zipCode || '');
      }
      
      // Trigger validation and save
      handleSubmit(onSubmit)();
    } catch (error) {
      console.error('CIK lookup error:', error);
      setLookupError(error.response?.data?.error || 'Failed to lookup CIK.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="usa-card margin-bottom-3">
      <div className="usa-card__container">
        <div className="usa-card__header">
          <div className="display-flex flex-justify">
            <h3 className="usa-card__heading margin-y-0">
              Reporting Owner {index + 1}
              {owner?.name && ` - ${owner.name}`}
            </h3>
            <div>
              <button
                type="button"
                className="usa-button usa-button--unstyled"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
              >
                {isExpanded ? '▲ Collapse' : '▼ Expand'}
              </button>
              {canRemove && (
                <button
                  type="button"
                  className="usa-button usa-button--unstyled text-secondary margin-left-2"
                  onClick={() => onRemove(index)}
                >
                  ✕ Remove
                </button>
              )}
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="usa-card__body">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* CIK and CCC */}
              <div className="grid-row grid-gap">
                <div className="grid-col-12 tablet:grid-col-8">
                  <div className="usa-form-group">
                    <label className="usa-label" htmlFor={`owner-${index}-cik`}>
                      Reporting Owner CIK <span className="text-secondary-dark">*</span>
                    </label>
                    <div className="display-flex">
                      <input
                        className={`usa-input ${errors.cik ? 'usa-input--error' : ''}`}
                        id={`owner-${index}-cik`}
                        type="text"
                        maxLength="10"
                        {...register('cik', {
                          required: 'CIK is required',
                          pattern: {
                            value: /^\d{1,10}$/,
                            message: 'CIK must be numeric'
                          }
                        })}
                        onBlur={handleSubmit(onSubmit)}
                      />
                      <button
                        type="button"
                        className="usa-button usa-button--outline margin-left-1"
                        onClick={handleLookupCik}
                        disabled={loading}
                      >
                        {loading ? 'Looking up...' : 'Lookup'}
                      </button>
                    </div>
                    {errors.cik && (
                      <span className="usa-error-message">{errors.cik.message}</span>
                    )}
                    {lookupError && (
                      <span className="usa-error-message">{lookupError}</span>
                    )}
                  </div>
                </div>
                
                <div className="grid-col-12 tablet:grid-col-4">
                  <div className="usa-form-group">
                    <label className="usa-label" htmlFor={`owner-${index}-ccc`}>
                      CCC (8 characters) <span className="text-secondary-dark">*</span>
                    </label>
                    <input
                      className={`usa-input ${errors.ccc ? 'usa-input--error' : ''}`}
                      id={`owner-${index}-ccc`}
                      type="password"
                      maxLength="8"
                      {...register('ccc', {
                        required: 'CCC is required',
                        minLength: {
                          value: 8,
                          message: 'CCC must be 8 characters'
                        },
                        maxLength: {
                          value: 8,
                          message: 'CCC must be 8 characters'
                        }
                      })}
                      onBlur={handleSubmit(onSubmit)}
                    />
                    {errors.ccc && (
                      <span className="usa-error-message">{errors.ccc.message}</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Name */}
              <div className="usa-form-group">
                <label className="usa-label" htmlFor={`owner-${index}-name`}>
                  Name <span className="text-secondary-dark">*</span>
                </label>
                <input
                  className={`usa-input ${errors.name ? 'usa-input--error' : ''}`}
                  id={`owner-${index}-name`}
                  type="text"
                  {...register('name', {
                    required: 'Name is required'
                  })}
                  onBlur={handleSubmit(onSubmit)}
                />
                {errors.name && (
                  <span className="usa-error-message">{errors.name.message}</span>
                )}
              </div>
              
              {/* Address */}
              <fieldset className="usa-fieldset margin-top-3">
                <legend className="usa-legend">Address</legend>
                
                <div className="usa-form-group">
                  <label className="usa-label" htmlFor={`owner-${index}-street1`}>
                    Street Address 1 <span className="text-secondary-dark">*</span>
                  </label>
                  <input
                    className={`usa-input ${errors.address?.street1 ? 'usa-input--error' : ''}`}
                    id={`owner-${index}-street1`}
                    type="text"
                    {...register('address.street1', {
                      required: 'Street address is required'
                    })}
                    onBlur={handleSubmit(onSubmit)}
                  />
                </div>
                
                <div className="usa-form-group">
                  <label className="usa-label" htmlFor={`owner-${index}-street2`}>
                    Street Address 2
                  </label>
                  <input
                    className="usa-input"
                    id={`owner-${index}-street2`}
                    type="text"
                    {...register('address.street2')}
                    onBlur={handleSubmit(onSubmit)}
                  />
                </div>
                
                <div className="grid-row grid-gap">
                  <div className="grid-col-6">
                    <div className="usa-form-group">
                      <label className="usa-label" htmlFor={`owner-${index}-city`}>
                        City <span className="text-secondary-dark">*</span>
                      </label>
                      <input
                        className={`usa-input ${errors.address?.city ? 'usa-input--error' : ''}`}
                        id={`owner-${index}-city`}
                        type="text"
                        {...register('address.city', {
                          required: 'City is required'
                        })}
                        onBlur={handleSubmit(onSubmit)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid-col-3">
                    <div className="usa-form-group">
                      <label className="usa-label" htmlFor={`owner-${index}-state`}>
                        State <span className="text-secondary-dark">*</span>
                      </label>
                      <input
                        className={`usa-input ${errors.address?.state ? 'usa-input--error' : ''}`}
                        id={`owner-${index}-state`}
                        type="text"
                        maxLength="2"
                        {...register('address.state', {
                          required: 'State is required'
                        })}
                        onBlur={handleSubmit(onSubmit)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid-col-3">
                    <div className="usa-form-group">
                      <label className="usa-label" htmlFor={`owner-${index}-zipCode`}>
                        ZIP Code <span className="text-secondary-dark">*</span>
                      </label>
                      <input
                        className={`usa-input ${errors.address?.zipCode ? 'usa-input--error' : ''}`}
                        id={`owner-${index}-zipCode`}
                        type="text"
                        maxLength="10"
                        {...register('address.zipCode', {
                          required: 'ZIP code is required'
                        })}
                        onBlur={handleSubmit(onSubmit)}
                      />
                    </div>
                  </div>
                </div>
              </fieldset>
              
              {/* Relationships */}
              <fieldset className="usa-fieldset margin-top-3">
                <legend className="usa-legend">
                  Relationship to Issuer <span className="text-secondary-dark">*</span>
                </legend>
                <span className="usa-hint">Select all that apply</span>
                
                <div className="usa-checkbox">
                  <input
                    className="usa-checkbox__input"
                    id={`owner-${index}-director`}
                    type="checkbox"
                    {...register('relationships.isDirector')}
                    onChange={handleSubmit(onSubmit)}
                  />
                  <label className="usa-checkbox__label" htmlFor={`owner-${index}-director`}>
                    Director
                  </label>
                </div>
                
                <div className="usa-checkbox">
                  <input
                    className="usa-checkbox__input"
                    id={`owner-${index}-officer`}
                    type="checkbox"
                    {...register('relationships.isOfficer')}
                    onChange={handleSubmit(onSubmit)}
                  />
                  <label className="usa-checkbox__label" htmlFor={`owner-${index}-officer`}>
                    Officer
                  </label>
                </div>
                
                {watchIsOfficer && (
                  <div className="usa-form-group margin-left-4">
                    <label className="usa-label" htmlFor={`owner-${index}-officerTitle`}>
                      Officer Title <span className="text-secondary-dark">*</span>
                    </label>
                    <input
                      className="usa-input"
                      id={`owner-${index}-officerTitle`}
                      type="text"
                      placeholder="e.g., Chief Executive Officer"
                      {...register('officerTitle', {
                        required: watchIsOfficer ? 'Officer title is required' : false
                      })}
                      onBlur={handleSubmit(onSubmit)}
                    />
                  </div>
                )}
                
                <div className="usa-checkbox">
                  <input
                    className="usa-checkbox__input"
                    id={`owner-${index}-tenPercent`}
                    type="checkbox"
                    {...register('relationships.isTenPercentOwner')}
                    onChange={handleSubmit(onSubmit)}
                  />
                  <label className="usa-checkbox__label" htmlFor={`owner-${index}-tenPercent`}>
                    10% Owner
                  </label>
                </div>
                
                <div className="usa-checkbox">
                  <input
                    className="usa-checkbox__input"
                    id={`owner-${index}-other`}
                    type="checkbox"
                    {...register('relationships.isOther')}
                    onChange={handleSubmit(onSubmit)}
                  />
                  <label className="usa-checkbox__label" htmlFor={`owner-${index}-other`}>
                    Other
                  </label>
                </div>
                
                {watchIsOther && (
                  <div className="usa-form-group margin-left-4">
                    <label className="usa-label" htmlFor={`owner-${index}-otherText`}>
                      Specify relationship <span className="text-secondary-dark">*</span>
                    </label>
                    <input
                      className="usa-input"
                      id={`owner-${index}-otherText`}
                      type="text"
                      {...register('relationships.otherText', {
                        required: watchIsOther ? 'Please specify the relationship' : false
                      })}
                      onBlur={handleSubmit(onSubmit)}
                    />
                  </div>
                )}
              </fieldset>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Reporting Owner Section (1-10 owners)
 */
const ReportingOwnerSection = () => {
  const { state, addReportingOwner, updateReportingOwner, removeReportingOwner } = useFiling();
  const config = getFormConfig(state.formType);
  const maxOwners = config.validation.maxReportingOwners;
  
  const handleAddOwner = () => {
    if (state.reportingOwners.length < maxOwners) {
      addReportingOwner({
        cik: '',
        ccc: '',
        name: '',
        address: {
          street1: '',
          street2: '',
          city: '',
          state: '',
          zipCode: ''
        },
        relationships: {
          isDirector: false,
          isOfficer: false,
          isTenPercentOwner: false,
          isOther: false,
          otherText: ''
        },
        officerTitle: ''
      });
    }
  };
  
  const handleUpdateOwner = (index, data) => {
    updateReportingOwner(index, data);
  };
  
  const handleRemoveOwner = (index) => {
    if (window.confirm('Are you sure you want to remove this reporting owner?')) {
      removeReportingOwner(index);
    }
  };
  
  return (
    <div>
      <p className="usa-intro">
        Add reporting owner information. You can have up to {maxOwners} reporting owners per filing.
      </p>
      
      <div className="usa-alert usa-alert--info usa-alert--slim margin-bottom-3">
        <div className="usa-alert__body">
          <p className="usa-alert__text">
            <strong>CCC Required:</strong> Each reporting owner must provide their 8-character CCC (Central 
            Index Key Confirmation Code) for authentication. The CCC will be encrypted before submission.
          </p>
        </div>
      </div>
      
      {state.reportingOwners.length === 0 && (
        <div className="usa-alert usa-alert--warning margin-bottom-3">
          <div className="usa-alert__body">
            <p className="usa-alert__text">
              No reporting owners added yet. Please add at least one reporting owner to continue.
            </p>
          </div>
        </div>
      )}
      
      {state.reportingOwners.map((owner, index) => (
        <ReportingOwnerForm
          key={index}
          owner={owner}
          index={index}
          onUpdate={(data) => handleUpdateOwner(index, data)}
          onRemove={handleRemoveOwner}
          canRemove={state.reportingOwners.length > 1}
        />
      ))}
      
      {state.reportingOwners.length < maxOwners && (
        <button
          type="button"
          className="usa-button usa-button--outline"
          onClick={handleAddOwner}
        >
          + Add Reporting Owner
        </button>
      )}
      
      {state.reportingOwners.length >= maxOwners && (
        <div className="usa-alert usa-alert--info usa-alert--slim">
          <div className="usa-alert__body">
            <p className="usa-alert__text">
              Maximum number of reporting owners ({maxOwners}) reached.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportingOwnerSection;






