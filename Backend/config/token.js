import jwt from "jsonwebtoken";

export const genToken = (userId) => {
  try {
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token valid for 7 days
    );
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    return null;
  }
};

export default genToken;
