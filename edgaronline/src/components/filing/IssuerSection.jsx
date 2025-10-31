import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFiling } from '../../context/FilingContext';
import { cikService } from '../../services/api';

/**
 * Issuer Information Section (shared by all forms)
 */
const IssuerSection = () => {
  const { state, updateIssuer } = useFiling();
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupSuccess, setLookupSuccess] = useState(false);
  const [entityData, setEntityData] = useState(null);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: state.issuer
  });
  
  const onSubmit = (data) => {
    updateIssuer(data);
  };
  
  const handleLookupCik = async () => {
    const cik = document.getElementById('cik').value;
    if (!cik || cik.length < 1) {
      setLookupError('Please enter a CIK number');
      setLookupSuccess(false);
      setEntityData(null);
      return;
    }
    
    setLoading(true);
    setLookupError('');
    setLookupSuccess(false);
    
    try {
      const result = await cikService.validate(cik);
      
      if (!result.valid) {
        setLookupError(result.message || result.error || 'CIK not found');
        setLookupSuccess(false);
        setEntityData(null);
        return;
      }
      
      // Store entity data
      const entity = {
        cik: result.cik,
        name: result.conformed_name || '',
        tradingSymbol: result.assigned_sic || '', // Could map to actual trading symbol if available
        address: {
          street1: result.business_street1 || '',
          street2: result.business_street2 || '',
          city: result.business_city || '',
          state: result.business_state || '',
          zipCode: result.business_zip || ''
        }
      };
      
      setEntityData(entity);
      setLookupSuccess(true);
      
      // Update form values
      setValue('cik', entity.cik);
      setValue('name', entity.name);
      setValue('tradingSymbol', entity.tradingSymbol);
      setValue('address.street1', entity.address.street1);
      setValue('address.street2', entity.address.street2);
      setValue('address.city', entity.address.city);
      setValue('address.state', entity.address.state);
      setValue('address.zipCode', entity.address.zipCode);
      
      // Trigger validation and save
      handleSubmit(onSubmit)();
    } catch (error) {
      console.error('CIK lookup error:', error);
      setLookupError(error.response?.data?.message || error.response?.data?.error || 'Failed to lookup CIK. Please verify the number and try again.');
      setLookupSuccess(false);
      setEntityData(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearLookup = () => {
    setLookupSuccess(false);
    setEntityData(null);
    setValue('name', '');
    setValue('tradingSymbol', '');
    setValue('address.street1', '');
    setValue('address.street2', '');
    setValue('address.city', '');
    setValue('address.state', '');
    setValue('address.zipCode', '');
  };
  
  return (
    <div>
      <p className="usa-intro">
        Enter the issuer's information. The issuer is the company whose securities are being reported.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {!lookupSuccess ? (
          /* CIK Lookup */
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
            
            <div className="usa-alert usa-alert--info usa-alert--slim margin-top-2">
              <div className="usa-alert__body">
                <p className="usa-alert__text">
                  Enter the issuer's CIK and click "Lookup" to validate and load entity information.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Display validated issuer information */
          <div>
            <div className="usa-alert usa-alert--success margin-bottom-3">
              <div className="usa-alert__body">
                <h4 className="usa-alert__heading">✓ Issuer Validated</h4>
                <p className="usa-alert__text">
                  CIK {entityData.cik} successfully validated
                </p>
              </div>
            </div>
            
            <div className="usa-summary-box margin-bottom-3" style={{ backgroundColor: '#f0f0f0', padding: '1.5rem', borderRadius: '4px' }}>
              <div className="usa-summary-box__body">
                <h3 className="usa-summary-box__heading">Issuer Information</h3>
                
                <dl className="margin-top-2">
                  <div className="grid-row margin-bottom-2">
                    <dt className="grid-col-4" style={{ fontWeight: 'bold' }}>CIK:</dt>
                    <dd className="grid-col-8">{entityData.cik}</dd>
                  </div>
                  
                  <div className="grid-row margin-bottom-2">
                    <dt className="grid-col-4" style={{ fontWeight: 'bold' }}>Name:</dt>
                    <dd className="grid-col-8">{entityData.name}</dd>
                  </div>
                  
                  {entityData.tradingSymbol && (
                    <div className="grid-row margin-bottom-2">
                      <dt className="grid-col-4" style={{ fontWeight: 'bold' }}>Trading Symbol:</dt>
                      <dd className="grid-col-8">{entityData.tradingSymbol}</dd>
                    </div>
                  )}
                  
                  <div className="grid-row margin-bottom-2">
                    <dt className="grid-col-4" style={{ fontWeight: 'bold' }}>Address:</dt>
                    <dd className="grid-col-8">
                      {entityData.address.street1}
                      {entityData.address.street2 && <><br />{entityData.address.street2}</>}
                      <br />
                      {entityData.address.city}, {entityData.address.state} {entityData.address.zipCode}
                    </dd>
                  </div>
                </dl>
                
                <button
                  type="button"
                  className="usa-button usa-button--outline margin-top-2"
                  onClick={handleClearLookup}
                >
                  Change Issuer CIK
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default IssuerSection;






