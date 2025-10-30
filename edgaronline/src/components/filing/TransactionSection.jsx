import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFiling } from '../../context/FilingContext';
import { getFormConfig, TRANSACTION_CODES, OWNERSHIP_TYPES } from '../../config/formConfig';

/**
 * Single Non-Derivative Transaction Form
 */
const NonDerivativeTransactionForm = ({ transaction, index, onUpdate, onRemove, canRemove, formType }) => {
  const [isExpanded, setIsExpanded] = useState(!transaction?.securityTitle);
  const config = getFormConfig(formType);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: transaction || {
      securityTitle: '',
      transactionDate: '',
      deemedExecutionDate: '',
      transactionCoding: {
        transactionFormType: config.sections.transactionFormType || '4',
        transactionCode: '',
        equitySwapInvolved: false
      },
      transactionAmounts: {
        shares: '',
        pricePerShare: '',
        acquiredDisposedCode: 'A'
      },
      postTransactionAmounts: {
        sharesOwnedFollowing: ''
      },
      ownershipNature: {
        directOrIndirect: 'D',
        natureOfOwnership: ''
      }
    }
  });
  
  const watchAcquiredDisposed = watch('transactionAmounts.acquiredDisposedCode');
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
              Non-Derivative Transaction {index + 1}
              {transaction?.securityTitle && ` - ${transaction.securityTitle}`}
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
                <label className="usa-label" htmlFor={`ndt-${index}-title`}>
                  Security Title <span className="text-secondary-dark">*</span>
                </label>
                <input
                  className="usa-input"
                  id={`ndt-${index}-title`}
                  type="text"
                  placeholder="e.g., Common Stock"
                  {...register('securityTitle', { required: true })}
                  onBlur={handleSubmit(onSubmit)}
                />
              </div>
              
              <div className="grid-row grid-gap">
                <div className="grid-col-6">
                  <div className="usa-form-group">
                    <label className="usa-label" htmlFor={`ndt-${index}-date`}>
                      Transaction Date <span className="text-secondary-dark">*</span>
                    </label>
                    <input
                      className="usa-input"
                      id={`ndt-${index}-date`}
                      type="date"
                      {...register('transactionDate', { required: true })}
                      onBlur={handleSubmit(onSubmit)}
                    />
                  </div>
                </div>
                
                <div className="grid-col-6">
                  <div className="usa-form-group">
                    <label className="usa-label" htmlFor={`ndt-${index}-code`}>
                      Transaction Code <span className="text-secondary-dark">*</span>
                    </label>
                    <select
                      className="usa-select"
                      id={`ndt-${index}-code`}
                      {...register('transactionCoding.transactionCode', { required: true })}
                      onChange={handleSubmit(onSubmit)}
                    >
                      <option value="">- Select -</option>
                      {TRANSACTION_CODES.map(code => (
                        <option key={code.value} value={code.value}>{code.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <fieldset className="usa-fieldset margin-top-2">
                <legend className="usa-legend">Transaction Amounts</legend>
                
                <div className="grid-row grid-gap">
                  <div className="grid-col-12 tablet:grid-col-4">
                    <div className="usa-form-group">
                      <label className="usa-label" htmlFor={`ndt-${index}-shares`}>
                        Shares <span className="text-secondary-dark">*</span>
                      </label>
                      <input
                        className="usa-input"
                        id={`ndt-${index}-shares`}
                        type="number"
                        step="0.0001"
                        {...register('transactionAmounts.shares', { required: true })}
                        onBlur={handleSubmit(onSubmit)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid-col-12 tablet:grid-col-4">
                    <div className="usa-form-group">
                      <label className="usa-label" htmlFor={`ndt-${index}-price`}>
                        Price Per Share
                      </label>
                      <input
                        className="usa-input"
                        id={`ndt-${index}-price`}
                        type="number"
                        step="0.01"
                        placeholder="Optional"
                        {...register('transactionAmounts.pricePerShare')}
                        onBlur={handleSubmit(onSubmit)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid-col-12 tablet:grid-col-4">
                    <div className="usa-form-group">
                      <label className="usa-label" htmlFor={`ndt-${index}-ad-code`}>
                        Acquired (A) or Disposed (D) <span className="text-secondary-dark">*</span>
                      </label>
                      <select
                        className="usa-select"
                        id={`ndt-${index}-ad-code`}
                        {...register('transactionAmounts.acquiredDisposedCode', { required: true })}
                        onChange={handleSubmit(onSubmit)}
                      >
                        <option value="A">A - Acquired</option>
                        <option value="D">D - Disposed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </fieldset>
              
              <div className="usa-form-group">
                <label className="usa-label" htmlFor={`ndt-${index}-post-shares`}>
                  Shares Owned Following Transaction <span className="text-secondary-dark">*</span>
                </label>
                <input
                  className="usa-input"
                  id={`ndt-${index}-post-shares`}
                  type="number"
                  step="0.0001"
                  {...register('postTransactionAmounts.sharesOwnedFollowing', { required: true })}
                  onBlur={handleSubmit(onSubmit)}
                />
              </div>
              
              <fieldset className="usa-fieldset margin-top-2">
                <legend className="usa-legend">Ownership Nature</legend>
                
                <div className="usa-form-group">
                  <label className="usa-label" htmlFor={`ndt-${index}-ownership`}>
                    Direct or Indirect Ownership <span className="text-secondary-dark">*</span>
                  </label>
                  <select
                    className="usa-select"
                    id={`ndt-${index}-ownership`}
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
                    <label className="usa-label" htmlFor={`ndt-${index}-nature`}>
                      Nature of Indirect Ownership <span className="text-secondary-dark">*</span>
                    </label>
                    <input
                      className="usa-input"
                      id={`ndt-${index}-nature`}
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
              
              <div className="usa-checkbox margin-top-2">
                <input
                  className="usa-checkbox__input"
                  id={`ndt-${index}-equity-swap`}
                  type="checkbox"
                  {...register('transactionCoding.equitySwapInvolved')}
                  onChange={handleSubmit(onSubmit)}
                />
                <label className="usa-checkbox__label" htmlFor={`ndt-${index}-equity-swap`}>
                  Equity swap involved
                </label>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Transaction Section (Forms 4 & 5 only)
 */
const TransactionSection = () => {
  const { state, addTransaction, updateTransaction, removeTransaction, setAff10b5One } = useFiling();
  const [activeTab, setActiveTab] = useState('nonDerivative');
  const config = getFormConfig(state.formType);
  
  const handleAddTransaction = (type) => {
    const transactionType = type === 'nonDerivative' ? 'nonDerivative' : 'derivative';
    addTransaction(transactionType, {});
  };
  
  const handleUpdateTransaction = (type, index, data) => {
    updateTransaction(type, index, data);
  };
  
  const handleRemoveTransaction = (type, index) => {
    if (window.confirm('Are you sure you want to remove this transaction?')) {
      removeTransaction(type, index);
    }
  };
  
  const nonDerivativeCount = state.nonDerivativeTransactions.length;
  const derivativeCount = state.derivativeTransactions.length;
  const maxNonDerivative = config.validation.maxNonDerivativeTransactions;
  const maxDerivative = config.validation.maxDerivativeTransactions;
  
  return (
    <div>
      <p className="usa-intro">
        Report transactions in securities. You can add both non-derivative (e.g., common stock) and 
        derivative (e.g., stock options) transactions.
      </p>
      
      {/* Rule 10b5-1 Trading Plan Affirmation (Forms 4 & 5) */}
      {config.sections.showAff10b5One && (
        <div className="usa-alert usa-alert--info margin-bottom-3">
          <div className="usa-alert__body">
            <div className="usa-checkbox">
              <input
                className="usa-checkbox__input"
                id="aff10b5One"
                type="checkbox"
                checked={state.aff10b5One}
                onChange={(e) => setAff10b5One(e.target.checked)}
              />
              <label className="usa-checkbox__label" htmlFor="aff10b5One">
                <strong>Rule 10b5-1 Trading Plan Affirmation:</strong> Check this box if the transaction 
                was made pursuant to a contract, instruction or written plan that is intended to satisfy 
                the affirmative defense conditions of Rule 10b5-1(c).
              </label>
            </div>
          </div>
        </div>
      )}
      
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
      
      {/* Non-Derivative Transactions */}
      {activeTab === 'nonDerivative' && (
        <div>
          <h3>Non-Derivative Transactions</h3>
          <p className="text-base-dark">
            Common stock, preferred stock, and other equity securities that are not derivatives.
          </p>
          
          {nonDerivativeCount === 0 && (
            <div className="usa-alert usa-alert--info usa-alert--slim margin-bottom-3">
              <div className="usa-alert__body">
                <p className="usa-alert__text">
                  No non-derivative transactions added yet. Click the button below to add a transaction.
                </p>
              </div>
            </div>
          )}
          
          {state.nonDerivativeTransactions.map((txn, index) => (
            <NonDerivativeTransactionForm
              key={index}
              transaction={txn}
              index={index}
              onUpdate={(data) => handleUpdateTransaction('nonDerivative', index, data)}
              onRemove={() => handleRemoveTransaction('nonDerivative', index)}
              canRemove={true}
              formType={state.formType}
            />
          ))}
          
          {nonDerivativeCount < maxNonDerivative && (
            <button
              type="button"
              className="usa-button usa-button--outline"
              onClick={() => handleAddTransaction('nonDerivative')}
            >
              + Add Non-Derivative Transaction
            </button>
          )}
        </div>
      )}
      
      {/* Derivative Transactions */}
      {activeTab === 'derivative' && (
        <div>
          <h3>Derivative Transactions</h3>
          <p className="text-base-dark">
            Stock options, warrants, convertible securities, and other derivative instruments.
          </p>
          
          <div className="usa-alert usa-alert--warning margin-bottom-3">
            <div className="usa-alert__body">
              <p className="usa-alert__text">
                Derivative transaction forms are under development. For now, please use the non-derivative 
                transaction form for all transactions.
              </p>
            </div>
          </div>
          
          {derivativeCount === 0 && (
            <div className="usa-alert usa-alert--info usa-alert--slim margin-bottom-3">
              <div className="usa-alert__body">
                <p className="usa-alert__text">
                  No derivative transactions added yet.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {(nonDerivativeCount === 0 && derivativeCount === 0) && (
        <div className="usa-alert usa-alert--warning margin-top-3">
          <div className="usa-alert__body">
            <p className="usa-alert__text">
              <strong>Note:</strong> For Form {state.formType.replace('/A', '')}, you must report at least 
              one transaction or holding.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionSection;






