const crypto = require('crypto');
const mongoose = require('mongoose');

function createUserId() {
  return `USR-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
}

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: createUserId,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    fullName: {
      type: String,
      trim: true,
      default: null,
    },
    role: {
      type: String,
      trim: true,
      default: 'Administrator',
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'users',
  },
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
