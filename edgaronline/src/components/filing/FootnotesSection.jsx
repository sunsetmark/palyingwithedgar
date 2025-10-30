import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFiling } from '../../context/FilingContext';
import { getFormConfig } from '../../config/formConfig';

/**
 * Single Footnote Form
 */
const FootnoteForm = ({ footnote, index, onUpdate, onRemove }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: footnote || {
      id: `F${index + 1}`,
      text: ''
    }
  });
  
  const onSubmit = (data) => {
    onUpdate(data);
  };
  
  return (
    <div className="usa-card margin-bottom-2">
      <div className="usa-card__container">
        <div className="usa-card__body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="display-flex flex-justify">
              <div style={{ flex: 1 }}>
                <div className="grid-row grid-gap">
                  <div className="grid-col-3">
                    <div className="usa-form-group">
                      <label className="usa-label" htmlFor={`fn-${index}-id`}>
                        ID <span className="text-secondary-dark">*</span>
                      </label>
                      <input
                        className="usa-input"
                        id={`fn-${index}-id`}
                        type="text"
                        maxLength="10"
                        placeholder="F1"
                        {...register('id', {
                          required: true,
                          pattern: {
                            value: /^[A-Za-z0-9]+$/,
                            message: 'Only letters and numbers'
                          }
                        })}
                        onBlur={handleSubmit(onSubmit)}
                      />
                      {errors.id && (
                        <span className="usa-error-message font-sans-3xs">{errors.id.message}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid-col-9">
                    <div className="usa-form-group">
                      <label className="usa-label" htmlFor={`fn-${index}-text`}>
                        Footnote Text <span className="text-secondary-dark">*</span>
                      </label>
                      <textarea
                        className="usa-textarea"
                        id={`fn-${index}-text`}
                        rows="3"
                        {...register('text', { required: true })}
                        onBlur={handleSubmit(onSubmit)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                className="usa-button usa-button--unstyled text-secondary margin-left-2"
                onClick={() => onRemove(index)}
                style={{ alignSelf: 'flex-start' }}
              >
                ✕
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * Footnotes and Remarks Section
 */
const FootnotesSection = () => {
  const { state, addFootnote, updateFootnote, removeFootnote, updateRemarks } = useFiling();
  const [remarksValue, setRemarksValue] = useState(state.remarks || '');
  const config = getFormConfig(state.formType);
  const maxFootnotes = config.validation.maxFootnotes;
  
  const handleAddFootnote = () => {
    if (state.footnotes.length < maxFootnotes) {
      addFootnote({
        id: `F${state.footnotes.length + 1}`,
        text: ''
      });
    }
  };
  
  const handleUpdateFootnote = (index, data) => {
    updateFootnote(index, data);
  };
  
  const handleRemoveFootnote = (index) => {
    if (window.confirm('Are you sure you want to remove this footnote?')) {
      removeFootnote(index);
    }
  };
  
  const handleRemarksBlur = () => {
    updateRemarks(remarksValue);
  };
  
  return (
    <div>
      <p className="usa-intro">
        Add footnotes to provide additional context or explanations for your transactions or holdings. 
        You can also add general remarks.
      </p>
      
      {/* Footnotes */}
      <section className="margin-bottom-5">
        <h3>Footnotes</h3>
        <p className="text-base-dark">
          Footnotes are referenced by their ID in transactions and holdings. For example, a footnote 
          with ID "F1" can be referenced throughout your filing.
        </p>
        
        {state.footnotes.length === 0 && (
          <div className="usa-alert usa-alert--info usa-alert--slim margin-bottom-3">
            <div className="usa-alert__body">
              <p className="usa-alert__text">
                No footnotes added. Footnotes are optional but can provide important context.
              </p>
            </div>
          </div>
        )}
        
        {state.footnotes.map((footnote, index) => (
          <FootnoteForm
            key={index}
            footnote={footnote}
            index={index}
            onUpdate={(data) => handleUpdateFootnote(index, data)}
            onRemove={() => handleRemoveFootnote(index)}
          />
        ))}
        
        {state.footnotes.length < maxFootnotes && (
          <button
            type="button"
            className="usa-button usa-button--outline"
            onClick={handleAddFootnote}
          >
            + Add Footnote
          </button>
        )}
        
        {state.footnotes.length >= maxFootnotes && (
          <div className="usa-alert usa-alert--info usa-alert--slim">
            <div className="usa-alert__body">
              <p className="usa-alert__text">
                Maximum number of footnotes ({maxFootnotes}) reached.
              </p>
            </div>
          </div>
        )}
      </section>
      
      {/* Remarks */}
      <section>
        <h3>Remarks</h3>
        <p className="text-base-dark">
          Use this space for general comments or explanations that don't fit in specific footnotes.
        </p>
        
        <div className="usa-form-group">
          <label className="usa-label" htmlFor="remarks">
            Remarks (Optional)
          </label>
          <textarea
            className="usa-textarea"
            id="remarks"
            rows="5"
            value={remarksValue}
            onChange={(e) => setRemarksValue(e.target.value)}
            onBlur={handleRemarksBlur}
            placeholder="Enter any additional remarks or explanations..."
          />
          <span className="usa-hint">
            Maximum 2000 characters ({remarksValue.length}/2000)
          </span>
        </div>
      </section>
      
      <div className="usa-alert usa-alert--info margin-top-3">
        <div className="usa-alert__body">
          <p className="usa-alert__text">
            <strong>Tip:</strong> Use footnotes for specific explanations related to transactions or holdings. 
            Use remarks for general information about the filing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FootnotesSection;






