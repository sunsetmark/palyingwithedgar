/**
 * Form Configuration for SEC Ownership Forms 3, 4, and 5
 * 
 * This configuration drives the unified form builder, determining which
 * sections appear for each form type and their specific behaviors.
 */

export const FORM_TYPES = {
  FORM_3: '3',
  FORM_3A: '3/A',
  FORM_4: '4',
  FORM_4A: '4/A',
  FORM_5: '5',
  FORM_5A: '5/A'
};

export const TRANSACTION_CODES = [
  { value: 'P', label: 'P - Open market or private purchase of non-derivative or derivative security' },
  { value: 'S', label: 'S - Open market or private sale of non-derivative or derivative security' },
  { value: 'V', label: 'V - Transaction voluntarily reported earlier than required' },
  { value: 'A', label: 'A - Grant, award or other acquisition pursuant to Rule 16b-3(d)' },
  { value: 'D', label: 'D - Disposition to the issuer of issuer equity securities pursuant to Rule 16b-3(e)' },
  { value: 'F', label: 'F - Payment of exercise price or tax liability by delivering or withholding securities incident to the receipt, exercise or vesting of a security issued in accordance with Rule 16b-3' },
  { value: 'I', label: 'I - Discretionary transaction in accordance with Rule 16b-3(f) resulting in acquisition or disposition of issuer securities' },
  { value: 'M', label: 'M - Exercise or conversion of derivative security exempted pursuant to Rule 16b-3' },
  { value: 'C', label: 'C - Conversion of derivative security' },
  { value: 'E', label: 'E - Expiration of short derivative position' },
  { value: 'H', label: 'H - Expiration (or cancellation) of long derivative position with value received' },
  { value: 'O', label: 'O - Exercise of out-of-the-money derivative security' },
  { value: 'X', label: 'X - Exercise of in-the-money or at-the-money derivative security' },
  { value: 'G', label: 'G - Bona fide gift' },
  { value: 'L', label: 'L - Small acquisition under Rule 16a-6' },
  { value: 'W', label: 'W - Acquisition or disposition by will or the laws of descent and distribution' },
  { value: 'Z', label: 'Z - Deposit into or withdrawal from voting trust' },
  { value: 'J', label: 'J - Other acquisition or disposition (describe in footnote)' },
  { value: 'K', label: 'K - Transaction in equity swap or instrument with similar characteristics' },
  { value: 'U', label: 'U - Disposition pursuant to a tender of shares in a change of control transaction' }
];

export const OWNERSHIP_TYPES = [
  { value: 'D', label: 'D - Direct' },
  { value: 'I', label: 'I - Indirect' }
];

