import jwt from 'jsonwebtoken';

/**
 * verifyToken
 * Reads Authorization: Bearer <token>, verifies with JWT_SECRET,
 * and attaches the decoded payload to req.user.
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, username, roleId, roleName, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired' });
    }
    return res.status(401).json({ message: 'Invalid access token' });
  }
};

/**
 * requireRole(roles)
 * Factory that returns middleware allowing only users whose roleName
 * is in the provided array.
 *
 * Usage:
 *   router.get('/admin-only', verifyToken, requireRole(['Admin']), handler);
 *   router.get('/staff-or-admin', verifyToken, requireRole(['Admin','Staff']), handler);
 */
export const requireRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!roles.includes(req.user.roleName)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  next();
};
