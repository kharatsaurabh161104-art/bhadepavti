const jwt = require('jsonwebtoken');

function getSecret() {
  return process.env.JWT_SECRET || 'onpoint-dev-secret-change-me';
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id,
      username: user.username,
      role: user.role,
    },
    getSecret(),
    { expiresIn: '7d' },
  );
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(header.slice(7).trim(), getSecret());
    return next();
  } catch (_err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || String(req.user.role).toLowerCase() !== 'administrator') {
    return res.status(403).json({ success: false, message: 'Administrator access required' });
  }
  return next();
}

module.exports = { signToken, requireAuth, requireAdmin };
