import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { getFormConfig } from '../config/formConfig';

const FilingContext = createContext();

// Initial state structure for a filing
const initialState = {
  // Metadata
  formType: null,
  isDraft: true,
  draftId: null,
  currentStep: 0,
  
  // Amendment info (if applicable)
  amendment: {
    dateOfOriginalSubmission: ''
  },
  
  // Issuer information
  issuer: {
    cik: '',
    name: '',
    tradingSymbol: '',
    address: {
      street1: '',
      street2: '',
      city: '',
      state: '',
      zipCode: ''
    }
  },
  
  // Reporting owners (1-10)
  reportingOwners: [],
  
  // Relationships and flags
  notSubjectToSection16: false,
  aff10b5One: false,
  
  // Non-derivative transactions (Forms 4 & 5)
  nonDerivativeTransactions: [],
  
  // Derivative transactions (Forms 4 & 5)
  derivativeTransactions: [],
  
  // Non-derivative holdings (all forms)
  nonDerivativeHoldings: [],
  
  // Derivative holdings (all forms)
  derivativeHoldings: [],
  
  // Footnotes (1-50)
  footnotes: [],
  
  // Remarks
  remarks: '',
  
  // Validation state
  validationErrors: {},
  
  // Submission state
  isSubmitting: false,
  submissionError: null
};

// Action types
const ActionTypes = {
  SET_FORM_TYPE: 'SET_FORM_TYPE',
  SET_STEP: 'SET_STEP',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  UPDATE_ISSUER: 'UPDATE_ISSUER',
  ADD_REPORTING_OWNER: 'ADD_REPORTING_OWNER',
  UPDATE_REPORTING_OWNER: 'UPDATE_REPORTING_OWNER',
  REMOVE_REPORTING_OWNER: 'REMOVE_REPORTING_OWNER',
  UPDATE_AMENDMENT: 'UPDATE_AMENDMENT',
  SET_AFF10B5ONE: 'SET_AFF10B5ONE',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  REMOVE_TRANSACTION: 'REMOVE_TRANSACTION',
  ADD_HOLDING: 'ADD_HOLDING',
  UPDATE_HOLDING: 'UPDATE_HOLDING',
  REMOVE_HOLDING: 'REMOVE_HOLDING',
  ADD_FOOTNOTE: 'ADD_FOOTNOTE',
  UPDATE_FOOTNOTE: 'UPDATE_FOOTNOTE',
  REMOVE_FOOTNOTE: 'REMOVE_FOOTNOTE',
  UPDATE_REMARKS: 'UPDATE_REMARKS',
  SET_VALIDATION_ERRORS: 'SET_VALIDATION_ERRORS',
  LOAD_DRAFT: 'LOAD_DRAFT',
  RESET_FORM: 'RESET_FORM',
  SET_SUBMITTING: 'SET_SUBMITTING',
  SET_SUBMISSION_ERROR: 'SET_SUBMISSION_ERROR'
};

