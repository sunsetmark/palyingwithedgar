# Sequence Fields Usage Guide

This document provides examples for properly using sequence fields when inserting and selecting data from tables that require array order preservation.

**Status**: ✅ All code examples below have been implemented in `edgarFeedFileProcessor.mjs` and `common.mjs`.

## Tables with Sequence Fields

The following tables use sequence fields to preserve the original order of arrays from EDGAR filing JSON, since database connection pooling can cause async inserts to complete out of order:

| Table | Sequence Field | Data Type | Usage |
|-------|---------------|-----------|-------|
| `submission_references_429` | `reference_sequence` | SMALLINT UNSIGNED | 429 references array |
| `submission_group_members` | `group_member_sequence` | SMALLINT UNSIGNED | Group members array |
| `submission_merger` | `merger_sequence` | SMALLINT UNSIGNED | Merger data array |
| `submission_target_data` | `target_sequence` | SMALLINT UNSIGNED | Target data array |
| `submission_entity` | `entity_sequence` | INT | Entity arrays (filer, reporting_owner, etc.) |
| `submission_former_name` | `former_name_sequence` | INT | Former company/name arrays |

## INSERT Examples

### submission_references_429

```javascript
// In edgarFeedFileProcessor.mjs - writeSubmissionHeaderRecords()
if (jsonMetaData.references_429 && Array.isArray(jsonMetaData.references_429)) {
    jsonMetaData.references_429.forEach((reference, index) => {
        const query = `
            INSERT INTO submission_references_429 (adsh, reference_429, reference_sequence)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                reference_429 = VALUES(reference_429),
                reference_sequence = VALUES(reference_sequence)
        `;
        dbPromises.push(common.runQuery('POC', query, [adsh, reference, index]));
    });
}
```

### submission_group_members

```javascript
// In edgarFeedFileProcessor.mjs - writeSubmissionHeaderRecords()
if (jsonMetaData.group_members && Array.isArray(jsonMetaData.group_members)) {
    jsonMetaData.group_members.forEach((member, index) => {
        const query = `
            INSERT INTO submission_group_members (adsh, group_member, group_member_sequence)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                group_member = VALUES(group_member),
                group_member_sequence = VALUES(group_member_sequence)
        `;
        dbPromises.push(common.runQuery('POC', query, [adsh, member, index]));
    });
}
```

### submission_merger

```javascript
// In edgarFeedFileProcessor.mjs - writeSubmissionHeaderRecords()
if (jsonMetaData.merger && Array.isArray(jsonMetaData.merger)) {
    jsonMetaData.merger.forEach((mergerData, index) => {
        const query = `
            INSERT INTO submission_merger (adsh, merger_sequence, merger_data)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                merger_sequence = VALUES(merger_sequence),
                merger_data = VALUES(merger_data)
        `;
        // Store complex merger data as JSON string
        const mergerJson = JSON.stringify(mergerData);
        dbPromises.push(common.runQuery('POC', query, [adsh, index, mergerJson]));
    });
}
```

### submission_target_data

```javascript
// In edgarFeedFileProcessor.mjs - writeSubmissionHeaderRecords()
if (jsonMetaData.target_data && Array.isArray(jsonMetaData.target_data)) {
    jsonMetaData.target_data.forEach((targetData, index) => {
        const query = `
            INSERT INTO submission_target_data (adsh, target_sequence, target_data)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                target_sequence = VALUES(target_sequence),
                target_data = VALUES(target_data)
        `;
        // Store complex target data as JSON string
        const targetJson = JSON.stringify(targetData);
        dbPromises.push(common.runQuery('POC', query, [adsh, index, targetJson]));
    });
}
```

## SELECT Examples

### submission_references_429

```javascript
// In common.mjs - fetchSubmissionMetadata()
const referencesRows = await runQuery('POC',
    'SELECT reference_429 FROM submission_references_429 WHERE adsh = ? ORDER BY reference_sequence', 
    [adsh]);

if (referencesRows && referencesRows.length > 0) {
    submission.references_429 = referencesRows.map(row => row.reference_429);
}
```

### submission_group_members

```javascript
// In common.mjs - fetchSubmissionMetadata()
const groupMembersRows = await runQuery('POC',
    'SELECT group_member FROM submission_group_members WHERE adsh = ? ORDER BY group_member_sequence', 
    [adsh]);

if (groupMembersRows && groupMembersRows.length > 0) {
    submission.group_members = groupMembersRows.map(row => row.group_member);
}
```

### submission_merger

```javascript
// In common.mjs - fetchSubmissionMetadata()
const mergerRows = await runQuery('POC',
    'SELECT merger_data FROM submission_merger WHERE adsh = ? ORDER BY merger_sequence', 
    [adsh]);

if (mergerRows && mergerRows.length > 0) {
    // Parse JSON strings back into objects
    submission.merger = mergerRows.map(row => JSON.parse(row.merger_data));
}
```

### submission_target_data

```javascript
// In common.mjs - fetchSubmissionMetadata()
const targetRows = await runQuery('POC',
    'SELECT target_data FROM submission_target_data WHERE adsh = ? ORDER BY target_sequence', 
    [adsh]);

if (targetRows && targetRows.length > 0) {
    // Parse JSON strings back into objects
    submission.target_data = targetRows.map(row => JSON.parse(row.target_data));
}
```

## Key Principles

1. **Always pass the array index as the sequence value** during INSERT operations
2. **Always ORDER BY the sequence field** during SELECT operations
3. **Use `ON DUPLICATE KEY UPDATE`** to handle re-processing of the same filing
4. **Store complex objects as JSON strings** in TEXT columns (merger_data, target_data)
5. **Parse JSON strings back to objects** when retrieving from TEXT columns

## Why Sequence Fields Are Necessary

Even though these arrays may have no "natural" sort order (unlike items which are naturally ordered by item_code), we cannot rely on:

- **Auto-increment `pvid`**: Database connection pooling allows multiple async inserts to execute in parallel on different connections, so pvid order doesn't guarantee source array order
- **Insertion timestamp**: Same issue - parallel inserts can complete in different order than they were initiated

The **explicit sequence field** is the only reliable way to preserve the exact order of elements as they appear in the original EDGAR filing JSON.

---

*Last updated*: 2025-10-11

