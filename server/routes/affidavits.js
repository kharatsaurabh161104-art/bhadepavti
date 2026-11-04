const express = require('express');
const Affidavit = require('../models/Affidavit');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { buildAffidavitData, validateAffidavitData } = require('../utils/affidavit');
const { upsertAffidavit, buildFilter } = require('../services/affidavitService');

const router = express.Router();

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = buildFilter({
      q: req.query.q || '',
      from: req.query.from || '',
      to: req.query.to || '',
    });

    const records = await Affidavit.find(filter).sort({ createdAt: -1 }).limit(1000);

    return res.json({
      success: true,
      count: records.length,
      records: records.map((record) => record.toJSON()),
    });
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    try {
      const { record, created } = await upsertAffidavit(req.body || {}, req.user.sub);
      return res.status(created ? 201 : 200).json({ success: true, record: record.toJSON() });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'A record with this id already exists' });
      }
      throw err;
    }
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const record = await Affidavit.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'भाडे करारनामा सापडला नाही (Record not found)' });
    }
    return res.json({ success: true, record: record.toJSON() });
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const record = await Affidavit.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'भाडे करारनामा सापडला नाही (Record not found)' });
    }

    record.set(buildAffidavitData(req.body || {}));
    const validation = validateAffidavitData(record.toObject());
    if (validation) {
      return res.status(400).json({ success: false, message: validation });
    }

    await record.save();
    return res.json({ success: true, record: record.toJSON() });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const deleted = await Affidavit.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'भाडे करारनामा सापडला नाही (Record not found)' });
    }
    return res.json({ success: true, message: 'हटवले गेले (Record deleted)' });
  }),
);

module.exports = router;
