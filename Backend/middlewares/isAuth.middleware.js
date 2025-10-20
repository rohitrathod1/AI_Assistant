import jwt from 'jsonwebtoken';

const isAuth = (req, res, next) => {
  try {
    // Retrieve token from cookies
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Token not found' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Token' });
    }

    // Attach userId to request object for use in next middleware or controller
    req.userId = decoded.userId;
    next();

  } catch (error) {
    console.error("isAuth Middleware Error:", error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }

    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

export default isAuth;
