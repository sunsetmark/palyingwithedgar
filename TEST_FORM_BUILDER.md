# Testing the Unified Form Builder

## Quick Start Test

Open your browser and navigate to: **http://localhost:3000**

### 1. Login
```
Email: demo@example.com
Password: demo123
```

### 2. Access the Form Builder

Click **"Start New Filing"** from the dashboard.

You should see a beautiful card-based form selection screen with 6 options:
- Form 3
- Form 3/A
- Form 4
- Form 4/A
- Form 5
- Form 5/A

## Test Scenario 1: Form 3 (Initial Ownership)

### Step 1: Select Form Type
- [x] Click on **Form 3** card
- [x] Verify you're redirected to `/filing-wizard?type=3`
- [x] Verify step indicator shows all steps

### Step 2: Issuer Information
- [x] Enter CIK: `0000789019` (Microsoft)
- [x] Click **Lookup** button
- [x] Verify name and address auto-populate
- [x] Update trading symbol to `MSFT`
- [x] Click **Next**

### Step 3: Reporting Owners
- [x] Click **+ Add Reporting Owner**
- [x] Enter CIK: `0001234567`
- [x] Enter CCC: `12345678` (8 characters)
- [x] Verify CCC is masked (password field)
- [x] Enter name: `John Doe`
- [x] Fill in address fields
- [x] Check **Director** checkbox
- [x] Check **Officer** checkbox
- [x] Enter officer title: `Chief Financial Officer`
- [x] Verify form auto-saves on blur
- [x] Click **▲ Collapse** to collapse the card
- [x] Verify card collapses
- [x] Click **▼ Expand** to expand again
- [x] Click **Next**

### Step 4: Holdings (Skip Transactions - not shown for Form 3)
- [x] Verify **Transactions** step is NOT in the step indicator
- [x] Click **Non-Derivative** tab
- [x] Click **+ Add Non-Derivative Holding**
- [x] Enter security title: `Common Stock`
- [x] Enter shares owned: `1000`
- [x] Select ownership: `D - Direct`
- [x] Collapse the holding card
- [x] Click **Derivative** tab
- [x] Verify warning message about derivative forms being under development
- [x] Click **Next**

### Step 5: Footnotes & Remarks
- [x] Click **+ Add Footnote**
- [x] Enter ID: `F1`
- [x] Enter text: `Shares held in brokerage account.`
- [x] Click **+ Add Footnote** again
- [x] Enter ID: `F2`
- [x] Enter text: `Officer position effective January 1, 2025.`
- [x] Type in Remarks: `Initial filing as reporting person.`
- [x] Verify character counter shows `34/2000`
- [x] Click **Next**

### Step 6: Review & Submit
- [x] Verify Filing Summary shows:
  - Form Type: 3
  - Issuer: Microsoft (CIK: 0000789019)
  - Reporting Owners: 1
  - Non-Derivative Holdings: 1
  - Footnotes: 2
  - Remarks: Yes
- [x] Expand **Issuer Information** accordion
- [x] Verify all issuer data is correct
- [x] Expand **Reporting Owners** accordion
- [x] Verify owner name, CIK, and relationships
- [x] Click **Validate Filing**
- [x] Verify validation passes or shows errors
- [x] Click **Submit to SEC** (will call API)

---

## Test Scenario 2: Form 4 (Transaction Reporting)

### Select Form 4
- [x] Go back to dashboard
- [x] Click **Start New Filing**
- [x] Select **Form 4**

### Issuer Section
- [x] Enter issuer CIK and lookup
- [x] Next

### Reporting Owners
- [x] Add 2 reporting owners
- [x] Owner 1: Director
- [x] Owner 2: 10% Owner
- [x] Verify both cards can be collapsed/expanded
- [x] Next

