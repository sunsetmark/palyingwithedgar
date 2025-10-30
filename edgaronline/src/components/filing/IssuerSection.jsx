import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFiling } from '../../context/FilingContext';
import api from '../../services/api';

/**
 * Issuer Information Section (shared by all forms)
 */
const IssuerSection = () => {
  const { state, updateIssuer } = useFiling();
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: state.issuer
  });
  
  const onSubmit = (data) => {
    updateIssuer(data);
  };
  
  const handleLookupCik = async () => {
    const cik = document.getElementById('cik').value;
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
      setValue('tradingSymbol', entity.tickers?.[0] || '');
      
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
      setLookupError(error.response?.data?.error || 'Failed to lookup CIK. Please verify the number and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <p className="usa-intro">
        Enter the issuer's information. The issuer is the company whose securities are being reported.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* CIK Lookup */}
        <div className="usa-form-group">
          <label className="usa-label" htmlFor="cik">
            Issuer CIK <span className="text-secondary-dark">*</span>
          </label>
          <span className="usa-hint">
            10-digit Central Index Key (CIK) number assigned by the SEC
          </span>
          <div className="display-flex">
            <input
              className={`usa-input ${errors.cik ? 'usa-input--error' : ''}`}
              id="cik"
              type="text"
              maxLength="10"
              {...register('cik', {
                required: 'CIK is required',
                pattern: {
                  value: /^\d{1,10}$/,
                  message: 'CIK must be numeric (up to 10 digits)'
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
        
        {/* Issuer Name */}
        <div className="usa-form-group">
          <label className="usa-label" htmlFor="name">
            Issuer Name <span className="text-secondary-dark">*</span>
          </label>
          <input
            className={`usa-input ${errors.name ? 'usa-input--error' : ''}`}
            id="name"
            type="text"
            {...register('name', {
              required: 'Issuer name is required'
            })}
            onBlur={handleSubmit(onSubmit)}
          />
          {errors.name && (
            <span className="usa-error-message">{errors.name.message}</span>
          )}
        </div>
        
        {/* Trading Symbol */}
        <div className="usa-form-group">
          <label className="usa-label" htmlFor="tradingSymbol">
            Trading Symbol
          </label>
          <span className="usa-hint">If applicable</span>
          <input
            className="usa-input"
            id="tradingSymbol"
            type="text"
            maxLength="10"
            {...register('tradingSymbol')}
            onBlur={handleSubmit(onSubmit)}
          />
        </div>
        
        {/* Address */}
        <fieldset className="usa-fieldset margin-top-4">
          <legend className="usa-legend usa-legend--large">Issuer Address</legend>
          
          <div className="usa-form-group">
            <label className="usa-label" htmlFor="address.street1">
              Street Address 1 <span className="text-secondary-dark">*</span>
            </label>
            <input
              className={`usa-input ${errors.address?.street1 ? 'usa-input--error' : ''}`}
              id="address.street1"
              type="text"
              {...register('address.street1', {
                required: 'Street address is required'
              })}
              onBlur={handleSubmit(onSubmit)}
            />
            {errors.address?.street1 && (
              <span className="usa-error-message">{errors.address.street1.message}</span>
            )}
          </div>
          
          <div className="usa-form-group">
            <label className="usa-label" htmlFor="address.street2">
              Street Address 2
            </label>
            <input
              className="usa-input"
              id="address.street2"
              type="text"
              {...register('address.street2')}
              onBlur={handleSubmit(onSubmit)}
            />
          </div>
          
          <div className="grid-row grid-gap">
            <div className="grid-col-12 tablet:grid-col-6">
              <div className="usa-form-group">
                <label className="usa-label" htmlFor="address.city">
                  City <span className="text-secondary-dark">*</span>
                </label>
                <input
                  className={`usa-input ${errors.address?.city ? 'usa-input--error' : ''}`}
                  id="address.city"
                  type="text"
                  {...register('address.city', {
                    required: 'City is required'
                  })}
                  onBlur={handleSubmit(onSubmit)}
                />
                {errors.address?.city && (
                  <span className="usa-error-message">{errors.address.city.message}</span>
                )}
              </div>
            </div>
            
            <div className="grid-col-6 tablet:grid-col-3">
              <div className="usa-form-group">
                <label className="usa-label" htmlFor="address.state">
                  State <span className="text-secondary-dark">*</span>
                </label>
                <input
                  className={`usa-input ${errors.address?.state ? 'usa-input--error' : ''}`}
                  id="address.state"
                  type="text"
                  maxLength="2"
                  {...register('address.state', {
                    required: 'State is required',
                    pattern: {
                      value: /^[A-Z]{2}$/,
                      message: 'Use 2-letter state code'
                    }
                  })}
                  onBlur={handleSubmit(onSubmit)}
                />
                {errors.address?.state && (
                  <span className="usa-error-message">{errors.address.state.message}</span>
                )}
              </div>
            </div>
            
            <div className="grid-col-6 tablet:grid-col-3">
              <div className="usa-form-group">
                <label className="usa-label" htmlFor="address.zipCode">
                  ZIP Code <span className="text-secondary-dark">*</span>
                </label>
                <input
                  className={`usa-input ${errors.address?.zipCode ? 'usa-input--error' : ''}`}
                  id="address.zipCode"
                  type="text"
                  maxLength="10"
                  {...register('address.zipCode', {
                    required: 'ZIP code is required',
                    pattern: {
                      value: /^\d{5}(-\d{4})?$/,
                      message: 'Invalid ZIP code format'
                    }
                  })}
                  onBlur={handleSubmit(onSubmit)}
                />
                {errors.address?.zipCode && (
                  <span className="usa-error-message">{errors.address.zipCode.message}</span>
                )}
              </div>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default IssuerSection;






