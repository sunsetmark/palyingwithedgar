# Series and Class Contract Ordering Analysis

## Summary
Analysis of **100,000 JSON files** from `/data/filings/` to verify ordering assumptions for series and class_contract arrays.

## Analysis Results

### Files Analyzed
- **Total files processed**: 100,000
- **Files with series data**: 6,910 (6.91%)
- **Files with class contracts**: 10,160 (10.16%)

### Ordering Verification
| Array Type | Expected Order | Files Checked | Issues Found | Accuracy |
|------------|---------------|---------------|--------------|----------|
| Existing Series | (owner_cik, series_id) | 6,910 | **0** | **100%** ✅ |
| New Series | (owner_cik, series_id) | 6,910 | **0** | **100%** ✅ |
| Class Contracts | class_contract_id | 10,160 | **0** | **100%** ✅ |

## Verified Ordering Rules

### 1. Series Arrays
**Order**: `(owner_cik, series_id)`

Both `existing_series_and_classes_contracts.series` and `new_series_and_classes_contracts.new_series` arrays are ordered by:
1. First by `owner_cik` (can be at parent level or in each series object)
2. Then by `series_id` within each owner

### 2. Class Contract Arrays
**Order**: `class_contract_id`

The `series.class_contract` arrays within each series are ordered by `class_contract_id` in ascending order.

## Database Implementation

### Current ORDER BY Clauses
✅ **Correct implementation** - No changes needed:

```sql
-- Reading series (common.mjs line 512)
SELECT * FROM submission_series 
WHERE adsh = ? 
ORDER BY owner_cik, series_id

-- Reading class contracts (common.mjs line 530)
SELECT * FROM submission_class_contract 
WHERE adsh = ? AND series_id = ? 
ORDER BY class_contract_id
```

### Why Sequence Fields Are NOT Needed

Unlike `submission_item`, `submission_entity`, and `submission_former_name`, the series and class_contract tables do **NOT** need explicit sequence fields because:

1. **Natural Key Ordering**: The data is naturally ordered by its primary/foreign keys:
   - Series: `(owner_cik, series_id)`
   - Class Contracts: `class_contract_id`

2. **100% Consistency**: The analysis of 100,000 files shows **zero exceptions** to this ordering rule

3. **Stable Sort Keys**: These are immutable identifiers that maintain their order regardless of insertion sequence

### Comparison with Other Tables

| Table | Needs Sequence Field? | Reason |
|-------|----------------------|---------|
| `submission_item` | ❌ No | Items are naturally ordered by item_code (100% verified across 100,000 files) |
| `submission_entity` | ✅ Yes | Multiple entities of same type need array order preserved (no natural ordering) |
| `submission_former_name` | ✅ Yes | Multiple name changes on same date need array order preserved (no natural ordering) |
| `submission_series` | ❌ No | Naturally ordered by (owner_cik, series_id) |
| `submission_class_contract` | ❌ No | Naturally ordered by class_contract_id |
| `submission_references_429` | ✅ Yes (Implemented) | References array has no natural ordering |
| `submission_group_members` | ✅ Yes (Implemented) | Group members array has no natural ordering |
| `submission_merger` | ✅ Yes (Implemented) | Merger data array has no natural ordering |
| `submission_target_data` | ✅ Yes (Implemented) | Target data array has no natural ordering |

### Item Ordering Analysis

**Additional Analysis Performed**: 100,000 files analyzed for item/items array ordering

**Results**:
- Files with item data: 10,816
- Items ordered by `item_code`: **10,816 (100.00%)** ✅
- Items NOT ordered by `item_code`: **0 (0.00%)**

**Conclusion**: Item arrays ARE naturally ordered by `item_code` in source files (100% verified across 100,000 files). Since the ordering is natural and consistent, we can simply use `ORDER BY item_code` when fetching items from the database.

**Implementation Status**: The `item_sequence` field has been removed. The database uses `ORDER BY item_code` to retrieve items in their natural order.

## Test Results

✅ **All tests pass**: 200/200 files match perfectly with current implementation

## Conclusion

The assumption is **100% verified** across 100,000 files. The current database implementation correctly orders series and class contracts using their natural keys, and no schema changes are required.

---
*Analysis performed*: 2025-10-11
*Files analyzed*: 100,000
*Script*: analyzeSeriesOrdering.mjs

