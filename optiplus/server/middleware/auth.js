// server/middleware/auth.js
const validateAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
  }

  try {
      const [username, department] = Buffer.from(authHeader.split(' ')[1], 'base64')
          .toString()
          .split(':');

      req.user = { username, department };
      next();
  } catch (error) {
      res.status(401).json({ message: 'Invalid authentication token' });
  }
};

export { validateAuth };