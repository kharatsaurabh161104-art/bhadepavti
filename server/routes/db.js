const express = require('express');
const mongoose = require('mongoose');
const Affidavit = require('../models/Affidavit');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { upsertAffidavit } = require('../services/affidavitService');

const router = express.Router();

router.use(requireAuth);

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [affidavitCount, userCount, latest] = await Promise.all([
      Affidavit.countDocuments(),
      User.countDocuments(),
      Affidavit.findOne().sort({ createdAt: -1 }).select('createdAt').lean(),
    ]);

    return res.json({
      success: true,
      stats: {
        engine: 'mongodb',
        database: mongoose.connection.name,
        affidavits: affidavitCount,
        users: userCount,
        latestRecordAt: latest ? latest.createdAt : null,
      },
    });
  }),
);

router.get(
  '/export',
  asyncHandler(async (_req, res) => {
    const records = await Affidavit.find().sort({ createdAt: -1 });
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      engine: 'mongodb',
      totalRecords: records.length,
      affidavits: records.map((record) => record.toJSON()),
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="bhadepavti_backup_${dateStr}.json"`);
    return res.send(JSON.stringify(backup, null, 2));
  }),
);

router.post(
  '/import',
  asyncHandler(async (req, res) => {
    const records = req.body && req.body.affidavits;
    if (!Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'अवैध बॅकअप फाईल! ("affidavits" array आवश्यक आहे)',
      });
    }

    let imported = 0;
    const errors = [];

    for (const item of records) {
      if (!item || typeof item !== 'object') continue;
      try {
        await upsertAffidavit(item, req.user.sub);
        imported += 1;
      } catch (err) {
        errors.push({ id: item.id || null, message: err.message });
      }
    }

    return res.json({
      success: true,
      importedCount: imported,
      skippedCount: errors.length,
      errors,
      totalNow: await Affidavit.countDocuments(),
    });
  }),
);

module.exports = router;
