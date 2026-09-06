const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
// Body: { name, email, password, studentId, role? }
const registerUser = async (req, res) => {
  try {
    const { name, email, password, studentId, role } = req.body;

    if (!name || !email || !password || !studentId) {
      return res.status(400).json({
        message: 'name, email, password, and studentId are all required',
      });
    }

    const existing = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existing) {
      return res.status(409).json({ message: 'Email or studentId already registered' });
    }

    // role defaults to 'student' in the schema if not provided.
    // NOTE: for a real deployment, 'admin' and 'organizer' shouldn't be
    // self-assignable here — an admin should promote users after signup.
    const user = await User.create({ name, email, password, studentId, role });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });
  } catch (error) {
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
};

// POST /api/auth/login
// Body: { email, password }
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    // .select('+password') because the schema hides it by default
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });
  } catch (error) {
    res.status(400).json({ message: 'Login failed', error: error.message });
  }
};

module.exports = { registerUser, loginUser };