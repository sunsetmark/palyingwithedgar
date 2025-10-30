# EDGAR Online Unified Form Builder Architecture

## Overview

The EDGAR Online system uses a **unified, configuration-driven form builder** to handle all SEC ownership forms (3, 3/A, 4, 4/A, 5, 5/A). This architectural decision was made after analyzing the XSD schemas and determining that all three form types share approximately 80% of their structure.

## Key Decision: Single Unified Builder

### Analysis Results

After examining the XSD files for Forms 3, 4, and 5, we found:

1. **Shared Components (100% identical across all forms):**
   - Issuer information
   - Reporting owner information (1-10 owners)
   - Non-derivative holdings structure
   - Derivative holdings structure
   - Footnotes (1-50)
   - Remarks
   - Ownership nature fields

2. **Form-Specific Differences:**
   - **Form 3**: Holdings only (no transactions)
   - **Forms 4 & 5**: Both transactions and holdings
   - **Form 5 specific**: Late holdings flag
   - **Amendments (3/A, 4/A, 5/A)**: Add `dateOfOriginalSubmission` field

3. **Transaction Differences:**
   - Forms 4 and 5 share nearly identical transaction structures
   - Only difference: transaction timing flags (on-time vs late)

### Advantages of Unified Builder

| Aspect | Single Builder | Separate Builders |
|--------|---------------|-------------------|
| Code reuse | ✅ 80% shared | ❌ Lots of duplication |
| Consistency | ✅ Guaranteed | ❌ Can diverge |
| Maintenance | ✅ One place | ❌ Three places |
| Testing | ✅ Less to test | ❌ 3x test scenarios |
| XML Generation | ✅ Single template | ❌ Three templates |
| Complexity | ⚠️ +20% upfront | ✅ Simpler initially |

## Architecture Components

### 1. Configuration Layer (`src/config/formConfig.js`)

Central configuration defining behavior for each form type:

```javascript
export const formConfig = {
  '3': {
    title: 'Form 3 - Initial Statement',
    sections: {
      showTransactions: false,
      showHoldings: true,
      showLateHoldings: false
    },
    steps: [...],
    validation: {...}
  },
  '4': {
    title: 'Form 4 - Changes in Ownership',
    sections: {
      showTransactions: true,
      showHoldings: true,
      showAff10b5One: true
    },
    steps: [...],
    validation: {...}
  }
  // ... Form 5, and amendments
}
```

### 2. State Management (`src/context/FilingContext.jsx`)

React Context + useReducer for global form state:

- **Form metadata**: Form type, draft status, current step
- **Issuer data**: CIK, name, address
- **Reporting owners**: Array of 1-10 owners with CCC
- **Transactions**: Non-derivative and derivative (Forms 4 & 5 only)
- **Holdings**: Non-derivative and derivative (all forms)
- **Footnotes**: Array of up to 50 footnotes
- **Remarks**: Optional free text

### 3. Main Wizard (`src/pages/FilingWizard.jsx`)

Orchestrates the multi-step process:

1. Reads form type from URL params
2. Loads appropriate configuration
3. Dynamically renders section components based on config
4. Manages step navigation
5. Handles save draft and submission

### 4. Section Components

**Shared by all forms:**
- `FormTypeStep` - Form type selection
- `IssuerSection` - Issuer information with CIK lookup
- `ReportingOwnerSection` - 1-10 reporting owners
- `FootnotesSection` - Footnotes and remarks
- `ReviewSubmitSection` - Final review and submission

**Conditional (based on form type):**
- `AmendmentSection` - Amendment-specific fields (3/A, 4/A, 5/A)
- `TransactionSection` - Transactions (Forms 4 & 5 only)
- `HoldingsSection` - Holdings (all forms, but required for Form 3)

### 5. Step Indicator (`src/components/filing/StepIndicator.jsx`)

USWDS-compliant progress indicator showing:
- All steps for the current form type
- Current step highlighted
- Completed steps marked

## Data Flow

```
User selects form type
    ↓
formConfig loads appropriate configuration
    ↓
FilingWizard renders configured steps
    ↓
User fills in sections → Data saved to FilingContext
    ↓
Auto-save to drafts (future enhancement)
    ↓
Validation on review step
    ↓
Submit to API → Generate XML → Submit to SEC
```