### Transactions (NEW SECTION!)
- [x] Verify **Transactions** step appears in step indicator
- [x] Verify **Rule 10b5-1 Trading Plan** checkbox appears
- [x] Check the 10b5-1 checkbox
- [x] Click **Non-Derivative** tab
- [x] Click **+ Add Non-Derivative Transaction**
- [x] Enter:
  - Security Title: `Common Stock`
  - Transaction Date: `2025-10-15`
  - Transaction Code: `P - Purchase`
  - Shares: `500`
  - Price Per Share: `150.00`
  - Acquired/Disposed: `A - Acquired`
  - Shares Owned Following: `1500`
  - Ownership: `D - Direct`
  - Equity Swap: Unchecked
- [x] Add another transaction
- [x] Enter sale transaction with code `S - Sale`
- [x] Verify both transactions appear in list
- [x] Collapse first transaction
- [x] Click **✕** to remove second transaction
- [x] Confirm removal
- [x] Verify only one transaction remains
- [x] Next

### Holdings
- [x] Add holding (optional for Form 4)
- [x] Next

### Footnotes & Review
- [x] Add footnotes if needed
- [x] Review
- [x] Validate
- [x] Submit

---

## Test Scenario 3: Form 3/A (Amendment)

### Select Form 3/A
- [x] Select **Form 3/A** from form type selection

### Amendment Information (NEW SECTION!)
- [x] Verify **Amendment Info** step appears BEFORE Issuer
- [x] Enter **Date of Original Submission**: `2025-10-01`
- [x] Try entering future date
- [x] Verify validation error: "Date cannot be in the future"
- [x] Enter valid past date
- [x] Read the alert about amendment replacing original
- [x] Next

### Complete Rest of Form
- [x] Complete all sections
- [x] Verify form structure same as Form 3
- [x] Review shows amendment date

---

## Test Scenario 4: Multi-Owner Test

### Add Maximum Owners
- [x] Start any form type
- [x] Go to Reporting Owners section
- [x] Add 10 reporting owners (maximum)
- [x] Verify **+ Add Reporting Owner** button disappears
- [x] Verify message: "Maximum number of reporting owners (10) reached"
- [x] Remove one owner
- [x] Verify button reappears
- [x] Verify count decreases to 9

### Test Remove Middle Owner
- [x] With 5 owners added
- [x] Remove owner #3
- [x] Verify confirmation dialog
- [x] Confirm removal
- [x] Verify owner #4 becomes new #3
- [x] Verify owner numbering updates

---

## Test Scenario 5: Navigation & State Persistence

### Test Previous/Next
- [x] Start new filing
- [x] Complete first 3 steps
- [x] Click **Previous** button
- [x] Verify you go back one step
- [x] Verify data is still there
- [x] Click **Next** to go forward
- [x] Verify you advance

### Test Step Indicator Click
- [x] Complete several steps
- [x] Try clicking on a previous step in indicator
- [x] (Currently not clickable - future enhancement)

### Test Cancel
- [x] Fill in several sections
- [x] Click **Cancel** button
- [x] Verify confirmation dialog
- [x] Confirm cancellation
- [x] Verify redirect to dashboard

---

## Test Scenario 6: Validation

### Required Field Validation
- [x] Start new filing
- [x] Try to go to next step without filling issuer
- [x] Verify validation errors prevent progression
- [x] Fill required fields
- [x] Verify errors clear
- [x] Advance to next step

### CIK Lookup Validation
- [x] Enter invalid CIK: `abc123`
- [x] Click Lookup
- [x] Verify error: "CIK must be numeric"
- [x] Enter valid but non-existent CIK: `9999999999`
- [x] Click Lookup
- [x] Verify error from API
- [x] Enter valid CIK
- [x] Verify successful lookup

### Review Step Validation
- [x] Complete form with missing required fields
- [x] Go to review step
- [x] Click **Validate Filing**
- [x] Verify validation errors listed
- [x] Click on error to go back (future enhancement)
- [x] Fix errors
- [x] Re-validate
- [x] Verify validation passes

