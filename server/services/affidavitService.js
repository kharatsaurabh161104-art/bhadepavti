const Affidavit = require('../models/Affidavit');
const {
  buildAffidavitData,
  validateAffidavitData,
  normalizeRecordId,
  parseDateOnly,
} = require('../utils/affidavit');

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function upsertAffidavit(body = {}, createdBy = null) {
  const data = buildAffidavitData(body);
  const requestedId = normalizeRecordId(body.id);

  if (requestedId) {
    const existing = await Affidavit.findById(requestedId);
    if (existing) {
      existing.set(data);
      const validation = validateAffidavitData(existing.toObject());
      if (validation) throw httpError(400, validation);
      await existing.save();
      return { record: existing, created: false };
    }

    const validation = validateAffidavitData(data);
    if (validation) throw httpError(400, validation);

    const record = await Affidavit.create({
      _id: requestedId,
      ...data,
      createdBy,
    });
    return { record, created: true };
  }

  const validation = validateAffidavitData(data);
  if (validation) throw httpError(400, validation);

  const record = await Affidavit.create({
    ...data,
    createdBy,
  });
  return { record, created: true };
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildFilter({ q = '', from = '', to = '' } = {}) {
  const filter = {};

  const query = String(q).trim().slice(0, 100);
  if (query) {
    const regex = new RegExp(escapeRegex(query), 'i');
    filter.$or = [
      { tenantName: regex },
      { ownerName: regex },
      { tenantCollege: regex },
      { ownerMobile: regex },
    ];
  }

  const fromDate = parseDateOnly(from);
  const toDate = parseDateOnly(to);
  if (fromDate || toDate) {
    filter.agreementDate = {};
    if (fromDate) filter.agreementDate.$gte = fromDate;
    if (toDate) filter.agreementDate.$lte = toDate;
  }

  return filter;
}

module.exports = { upsertAffidavit, buildFilter, httpError };
