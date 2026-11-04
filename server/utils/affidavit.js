const STRING_FIELDS = [
  'tenantName',
  'tenantFatherName',
  'tenantAge',
  'tenantOccupation',
  'tenantAadhaar',
  'tenantAddress',
  'tenantCollege',
  'tenantCourse',
  'ownerName',
  'ownerAge',
  'ownerOccupation',
  'ownerMobile',
  'ownerAddress',
  'academicYear',
  'propertyAddress',
  'propertyCity',
  'surveyNo',
  'roomNo',
  'propertyArea',
  'propertyConstruction',
  'monthlyRent',
  'rentInWords',
  'rentPaymentDay',
  'rentDurationMonths',
  'executionPlace',
];

const DATE_FIELDS = ['rentStartDate', 'rentEndDate', 'agreementDate'];

function parseDateOnly(value) {
  if (value === undefined || value === null || value === '') return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildAffidavitData(body = {}) {
  const data = {};

  for (const field of STRING_FIELDS) {
    if (body[field] !== undefined && body[field] !== null) {
      data[field] = String(body[field]).trim();
    }
  }

  for (const field of DATE_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = parseDateOnly(body[field]);
    }
  }

  if (body.includeSwadhar !== undefined) {
    data.includeSwadhar = Boolean(body.includeSwadhar);
  }

  // Intentionally ignore applicantPhoto and any unknown fields.
  return data;
}

function validateAffidavitData(data) {
  if (!data.tenantName) return 'tenantName (विद्यार्थ्याचे नाव) is required';
  if (!data.ownerName) return 'ownerName (घरमालकाचे नाव) is required';
  return null;
}

function normalizeRecordId(value) {
  if (typeof value !== 'string') return '';
  const id = value.trim();
  if (!id || id.length > 100) return '';
  return id;
}

module.exports = {
  STRING_FIELDS,
  DATE_FIELDS,
  parseDateOnly,
  buildAffidavitData,
  validateAffidavitData,
  normalizeRecordId,
};
