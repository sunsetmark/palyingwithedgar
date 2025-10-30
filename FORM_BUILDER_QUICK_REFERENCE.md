# Unified Form Builder - Quick Reference Card

## 📁 File Structure

```
edgaronline/src/
├── config/
│   └── formConfig.js              ← All form type configurations
│
├── context/
│   ├── AuthContext.jsx            ← User authentication state
│   └── FilingContext.jsx          ← Filing form state (NEW!)
│
├── components/
│   ├── filing/                    ← NEW DIRECTORY!
│   │   ├── StepIndicator.jsx      ← Progress indicator
│   │   ├── FormTypeStep.jsx       ← Form selection screen
│   │   ├── AmendmentSection.jsx   ← Amendment info (3/A, 4/A, 5/A)
│   │   ├── IssuerSection.jsx      ← Issuer information
│   │   ├── ReportingOwnerSection.jsx ← 1-10 reporting owners
│   │   ├── TransactionSection.jsx ← Transactions (Forms 4 & 5)
│   │   ├── HoldingsSection.jsx    ← Holdings (all forms)
│   │   ├── FootnotesSection.jsx   ← Footnotes & remarks
│   │   └── ReviewSubmitSection.jsx ← Review & submit
│   └── layout/
│       ├── Header.jsx
│       └── Footer.jsx
│
├── pages/
│   ├── FilingWizard.jsx           ← Main wizard orchestrator (UPDATED!)
│   ├── Dashboard.jsx              ← Landing page (UPDATED!)
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── DraftsList.jsx             ← (stub for future)
│   └── SubmissionHistory.jsx      ← (stub for future)
│
└── services/
    └── api.js                     ← Axios instance with JWT
```

## 🎯 Component Relationships

```
App.jsx
  └─ AuthContext.Provider
       └─ Router
            ├─ Login/Register
            └─ Protected Routes
                 ├─ Dashboard
                 │    └─ Links to FilingWizard
                 │
                 └─ FilingWizard
                      └─ FilingContext.Provider
                           ├─ StepIndicator
                           └─ Dynamic Section Components
                                ├─ FormTypeStep
                                ├─ AmendmentSection (conditional)
                                ├─ IssuerSection
                                ├─ ReportingOwnerSection
                                ├─ TransactionSection (conditional)
                                ├─ HoldingsSection
                                ├─ FootnotesSection
                                └─ ReviewSubmitSection
```

## 🔄 Data Flow

```
1. User selects form type
   ↓
2. formConfig loads configuration
   ↓
3. FilingContext initializes state
   ↓
4. Wizard renders configured steps
   ↓
5. User fills sections → State updates via actions
   ↓
6. Each change triggers FilingContext reducer
   ↓
7. Review step → Validation
   ↓
8. Submit → API call → XML generation → SEC submission
```

## 🎨 Form Type Behavior Matrix

| Feature | Form 3 | Form 3/A | Form 4 | Form 4/A | Form 5 | Form 5/A |
|---------|--------|----------|--------|----------|--------|----------|
| Issuer Info | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reporting Owners | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Amendment Date | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Transactions | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Holdings | ✅ req | ✅ req | ✅ opt | ✅ opt | ✅ opt | ✅ opt |
| Late Holdings | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| 10b5-1 Flag | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Footnotes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Remarks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 📋 Configuration Keys

Each form type in `formConfig.js` has:

```javascript
{
  title: string,           // Display title
  description: string,     // Help text
  documentType: '3'|'4'|'5', // Base form type
  isAmendment: boolean,    // Is this an amendment?
  
  steps: [                 // Wizard steps
    { id, label, component }
  ],
  
  sections: {              // Section visibility
    showTransactions: boolean,
    showHoldings: boolean,
    showLateHoldings: boolean,
    showAff10b5One: boolean,
    transactionFormType: '4'|'5'
  },
  
  validation: {            // Limits
    maxReportingOwners: 10,
    maxNonDerivativeTransactions: 30,
    maxDerivativeTransactions: 30,
    maxNonDerivativeHoldings: 30,
    maxDerivativeHoldings: 30,
    maxFootnotes: 50
  }
}
```

## 🔧 FilingContext State

