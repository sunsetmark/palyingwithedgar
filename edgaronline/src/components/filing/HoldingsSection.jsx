import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFiling } from '../../context/FilingContext';
import { getFormConfig, OWNERSHIP_TYPES } from '../../config/formConfig';

/**
 * Single Non-Derivative Holding Form
 */
const NonDerivativeHoldingForm = ({ holding, index, onUpdate, onRemove, canRemove }) => {
  const [isExpanded, setIsExpanded] = useState(!holding?.securityTitle);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: holding || {
      securityTitle: '',
      postTransactionAmounts: {
        sharesOwnedFollowing: ''
      },
      ownershipNature: {
        directOrIndirect: 'D',
        natureOfOwnership: ''
      }
    }
  });
  
  const watchDirectOrIndirect = watch('ownershipNature.directOrIndirect');
  
  const onSubmit = (data) => {
    onUpdate(data);
  };
  
  return (
    <div className="usa-card margin-bottom-3">
      <div className="usa-card__container">
        <div className="usa-card__header">
          <div className="display-flex flex-justify">
            <h4 className="usa-card__heading margin-y-0">
              Non-Derivative Holding {index + 1}
              {holding?.securityTitle && ` - ${holding.securityTitle}`}
            </h4>
            <div>
              <button
                type="button"
                className="usa-button usa-button--unstyled"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? '▲' : '▼'}
              </button>
              {canRemove && (
                <button
                  type="button"
                  className="usa-button usa-button--unstyled text-secondary margin-left-2"
                  onClick={() => onRemove(index)}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="usa-card__body">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="usa-form-group">
                <label className="usa-label" htmlFor={`ndh-${index}-title`}>
                  Security Title <span className="text-secondary-dark">*</span>
                </label>
                <input
                  className="usa-input"
                  id={`ndh-${index}-title`}
                  type="text"
                  placeholder="e.g., Common Stock"
                  {...register('securityTitle', { required: true })}
                  onBlur={handleSubmit(onSubmit)}
                />
              </div>
              
              <div className="usa-form-group">
                <label className="usa-label" htmlFor={`ndh-${index}-shares`}>
                  Number of Shares Owned <span className="text-secondary-dark">*</span>
                </label>
                <input
                  className="usa-input"
                  id={`ndh-${index}-shares`}
                  type="number"
                  step="0.0001"
                  {...register('postTransactionAmounts.sharesOwnedFollowing', { required: true })}
                  onBlur={handleSubmit(onSubmit)}
                />
              </div>
              
              <fieldset className="usa-fieldset margin-top-2">
                <legend className="usa-legend">Ownership Nature</legend>
                
                <div className="usa-form-group">
                  <label className="usa-label" htmlFor={`ndh-${index}-ownership`}>
                    Direct or Indirect Ownership <span className="text-secondary-dark">*</span>
                  </label>
                  <select
                    className="usa-select"
                    id={`ndh-${index}-ownership`}
                    {...register('ownershipNature.directOrIndirect', { required: true })}
                    onChange={handleSubmit(onSubmit)}
                  >
                    {OWNERSHIP_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                {watchDirectOrIndirect === 'I' && (
                  <div className="usa-form-group">
                    <label className="usa-label" htmlFor={`ndh-${index}-nature`}>
                      Nature of Indirect Ownership <span className="text-secondary-dark">*</span>
                    </label>
                    <input
                      className="usa-input"
                      id={`ndh-${index}-nature`}
                      type="text"
                      placeholder="e.g., By Trust"
                      {...register('ownershipNature.natureOfOwnership', {
                        required: watchDirectOrIndirect === 'I'
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
 * Holdings Section (all forms)
 */
const HoldingsSection = () => {
  const { state, addHolding, updateHolding, removeHolding } = useFiling();
  const [activeTab, setActiveTab] = useState('nonDerivative');
  const config = getFormConfig(state.formType);
  
  const handleAddHolding = (type) => {
    const holdingType = type === 'nonDerivative' ? 'nonDerivative' : 'derivative';
    addHolding(holdingType, {});
  };
  
  const handleUpdateHolding = (type, index, data) => {
    updateHolding(type, index, data);
  };
  
  const handleRemoveHolding = (type, index) => {
    if (window.confirm('Are you sure you want to remove this holding?')) {
      removeHolding(type, index);
    }
  };
  
  const nonDerivativeCount = state.nonDerivativeHoldings.length;
  const derivativeCount = state.derivativeHoldings.length;
  const maxNonDerivative = config.validation.maxNonDerivativeHoldings;
  const maxDerivative = config.validation.maxDerivativeHoldings;
  
  // For Form 3, holdings are required. For Forms 4 & 5, they're optional
  const isForm3 = state.formType === '3' || state.formType === '3/A';
  
  return (
    <div>
      <p className="usa-intro">
        {isForm3 
          ? 'Report all securities beneficially owned as of the date you became an insider.'
          : 'Report holdings if needed to update your beneficial ownership position. Holdings are optional for Forms 4 and 5 if you\'ve already reported them.'
        }
      </p>
      
      {/* Tabs */}
      <div className="margin-bottom-3">
        <ul className="usa-button-group">
          <li className="usa-button-group__item">
            <button
              type="button"
              className={`usa-button ${activeTab === 'nonDerivative' ? '' : 'usa-button--outline'}`}
              onClick={() => setActiveTab('nonDerivative')}
            >
              Non-Derivative ({nonDerivativeCount})
            </button>
          </li>
          <li className="usa-button-group__item">
            <button
              type="button"
              className={`usa-button ${activeTab === 'derivative' ? '' : 'usa-button--outline'}`}
              onClick={() => setActiveTab('derivative')}
            >
              Derivative ({derivativeCount})
            </button>
          </li>
        </ul>
      </div>
      
      {/* Non-Derivative Holdings */}
      {activeTab === 'nonDerivative' && (
        <div>
          <h3>Non-Derivative Holdings</h3>
          <p className="text-base-dark">
            Common stock, preferred stock, and other equity securities that are not derivatives.
          </p>
          
          {nonDerivativeCount === 0 && (
            <div className={`usa-alert ${isForm3 ? 'usa-alert--warning' : 'usa-alert--info'} usa-alert--slim margin-bottom-3`}>
              <div className="usa-alert__body">
                <p className="usa-alert__text">
                  {isForm3 
                    ? 'No non-derivative holdings added yet. For Form 3, you must report all securities you own.'
                    : 'No non-derivative holdings added. Add holdings if you need to update your beneficial ownership.'
                  }
                </p>
              </div>
            </div>
          )}
          
          {state.nonDerivativeHoldings.map((holding, index) => (
            <NonDerivativeHoldingForm
              key={index}
              holding={holding}
              index={index}
              onUpdate={(data) => handleUpdateHolding('nonDerivative', index, data)}
              onRemove={() => handleRemoveHolding('nonDerivative', index)}
              canRemove={true}
            />
          ))}
          
          {nonDerivativeCount < maxNonDerivative && (
            <button
              type="button"
              className="usa-button usa-button--outline"
              onClick={() => handleAddHolding('nonDerivative')}
            >
              + Add Non-Derivative Holding
            </button>
          )}
        </div>
      )}
      
      {/* Derivative Holdings */}
      {activeTab === 'derivative' && (
        <div>
          <h3>Derivative Holdings</h3>
          <p className="text-base-dark">
            Stock options, warrants, convertible securities, and other derivative instruments.
          </p>
          
          <div className="usa-alert usa-alert--warning margin-bottom-3">
            <div className="usa-alert__body">
              <p className="usa-alert__text">
                Derivative holding forms are under development. For now, use the non-derivative holding form.
              </p>
            </div>
          </div>
          
          {derivativeCount === 0 && (
            <div className="usa-alert usa-alert--info usa-alert--slim margin-bottom-3">
              <div className="usa-alert__body">
                <p className="usa-alert__text">
                  No derivative holdings added yet.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {isForm3 && (nonDerivativeCount === 0 && derivativeCount === 0) && (
        <div className="usa-alert usa-alert--warning margin-top-3">
          <div className="usa-alert__body">
            <p className="usa-alert__text">
              <strong>Note:</strong> Form 3 requires you to report all securities you beneficially own, 
              even if the amount is zero. If you own no securities, add a holding with 0 shares.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoldingsSection;






