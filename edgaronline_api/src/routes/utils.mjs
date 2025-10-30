import express from 'express';

const router = express.Router();

// Get transaction codes
router.get('/transaction-codes', async (req, res) => {
  res.json([
    { code: 'A', description: 'Award' },
    { code: 'D', description: 'Disposition' },
    { code: 'G', description: 'Gift' },
    { code: 'M', description: 'Exercise or conversion' },
    { code: 'P', description: 'Purchase' },
    { code: 'S', description: 'Sale' },
  ]);
});

// Get state codes
router.get('/state-codes', async (req, res) => {
  res.json([
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    // ... more states
  ]);
});

// Get form template
router.get('/form-templates/:type', async (req, res) => {
  res.json({ formType: req.params.type, template: {} });
});

export default router;