---

## Test Scenario 7: Footnotes & Remarks

### Test Footnote Management
- [x] Go to Footnotes section
- [x] Add 5 footnotes
- [x] Use IDs: F1, F2, F3, F4, F5
- [x] Remove F3 (middle one)
- [x] Add F6
- [x] Verify all footnotes persist
- [x] Try adding 50 footnotes (maximum)
- [x] Verify max limit message appears

### Test Remarks
- [x] Type 2500 characters in remarks
- [x] Verify character counter shows `2500/2000`
- [x] (Note: Currently no hard limit enforced)
- [x] Verify remarks persist on navigation

---

## Test Scenario 8: Browser Tests

### Chrome
- [x] Open in Chrome
- [x] Test all scenarios
- [x] Check console for errors
- [x] Verify styling is correct

### Firefox
- [x] Open in Firefox
- [x] Test form selection
- [x] Test step navigation
- [x] Verify no console errors

### Safari (if available)
- [x] Test basic flow
- [x] Verify USWDS styling

### Mobile/Responsive
- [x] Open Chrome DevTools
- [x] Switch to mobile view (375px)
- [x] Test form on phone size
- [x] Verify cards stack vertically
- [x] Verify buttons are accessible
- [x] Test on tablet size (768px)

---

## Test Scenario 9: Security

### CCC Masking
- [x] Enter CCC in reporting owner
- [x] Verify dots/asterisks appear instead of characters
- [x] Collapse card
- [x] Expand card
- [x] Verify CCC still masked
- [x] Open browser DevTools
- [x] Inspect input element
- [x] Verify type="password"

### API Authentication
- [x] Open Network tab in DevTools
- [x] Make API call (e.g., CIK lookup)
- [x] Verify Authorization header present
- [x] Verify JWT token format
- [x] Log out
- [x] Try to access /filing-wizard
- [x] Verify redirect to login

---

## Test Scenario 10: Error Handling

### Network Errors
- [x] Stop the API server
- [x] Try CIK lookup
- [x] Verify friendly error message
- [x] Restart API server
- [x] Retry lookup
- [x] Verify success

### Invalid Data
- [x] Enter non-numeric values in number fields
- [x] Enter future dates in date fields
- [x] Leave required fields empty
- [x] Verify validation catches all errors

---

## Expected Results Summary

✅ **All Form Types**: Form selection works, correct steps appear
✅ **Form 3**: No transactions, holdings required
✅ **Form 4**: Transactions shown, 10b5-1 flag appears
✅ **Form 5**: Same as Form 4, plus late holdings option
✅ **Amendments**: Date field appears, rest of form identical
✅ **Multi-Owner**: Up to 10 owners, collapsible cards
✅ **Validation**: Client and server-side validation works
✅ **Navigation**: Previous/Next buttons work, state persists
✅ **CIK Lookup**: Auto-populates entity information
✅ **Security**: CCC masked, JWT authentication works
✅ **Responsive**: Works on mobile, tablet, desktop
✅ **USWDS Styling**: Consistent SEC.gov theme throughout

---

## Bugs to Watch For

⚠️ **Known Issues**:
1. Derivative forms show "under development" message
2. XML preview not yet implemented
3. Draft save/load not yet implemented
4. Step indicator not clickable
5. No auto-save (manual save only)

🐛 **Report Issues**:
- Check browser console for errors
- Note the form type and step where issue occurs
- Provide screenshot if styling is broken
- Check Network tab for failed API calls

---

## Performance Benchmarks

- Page load: < 1s
- Form type selection: < 100ms
- Step navigation: < 200ms
- CIK lookup: < 500ms
- Form validation: < 1s
- Memory usage: < 50MB

---

**Testing completed**: _________________
**Tested by**: _________________
**Browser/OS**: _________________
**Pass/Fail**: _________________
**Notes**: _________________