export const formConfig = {
  [FORM_TYPES.FORM_3]: {
    title: 'Form 3 - Initial Statement of Beneficial Ownership',
    description: 'Initial statement filed by officers, directors, and beneficial owners',
    documentType: '3',
    isAmendment: false,
    steps: [
      { id: 'form-type', label: 'Form Type', component: 'FormTypeStep' },
      { id: 'issuer', label: 'Issuer', component: 'IssuerSection' },
      { id: 'reporting-owners', label: 'Reporting Owners', component: 'ReportingOwnerSection' },
      { id: 'holdings', label: 'Holdings', component: 'HoldingsSection' },
      { id: 'footnotes', label: 'Footnotes & Remarks', component: 'FootnotesSection' },
      { id: 'review', label: 'Review & Submit', component: 'ReviewSubmitSection' }
    ],
    sections: {
      showTransactions: false,
      showHoldings: true,
      showLateHoldings: false,
      showAff10b5One: false,
      requireTransactionDate: false
    },
    validation: {
      maxReportingOwners: 10,
      maxNonDerivativeHoldings: 30,
      maxDerivativeHoldings: 30,
      maxFootnotes: 50
    }
  },
  
  [FORM_TYPES.FORM_3A]: {
    title: 'Form 3/A - Amendment to Initial Statement of Beneficial Ownership',
    description: 'Amendment to Form 3',
    documentType: '3',
    isAmendment: true,
    steps: [
      { id: 'form-type', label: 'Form Type', component: 'FormTypeStep' },
      { id: 'amendment', label: 'Amendment Info', component: 'AmendmentSection' },
      { id: 'issuer', label: 'Issuer', component: 'IssuerSection' },
      { id: 'reporting-owners', label: 'Reporting Owners', component: 'ReportingOwnerSection' },
      { id: 'holdings', label: 'Holdings', component: 'HoldingsSection' },
      { id: 'footnotes', label: 'Footnotes & Remarks', component: 'FootnotesSection' },
      { id: 'review', label: 'Review & Submit', component: 'ReviewSubmitSection' }
    ],
    sections: {
      showTransactions: false,
      showHoldings: true,
      showLateHoldings: false,
      showAff10b5One: false,
      requireTransactionDate: false
    },
    validation: {
      maxReportingOwners: 10,
      maxNonDerivativeHoldings: 30,
      maxDerivativeHoldings: 30,
      maxFootnotes: 50
    }
  },
  
  [FORM_TYPES.FORM_4]: {
    title: 'Form 4 - Statement of Changes in Beneficial Ownership',
    description: 'Statement of changes in beneficial ownership filed within 2 business days',
    documentType: '4',
    isAmendment: false,
    steps: [
      { id: 'form-type', label: 'Form Type', component: 'FormTypeStep' },
      { id: 'issuer', label: 'Issuer', component: 'IssuerSection' },
      { id: 'reporting-owners', label: 'Reporting Owners', component: 'ReportingOwnerSection' },
      { id: 'transactions', label: 'Transactions', component: 'TransactionSection' },
      { id: 'holdings', label: 'Holdings', component: 'HoldingsSection' },
      { id: 'footnotes', label: 'Footnotes & Remarks', component: 'FootnotesSection' },
      { id: 'review', label: 'Review & Submit', component: 'ReviewSubmitSection' }
    ],
    sections: {
      showTransactions: true,
      showHoldings: true,
      showLateHoldings: false,
      showAff10b5One: true,
      requireTransactionDate: true,
      transactionFormType: '4',
      transactionTypes: ['4', '5'] // Can include Form 5 transactions reported early
    },
    validation: {
      maxReportingOwners: 10,
      maxNonDerivativeTransactions: 30,
      maxDerivativeTransactions: 30,
      maxNonDerivativeHoldings: 30,
      maxDerivativeHoldings: 30,
      maxFootnotes: 50
    }
  },
  
  [FORM_TYPES.FORM_4A]: {
    title: 'Form 4/A - Amendment to Statement of Changes in Beneficial Ownership',
    description: 'Amendment to Form 4',
    documentType: '4',
    isAmendment: true,
    steps: [
      { id: 'form-type', label: 'Form Type', component: 'FormTypeStep' },
      { id: 'amendment', label: 'Amendment Info', component: 'AmendmentSection' },
      { id: 'issuer', label: 'Issuer', component: 'IssuerSection' },
      { id: 'reporting-owners', label: 'Reporting Owners', component: 'ReportingOwnerSection' },
      { id: 'transactions', label: 'Transactions', component: 'TransactionSection' },
      { id: 'holdings', label: 'Holdings', component: 'HoldingsSection' },
      { id: 'footnotes', label: 'Footnotes & Remarks', component: 'FootnotesSection' },
      { id: 'review', label: 'Review & Submit', component: 'ReviewSubmitSection' }
    ],
    sections: {
      showTransactions: true,
      showHoldings: true,
      showLateHoldings: false,
      showAff10b5One: true,
      requireTransactionDate: true,
      transactionFormType: '4',
      transactionTypes: ['4', '5']
    },
    validation: {
      maxReportingOwners: 10,
      maxNonDerivativeTransactions: 30,
      maxDerivativeTransactions: 30,
      maxNonDerivativeHoldings: 30,
      maxDerivativeHoldings: 30,
      maxFootnotes: 50
    }
  },
  
  [FORM_TYPES.FORM_5]: {
    title: 'Form 5 - Annual Statement of Changes in Beneficial Ownership',
    description: 'Annual statement of changes not reported on Form 4',
    documentType: '5',
    isAmendment: false,
    steps: [
      { id: 'form-type', label: 'Form Type', component: 'FormTypeStep' },
      { id: 'issuer', label: 'Issuer', component: 'IssuerSection' },
      { id: 'reporting-owners', label: 'Reporting Owners', component: 'ReportingOwnerSection' },
      { id: 'transactions', label: 'Transactions', component: 'TransactionSection' },
      { id: 'holdings', label: 'Holdings', component: 'HoldingsSection' },
      { id: 'footnotes', label: 'Footnotes & Remarks', component: 'FootnotesSection' },
      { id: 'review', label: 'Review & Submit', component: 'ReviewSubmitSection' }
    ],
    sections: {
      showTransactions: true,
      showHoldings: true,
      showLateHoldings: true, // Form 5 can include late Form 3 holdings
      showAff10b5One: true,
      requireTransactionDate: true,
      transactionFormType: '5',
      transactionTypes: ['4', '5'] // Can include both Form 4 and 5 transactions
    },
    validation: {
      maxReportingOwners: 10,
      maxNonDerivativeTransactions: 30,
      maxDerivativeTransactions: 30,
      maxNonDerivativeHoldings: 30,
      maxDerivativeHoldings: 30,
      maxFootnotes: 50
    }
  },
  
  [FORM_TYPES.FORM_5A]: {
    title: 'Form 5/A - Amendment to Annual Statement of Changes in Beneficial Ownership',
    description: 'Amendment to Form 5',
    documentType: '5',
    isAmendment: true,
    steps: [
      { id: 'form-type', label: 'Form Type', component: 'FormTypeStep' },
      { id: 'amendment', label: 'Amendment Info', component: 'AmendmentSection' },
      { id: 'issuer', label: 'Issuer', component: 'IssuerSection' },
      { id: 'reporting-owners', label: 'Reporting Owners', component: 'ReportingOwnerSection' },
      { id: 'transactions', label: 'Transactions', component: 'TransactionSection' },
      { id: 'holdings', label: 'Holdings', component: 'HoldingsSection' },
      { id: 'footnotes', label: 'Footnotes & Remarks', component: 'FootnotesSection' },
      { id: 'review', label: 'Review & Submit', component: 'ReviewSubmitSection' }
    ],
    sections: {
      showTransactions: true,
      showHoldings: true,
      showLateHoldings: true,
      showAff10b5One: true,
      requireTransactionDate: true,
      transactionFormType: '5',
      transactionTypes: ['4', '5']
    },
    validation: {
      maxReportingOwners: 10,
      maxNonDerivativeTransactions: 30,
      maxDerivativeTransactions: 30,
      maxNonDerivativeHoldings: 30,
      maxDerivativeHoldings: 30,
      maxFootnotes: 50
    }
  }
};

/**
 * Get configuration for a specific form type
 */
export const getFormConfig = (formType) => {
  return formConfig[formType] || formConfig[FORM_TYPES.FORM_3];
};

/**
 * Check if form type is an amendment
 */
export const isAmendment = (formType) => {
  return formType.includes('/A');
};

/**
 * Get base form type (without amendment suffix)
 */
export const getBaseFormType = (formType) => {
  return formType.replace('/A', '');
};






