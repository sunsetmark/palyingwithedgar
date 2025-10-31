import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FORM_TYPES, formConfig } from '../../config/formConfig';
import { useFiling } from '../../context/FilingContext';

/**
 * Form Type Selection Step
 */
const FormTypeStep = () => {
  const navigate = useNavigate();
  const { setFormType } = useFiling();
  
  const handleSelectForm = (formType) => {
    setFormType(formType);
    navigate(`/filing/new?type=${formType}`);
  };
  
  const forms = [
    {
      type: FORM_TYPES.FORM_3,
      icon: '📝',
      iconBg: '#E1F3F8',
      iconColor: '#005EA2'
    },
    {
      type: FORM_TYPES.FORM_3A,
      icon: '✏️',
      iconBg: '#E1F3F8',
      iconColor: '#005EA2'
    },
    {
      type: FORM_TYPES.FORM_4,
      icon: '📊',
      iconBg: '#ECF3EC',
      iconColor: '#2E7D32'
    },
    {
      type: FORM_TYPES.FORM_4A,
      icon: '✏️',
      iconBg: '#ECF3EC',
      iconColor: '#2E7D32'
    },
    {
      type: FORM_TYPES.FORM_5,
      icon: '📅',
      iconBg: '#FFF5E1',
      iconColor: '#C05600'
    },
    {
      type: FORM_TYPES.FORM_5A,
      icon: '✏️',
      iconBg: '#FFF5E1',
      iconColor: '#C05600'
    }
  ];
  
  return (
    <div>
      <p className="usa-intro">Select the type of form you want to file:</p>
      
      <div className="grid-row grid-gap">
        {forms.map(({ type, icon, iconBg, iconColor }) => {
          const config = formConfig[type];
          return (
            <div key={type} className="grid-col-12 tablet:grid-col-6 desktop:grid-col-4 margin-bottom-3">
              <div 
                className="usa-card"
                onClick={() => handleSelectForm(type)}
                style={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.2s',
                  border: '2px solid #dfe1e2',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = iconColor;
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#dfe1e2';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="usa-card__container" style={{ padding: '1.5rem' }}>
                  <div className="usa-card__header" style={{ 
                    borderBottom: 'none',
                    paddingBottom: '0.5rem'
                  }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      backgroundColor: iconBg,
                      borderRadius: '4px',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ 
                        fontSize: '2rem',
                        display: 'inline-block'
                      }}>
                        {icon}
                      </span>
                    </div>
                    <h3 className="usa-card__heading margin-y-0" style={{
                      color: iconColor,
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}>
                      Form {type}
                    </h3>
                  </div>
                  <div className="usa-card__body" style={{ padding: '1rem 0' }}>
                    <p className="margin-top-0" style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1b1b1b'
                    }}>
                      {config.title}
                    </p>
                    <p className="margin-bottom-0" style={{
                      fontSize: '0.9rem',
                      color: '#565c65',
                      lineHeight: '1.5'
                    }}>
                      {config.description}
                    </p>
                  </div>
                  <div className="usa-card__footer" style={{ 
                    paddingTop: '1rem',
                    borderTop: '1px solid #dfe1e2'
                  }}>
                    <button 
                      className="usa-button width-full"
                      style={{
                        backgroundColor: iconColor,
                        borderColor: iconColor,
                        color: '#ffffff'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectForm(type);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      Select Form {type}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="usa-alert usa-alert--info usa-alert--slim margin-top-4">
        <div className="usa-alert__body">
          <p className="usa-alert__text">
            <strong>New to SEC ownership filings?</strong> 
            {' '}Form 3 is for initial holdings, Form 4 for changes in ownership, and Form 5 for annual reporting of late or exempt transactions. 
            Forms with "/A" are amendments to previously filed forms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormTypeStep;