## Form-Specific Behavior

### Form 3 - Initial Statement
- **Purpose**: Report initial holdings when becoming an insider
- **Required**: Issuer, ≥1 reporting owner, ≥1 holding
- **Sections**: No transactions
- **Unique**: Must report all securities owned (even if zero)

### Form 4 - Changes in Ownership
- **Purpose**: Report transactions within 2 business days
- **Required**: Issuer, ≥1 reporting owner, ≥1 transaction OR holding
- **Sections**: Transactions + holdings
- **Unique**: Rule 10b5-1 trading plan affirmation

### Form 5 - Annual Statement
- **Purpose**: Report late or exempt transactions annually
- **Required**: Same as Form 4
- **Sections**: Transactions + holdings + late holdings
- **Unique**: Can include late Form 3 holdings

### Amendments (3/A, 4/A, 5/A)
- Adds `dateOfOriginalSubmission` field
- Otherwise identical to base form
- Replaces original filing entirely (not partial update)

## Validation Strategy

**Client-Side Validation:**
- React Hook Form validation on each field
- Section-level validation before allowing "Next"
- Cross-field validation (e.g., officer requires title)
- Format validation (dates, numbers, CIK)

**Server-Side Validation:**
- CIK verification against SEC database
- XML schema validation
- Business rule validation
- Duplicate submission check

## Security Features

1. **CCC Protection**: Reporting owner CCCs are:
   - Entered as password fields
   - Never displayed after entry
   - Encrypted before API transmission
   - Encrypted at rest in database

2. **Authentication**: JWT tokens required for all API calls

3. **Ownership Verification**: Users can only access their own drafts

## Future Enhancements

1. **Auto-save**: Periodic draft saves while editing
2. **Derivative Forms**: Complete derivative transaction/holding forms
3. **Prefill**: Load prior filings to prefill data
4. **XML Preview**: Show generated XML before submission
5. **Batch Processing**: Multiple reporting owners from CSV
6. **Validation API**: Real-time field validation
7. **File Attachments**: Support for exhibits and cover letters

## API Endpoints

### Filing Management
- `POST /api/filings` - Create new draft
- `GET /api/filings/:id` - Get draft
- `PUT /api/filings/:id` - Update draft
- `DELETE /api/filings/:id` - Delete draft
- `GET /api/filings` - List user's drafts

### Validation
- `POST /api/filings/validate` - Validate filing
- `GET /api/cik/validate/:cik` - Validate and lookup CIK

### Submission
- `POST /api/filings/submit` - Submit to SEC
- `GET /api/filings/:id/status` - Check submission status

## Technology Stack

**Frontend:**
- React 18 with functional components
- React Context for state management
- React Hook Form for form handling
- React Router for navigation
- USWDS 3.0 for styling
- Axios for API calls

**Backend:**
- Node.js with Express
- MariaDB for data storage
- AWS S3 for document storage
- JWT for authentication
- bcrypt for password hashing
- XML generation libraries

## Testing Strategy

1. **Unit Tests**: Each section component
2. **Integration Tests**: Multi-step workflows
3. **E2E Tests**: Complete filing submission
4. **Validation Tests**: All validation rules
5. **Security Tests**: CCC encryption, JWT handling

## Performance Considerations

- Lazy loading of section components
- Debounced auto-save
- Optimistic UI updates
- Background validation
- Compressed API responses

## Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- ARIA labels on all interactive elements
- High contrast mode support
- Focus management

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- No IE11 support

## Deployment

Development server runs on:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

Production deployment uses:
- Frontend: Nginx serving static React build
- Backend: PM2 process manager
- Database: MariaDB cluster
- File storage: AWS S3
- SSL/TLS: Let's Encrypt

## Monitoring

- Application logs: Winston
- Error tracking: Sentry (future)
- Performance: Lighthouse CI
- Uptime: Health check endpoint

---

**Last Updated**: 2025-10-29
**Version**: 1.0.0
**Authors**: EDGAR Online Development Team






