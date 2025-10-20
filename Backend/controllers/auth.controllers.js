import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../config/token.js";

export const Signup = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    // Validate input
    if (!userName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      userName,
      email,
      password: hashedPassword
    });

    // Generate JWT token
    const token = genToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,  // ❗ Change to true in production with HTTPS
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ success: false, message: 'Signup Internal server error' });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and Password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate token
    const token = genToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,  // ❗ Change to true in production with HTTPS
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: 'Login Internal server error' });
  }
};

export const Logout = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true, // ❗ Change to true in production
      sameSite: 'None',
    });

    return res.status(200).json({ success: true, message: 'Logout successful' });

  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ success: false, message: 'Logout Internal server error' });
  }
};
