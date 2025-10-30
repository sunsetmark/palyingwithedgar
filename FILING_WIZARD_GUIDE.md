# EDGAR Online Filing Wizard - Quick Start Guide

## What We Built

A unified, configuration-driven form builder that handles all SEC ownership forms (3, 3/A, 4, 4/A, 5, 5/A) with a single codebase.

## Accessing the Form Builder

1. Log in to the system at http://localhost:3000
2. Click "Start New Filing" from the dashboard
3. Select your form type (3, 4, or 5, or amendments)
4. Follow the step-by-step wizard

## Form Types

### Form 3 - Initial Statement
- **When to use**: When you become an insider (officer, director, or 10% owner)
- **What to report**: All securities you own at the time of becoming an insider
- **Sections**: Issuer → Reporting Owners → Holdings → Footnotes → Review

### Form 4 - Changes in Ownership
- **When to use**: Within 2 business days of a transaction
- **What to report**: Transactions (buys, sells, grants, exercises)
- **Sections**: Issuer → Reporting Owners → Transactions → Holdings → Footnotes → Review

### Form 5 - Annual Statement
- **When to use**: Within 45 days of fiscal year end
- **What to report**: Late or exempt transactions from the past year
- **Sections**: Same as Form 4, plus late holdings

### Amendments (3/A, 4/A, 5/A)
- **When to use**: To correct or update a previously filed form
- **Additional requirement**: Date of original submission

## Step-by-Step Walkthrough

### Step 1: Form Type Selection
- Choose your form type from the card grid
- Read the description to ensure you're selecting the right form

### Step 2: Issuer Information
- Enter the company's CIK number
- Click "Lookup" to auto-populate name and address
- Verify all information is correct

### Step 3: Reporting Owners (1-10)
- Enter CIK and CCC for each reporting owner
- Use "Lookup" to auto-populate name and address
- Select relationship(s) to issuer (Director, Officer, 10% Owner, Other)
- If Officer, provide officer title
- You can add up to 10 reporting owners per filing

### Step 4: Transactions (Forms 4 & 5 only)
- **Non-Derivative Tab**: Common stock and other equity securities
  - Security title (e.g., "Common Stock")
  - Transaction date
  - Transaction code (P=Purchase, S=Sale, etc.)
  - Number of shares
  - Price per share (optional)
  - Acquired (A) or Disposed (D)
  - Shares owned after transaction
  - Direct or indirect ownership
  
- **Derivative Tab**: Stock options, warrants, convertible securities
  - *Currently under development*

### Step 5: Holdings
- **Non-Derivative Tab**: Current stock holdings
  - Security title
  - Number of shares owned
  - Direct or indirect ownership
  
- **Derivative Tab**: Options, warrants, etc.
  - *Currently under development*

### Step 6: Footnotes & Remarks
- Add footnotes with unique IDs (e.g., F1, F2)
- Footnotes can be referenced in transactions/holdings
- Add general remarks if needed

### Step 7: Review & Submit
- Review the filing summary
- Click "Validate Filing" to check for errors
- Fix any validation errors
- Click "Submit to SEC" when ready

## Important Features

### Auto-Save
- Form data is automatically saved as you type (future enhancement)
- You can close the browser and return later

### CIK Lookup
- Automatically fetches company/person information from SEC database
- Validates CIK numbers
- Populates name and address fields

### CCC Security
- CCC codes are password-masked
- Never displayed after entry
- Encrypted before transmission
- Required for authentication

### Validation
- Real-time field validation
- Section-level validation before progressing
- Server-side XML schema validation
- Business rule validation

### Multiple Reporting Owners
- Support for up to 10 reporting owners per filing
- Each owner can have different relationships
- All owners share the same issuer and filing date

## Tips & Best Practices

1. **Use CIK Lookup**: Always use the CIK lookup feature to ensure accurate entity information

2. **Save Drafts**: Use "Save Draft" button frequently (when implemented)

3. **Footnotes**: Use descriptive footnote IDs (F1, F2, etc.) for easy reference

4. **Transaction Codes**: 
   - P = Purchase
   - S = Sale
   - A = Grant/Award
   - M = Exercise
   - See the dropdown for full list

5. **Direct vs Indirect**:
   - Direct (D): You own the securities personally
   - Indirect (I): Securities are held in trust, by family member, etc.

6. **Form 3 Requirements**:
   - Must report ALL holdings, even if zero
   - Cannot have transactions (holdings only)

7. **Form 4 Timing**:
   - Must file within 2 business days of transaction
   - Check Rule 10b5-1 box if transaction was made under a trading plan

## Troubleshooting

### "CIK lookup failed"
- Verify the CIK number is correct (10 digits, zero-padded)
- Check your internet connection
- Try again in a few moments

### "Validation errors"
- Read each error message carefully
- Go back to the relevant step
- Fix the issue and proceed

### "Cannot add more reporting owners"
- Maximum of 10 reporting owners per filing
- Consider filing separate forms if needed

### "Form doesn't save"
- Check your browser console for errors
- Verify you're still logged in
- Try refreshing the page

## Technical Details

### File Structure
```
edgaronline/
├── src/
│   ├── config/
│   │   └── formConfig.js          # Form type configurations
│   ├── context/
│   │   └── FilingContext.jsx      # Global state management
│   ├── components/
│   │   └── filing/
│   │       ├── StepIndicator.jsx
│   │       ├── FormTypeStep.jsx
│   │       ├── AmendmentSection.jsx
│   │       ├── IssuerSection.jsx
│   │       ├── ReportingOwnerSection.jsx
│   │       ├── TransactionSection.jsx
│   │       ├── HoldingsSection.jsx
│   │       ├── FootnotesSection.jsx
│   │       └── ReviewSubmitSection.jsx
│   └── pages/
│       └── FilingWizard.jsx       # Main wizard orchestrator
```

### State Structure
The filing state includes:
- Form metadata (type, step, draft ID)
- Issuer information
- Array of reporting owners
- Array of transactions (non-derivative and derivative)
- Array of holdings (non-derivative and derivative)
- Array of footnotes
- Remarks text
- Validation errors

### API Integration
- `GET /api/cik/validate/:cik` - Lookup CIK
- `POST /api/filings` - Create draft
- `PUT /api/filings/:id` - Update draft
- `POST /api/filings/validate` - Validate filing
- `POST /api/filings/submit` - Submit to SEC

## Getting Help

For technical support or questions:
1. Check the console for error messages
2. Review the validation errors carefully
3. Refer to the SEC EDGAR technical specifications
4. Contact the development team

## Next Steps

After successfully submitting:
1. You'll receive a confirmation with accession number
2. Check "Submission History" for status updates
3. SEC will process the filing (typically within 24 hours)
4. You'll receive acceptance or suspension notice

---

**Version**: 1.0.0
**Last Updated**: October 29, 2025
