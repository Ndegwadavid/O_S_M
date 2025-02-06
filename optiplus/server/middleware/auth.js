const logger = require('../utils/logger');

const VALID_CREDENTIALS = {
  reception: {
    username: 'optiplus',
    password: 'optiplusMoiAvenue'
  },
  examination: {
    username: 'optiplus',
    password: 'optiplusMoiAvenue'
  },
  admin: {
    username: 'admin',
    password: 'adminMoiAvenue'
  }
};

const validateAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  try {
    // Basic validation for local network
    const [username, department] = Buffer.from(authHeader.split(' ')[1], 'base64')
      .toString()
      .split(':');

    // Check if credentials are valid
    const deptCreds = VALID_CREDENTIALS[department];
    if (!deptCreds || deptCreds.username !== username) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Add user info to request
    req.user = { username, department };
    next();
  } catch (error) {
    logger.error('Auth Error:', error);
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

// Department-specific middleware
const checkDepartment = (allowedDepartments) => (req, res, next) => {
  if (!allowedDepartments.includes(req.user.department)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

module.exports = {
  validateAuth,
  checkDepartment
};