const crypto = require('crypto');
const mongoose = require('mongoose');

function createAffidavitId() {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `AFF-${timePart}${randomPart}`;
}

const affidavitSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: createAffidavitId,
    },

    // Tenant / student
    tenantName: { type: String, required: true, trim: true },
    tenantFatherName: { type: String, trim: true, default: '' },
    tenantAge: { type: String, trim: true, default: '' },
    tenantOccupation: { type: String, trim: true, default: '' },
    tenantAadhaar: { type: String, trim: true, default: '' },
    tenantAddress: { type: String, trim: true, default: '' },
    tenantCollege: { type: String, trim: true, default: '' },
    tenantCourse: { type: String, trim: true, default: '' },

    // Owner / landlord
    ownerName: { type: String, required: true, trim: true },
    ownerAge: { type: String, trim: true, default: '' },
    ownerOccupation: { type: String, trim: true, default: '' },
    ownerMobile: { type: String, trim: true, default: '' },
    ownerAddress: { type: String, trim: true, default: '' },

    // Academic / property
    academicYear: { type: String, trim: true, default: '' },
    propertyAddress: { type: String, trim: true, default: '' },
    propertyCity: { type: String, trim: true, default: '' },
    surveyNo: { type: String, trim: true, default: '' },
    roomNo: { type: String, trim: true, default: '' },
    propertyArea: { type: String, trim: true, default: '' },
    propertyConstruction: { type: String, trim: true, default: '' },

    // Rent agreement
    monthlyRent: { type: String, trim: true, default: '' },
    rentInWords: { type: String, trim: true, default: '' },
    rentPaymentDay: { type: String, trim: true, default: '' },
    rentStartDate: { type: Date, default: null },
    rentEndDate: { type: Date, default: null },
    rentDurationMonths: { type: String, trim: true, default: '' },
    agreementDate: { type: Date, default: null },
    executionPlace: { type: String, trim: true, default: '' },

    // Optional Swadhar pages
    includeSwadhar: { type: Boolean, default: false },

    // Metadata
    createdBy: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'affidavits',
  },
);

affidavitSchema.index({ tenantName: 1 });
affidavitSchema.index({ ownerName: 1 });
affidavitSchema.index({ agreementDate: -1 });
affidavitSchema.index({ createdAt: -1 });
affidavitSchema.index({ createdBy: 1 });

function toDateOnly(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

affidavitSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;

    ret.rentStartDate = toDateOnly(ret.rentStartDate);
    ret.rentEndDate = toDateOnly(ret.rentEndDate);
    ret.agreementDate = toDateOnly(ret.agreementDate);

    if (ret.createdAt) ret.createdAt = new Date(ret.createdAt).toISOString();
    if (ret.updatedAt) ret.updatedAt = new Date(ret.updatedAt).toISOString();

    return ret;
  },
});

module.exports = mongoose.model('Affidavit', affidavitSchema);
