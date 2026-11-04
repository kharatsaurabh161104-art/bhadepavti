const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;

  if (!stored.includes(':')) {
    return stored === password;
  }

  const [salt, hash] = stored.split(':');
  const candidate = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  const hashBuffer = Buffer.from(hash, 'hex');
  const candidateBuffer = Buffer.from(candidate, 'hex');

  if (hashBuffer.length !== candidateBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, candidateBuffer);
}

module.exports = { hashPassword, verifyPassword };