// Reducer
function filingReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_FORM_TYPE:
      return { ...initialState, formType: action.payload };
      
    case ActionTypes.SET_STEP:
      return { ...state, currentStep: action.payload };
      
    case ActionTypes.NEXT_STEP: {
      const config = getFormConfig(state.formType);
      const maxStep = config.steps.length - 1;
      return { ...state, currentStep: Math.min(state.currentStep + 1, maxStep) };
    }
      
    case ActionTypes.PREV_STEP:
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };
      
    case ActionTypes.UPDATE_ISSUER:
      return { ...state, issuer: { ...state.issuer, ...action.payload } };
      
    case ActionTypes.ADD_REPORTING_OWNER:
      return {
        ...state,
        reportingOwners: [...state.reportingOwners, action.payload]
      };
      
    case ActionTypes.UPDATE_REPORTING_OWNER:
      return {
        ...state,
        reportingOwners: state.reportingOwners.map((owner, index) =>
          index === action.payload.index ? { ...owner, ...action.payload.data } : owner
        )
      };
      
    case ActionTypes.REMOVE_REPORTING_OWNER:
      return {
        ...state,
        reportingOwners: state.reportingOwners.filter((_, index) => index !== action.payload)
      };
      
    case ActionTypes.UPDATE_AMENDMENT:
      return { ...state, amendment: { ...state.amendment, ...action.payload } };
      
    case ActionTypes.SET_AFF10B5ONE:
      return { ...state, aff10b5One: action.payload };
      
    case ActionTypes.ADD_TRANSACTION: {
      const { transactionType, data } = action.payload;
      const key = transactionType === 'nonDerivative' 
        ? 'nonDerivativeTransactions' 
        : 'derivativeTransactions';
      return {
        ...state,
        [key]: [...state[key], data]
      };
    }
      
    case ActionTypes.UPDATE_TRANSACTION: {
      const { transactionType, index, data } = action.payload;
      const key = transactionType === 'nonDerivative'
        ? 'nonDerivativeTransactions'
        : 'derivativeTransactions';
      return {
        ...state,
        [key]: state[key].map((txn, i) => i === index ? { ...txn, ...data } : txn)
      };
    }
      
    case ActionTypes.REMOVE_TRANSACTION: {
      const { transactionType, index } = action.payload;
      const key = transactionType === 'nonDerivative'
        ? 'nonDerivativeTransactions'
        : 'derivativeTransactions';
      return {
        ...state,
        [key]: state[key].filter((_, i) => i !== index)
      };
    }
      
    case ActionTypes.ADD_HOLDING: {
      const { holdingType, data } = action.payload;
      const key = holdingType === 'nonDerivative'
        ? 'nonDerivativeHoldings'
        : 'derivativeHoldings';
      return {
        ...state,
        [key]: [...state[key], data]
      };
    }
      
    case ActionTypes.UPDATE_HOLDING: {
      const { holdingType, index, data } = action.payload;
      const key = holdingType === 'nonDerivative'
        ? 'nonDerivativeHoldings'
        : 'derivativeHoldings';
      return {
        ...state,
        [key]: state[key].map((holding, i) => i === index ? { ...holding, ...data } : holding)
      };
    }
      
    case ActionTypes.REMOVE_HOLDING: {
      const { holdingType, index } = action.payload;
      const key = holdingType === 'nonDerivative'
        ? 'nonDerivativeHoldings'
        : 'derivativeHoldings';
      return {
        ...state,
        [key]: state[key].filter((_, i) => i !== index)
      };
    }
      
    case ActionTypes.ADD_FOOTNOTE:
      return {
        ...state,
        footnotes: [...state.footnotes, action.payload]
      };
      
    case ActionTypes.UPDATE_FOOTNOTE:
      return {
        ...state,
        footnotes: state.footnotes.map((footnote, index) =>
          index === action.payload.index ? { ...footnote, ...action.payload.data } : footnote
        )
      };
      
    case ActionTypes.REMOVE_FOOTNOTE:
      return {
        ...state,
        footnotes: state.footnotes.filter((_, index) => index !== action.payload)
      };
      
    case ActionTypes.UPDATE_REMARKS:
      return { ...state, remarks: action.payload };
      
    case ActionTypes.SET_VALIDATION_ERRORS:
      return { ...state, validationErrors: action.payload };
      
    case ActionTypes.LOAD_DRAFT:
      return { ...action.payload, isDraft: true };
      
    case ActionTypes.RESET_FORM:
      return { ...initialState, formType: action.payload };
      
    case ActionTypes.SET_SUBMITTING:
      return { ...state, isSubmitting: action.payload };
      
    case ActionTypes.SET_SUBMISSION_ERROR:
      return { ...state, submissionError: action.payload };
      
    default:
      return state;
  }
}