```javascript
{
  // Metadata
  formType: '3'|'3/A'|'4'|'4/A'|'5'|'5/A',
  isDraft: boolean,
  draftId: string,
  currentStep: number,
  
  // Amendment
  amendment: {
    dateOfOriginalSubmission: string
  },
  
  // Issuer
  issuer: {
    cik: string,
    name: string,
    tradingSymbol: string,
    address: { street1, street2, city, state, zipCode }
  },
  
  // Reporting Owners (array, 0-10)
  reportingOwners: [{
    cik: string,
    ccc: string,
    name: string,
    address: {...},
    relationships: {
      isDirector: boolean,
      isOfficer: boolean,
      isTenPercentOwner: boolean,
      isOther: boolean,
      otherText: string
    },
    officerTitle: string
  }],
  
  // Flags
  notSubjectToSection16: boolean,
  aff10b5One: boolean,
  
  // Transactions (arrays)
  nonDerivativeTransactions: [{...}],
  derivativeTransactions: [{...}],
  
  // Holdings (arrays)
  nonDerivativeHoldings: [{...}],
  derivativeHoldings: [{...}],
  
  // Footnotes (array, 0-50)
  footnotes: [{
    id: string,
    text: string
  }],
  
  // Remarks
  remarks: string,
  
  // Validation & Submission
  validationErrors: {},
  isSubmitting: boolean,
  submissionError: string
}
```

## 🎬 FilingContext Actions

```javascript
// Form type & navigation
setFormType(formType)
setStep(stepNumber)
nextStep()
prevStep()

// Issuer
updateIssuer(data)

// Reporting Owners
addReportingOwner(owner)
updateReportingOwner(index, data)
removeReportingOwner(index)

// Amendment
updateAmendment(data)

// Flags
setAff10b5One(boolean)

// Transactions
addTransaction(type, data)
updateTransaction(type, index, data)
removeTransaction(type, index)

// Holdings
addHolding(type, data)
updateHolding(type, index, data)
removeHolding(type, index)

// Footnotes
addFootnote(footnote)
updateFootnote(index, data)
removeFootnote(index)

// Remarks
updateRemarks(text)

// Validation & Submission
setValidationErrors(errors)
setSubmitting(boolean)
setSubmissionError(error)

// Drafts
loadDraft(draftData)
resetForm(formType)
```

## 🧪 Testing Checklist

### Form 3 Flow
- [ ] Select Form 3
- [ ] Enter issuer CIK and lookup
- [ ] Add 1 reporting owner
- [ ] Add relationship
- [ ] Add 1 non-derivative holding
- [ ] Add footnote
- [ ] Review and validate
- [ ] Submit

### Form 4 Flow
- [ ] Select Form 4
- [ ] Enter issuer info
- [ ] Add reporting owner
- [ ] Add transaction with all fields
- [ ] Set 10b5-1 flag
- [ ] Add holding
- [ ] Review and validate
- [ ] Submit

### Multi-Owner Test
- [ ] Select any form
- [ ] Add 3 reporting owners
- [ ] Each with different relationships
- [ ] Verify all CCCs are masked
- [ ] Collapse/expand cards
- [ ] Remove middle owner

### Amendment Test
- [ ] Select Form 3/A
- [ ] Enter original submission date
- [ ] Complete rest of form
- [ ] Verify date validation

### Validation Test
- [ ] Try to proceed without required fields
- [ ] Verify error messages
- [ ] Fix errors
- [ ] Verify errors clear
- [ ] Validate on review step

## 🐛 Common Issues & Solutions

### Issue: CIK lookup fails
**Solution**: Check API is running on port 3001, verify database connection

### Issue: Step doesn't advance
**Solution**: Check for validation errors, open browser console

### Issue: State resets when navigating
**Solution**: Ensure FilingProvider wraps FilingWizard

### Issue: CCC appears in plain text
**Solution**: Verify input type="password" in ReportingOwnerSection

### Issue: Wrong sections appear
**Solution**: Check formConfig matches expected form type

## 📊 Performance Notes

- Each section auto-saves on blur (onBlur handlers)
- CIK lookup debounced to prevent excessive API calls
- Large arrays (transactions, holdings) use index-based updates
- Collapsible cards reduce DOM nodes for better rendering

## 🔐 Security Notes

- CCC fields are `type="password"` - never logged or displayed
- All API calls include JWT token in Authorization header
- CCC encrypted before transmission (handled by API)
- Form state never persisted to localStorage (security risk)

## 🚀 Next Development Tasks

1. Implement auto-save to drafts
2. Complete derivative forms
3. Add XML preview modal
4. Implement "Load from previous filing"
5. Add file upload for exhibits
6. Enhance validation with real-time feedback
7. Add transaction calculator (pre/post shares)
8. Implement batch CSV import

## 📞 API Endpoints Used

```
Authentication:
  POST /api/auth/register
  POST /api/auth/login
  POST /api/auth/logout

CIK Operations:
  GET /api/cik/validate/:cik       ← Used by IssuerSection, ReportingOwnerSection

Filing Operations:
  POST /api/filings                ← Save draft (future)
  GET /api/filings/:id            ← Load draft (future)
  PUT /api/filings/:id            ← Update draft (future)
  POST /api/filings/validate       ← Validate filing
  POST /api/filings/submit         ← Submit to SEC
```

---

**Last Updated**: 2025-10-29
**Version**: 1.0.0