// Provider component
export function FilingProvider({ children }) {
  const [state, dispatch] = useReducer(filingReducer, initialState);
  
  // Action creators
  const actions = {
    setFormType: useCallback((formType) => {
      dispatch({ type: ActionTypes.SET_FORM_TYPE, payload: formType });
    }, []),
    
    setStep: useCallback((step) => {
      dispatch({ type: ActionTypes.SET_STEP, payload: step });
    }, []),
    
    nextStep: useCallback(() => {
      dispatch({ type: ActionTypes.NEXT_STEP });
    }, []),
    
    prevStep: useCallback(() => {
      dispatch({ type: ActionTypes.PREV_STEP });
    }, []),
    
    updateIssuer: useCallback((data) => {
      dispatch({ type: ActionTypes.UPDATE_ISSUER, payload: data });
    }, []),
    
    addReportingOwner: useCallback((owner) => {
      dispatch({ type: ActionTypes.ADD_REPORTING_OWNER, payload: owner });
    }, []),
    
    updateReportingOwner: useCallback((index, data) => {
      dispatch({ type: ActionTypes.UPDATE_REPORTING_OWNER, payload: { index, data } });
    }, []),
    
    removeReportingOwner: useCallback((index) => {
      dispatch({ type: ActionTypes.REMOVE_REPORTING_OWNER, payload: index });
    }, []),
    
    updateAmendment: useCallback((data) => {
      dispatch({ type: ActionTypes.UPDATE_AMENDMENT, payload: data });
    }, []),
    
    setAff10b5One: useCallback((value) => {
      dispatch({ type: ActionTypes.SET_AFF10B5ONE, payload: value });
    }, []),
    
    addTransaction: useCallback((transactionType, data) => {
      dispatch({ type: ActionTypes.ADD_TRANSACTION, payload: { transactionType, data } });
    }, []),
    
    updateTransaction: useCallback((transactionType, index, data) => {
      dispatch({ type: ActionTypes.UPDATE_TRANSACTION, payload: { transactionType, index, data } });
    }, []),
    
    removeTransaction: useCallback((transactionType, index) => {
      dispatch({ type: ActionTypes.REMOVE_TRANSACTION, payload: { transactionType, index } });
    }, []),
    
    addHolding: useCallback((holdingType, data) => {
      dispatch({ type: ActionTypes.ADD_HOLDING, payload: { holdingType, data } });
    }, []),
    
    updateHolding: useCallback((holdingType, index, data) => {
      dispatch({ type: ActionTypes.UPDATE_HOLDING, payload: { holdingType, index, data } });
    }, []),
    
    removeHolding: useCallback((holdingType, index) => {
      dispatch({ type: ActionTypes.REMOVE_HOLDING, payload: { holdingType, index } });
    }, []),
    
    addFootnote: useCallback((footnote) => {
      dispatch({ type: ActionTypes.ADD_FOOTNOTE, payload: footnote });
    }, []),
    
    updateFootnote: useCallback((index, data) => {
      dispatch({ type: ActionTypes.UPDATE_FOOTNOTE, payload: { index, data } });
    }, []),
    
    removeFootnote: useCallback((index) => {
      dispatch({ type: ActionTypes.REMOVE_FOOTNOTE, payload: index });
    }, []),
    
    updateRemarks: useCallback((remarks) => {
      dispatch({ type: ActionTypes.UPDATE_REMARKS, payload: remarks });
    }, []),
    
    setValidationErrors: useCallback((errors) => {
      dispatch({ type: ActionTypes.SET_VALIDATION_ERRORS, payload: errors });
    }, []),
    
    loadDraft: useCallback((draftData) => {
      dispatch({ type: ActionTypes.LOAD_DRAFT, payload: draftData });
    }, []),
    
    resetForm: useCallback((formType = null) => {
      dispatch({ type: ActionTypes.RESET_FORM, payload: formType });
    }, []),
    
    setSubmitting: useCallback((isSubmitting) => {
      dispatch({ type: ActionTypes.SET_SUBMITTING, payload: isSubmitting });
    }, []),
    
    setSubmissionError: useCallback((error) => {
      dispatch({ type: ActionTypes.SET_SUBMISSION_ERROR, payload: error });
    }, [])
  };
  
  const value = {
    state,
    ...actions
  };
  
  return (
    <FilingContext.Provider value={value}>
      {children}
    </FilingContext.Provider>
  );
}

// Custom hook to use the filing context
export function useFiling() {
  const context = useContext(FilingContext);
  if (!context) {
    throw new Error('useFiling must be used within a FilingProvider');
  }
  return context;
}






