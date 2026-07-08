const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const roleOnboardingFlags = {
  owner: "ownerOnboardingCompleted",
  renter: "renterOnboardingCompleted",
};

const buildUserPayload = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  renterOnboardingCompleted: user.renterOnboardingCompleted,
  ownerOnboardingCompleted: user.ownerOnboardingCompleted,
  profilePicture: user.profilePicture,
  isEmailVerified: user.isEmailVerified,
});

const buildAuthResponse = (user) => ({
  user: buildUserPayload(user),
  token: generateToken(user._id),
});

const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const user = await User.create({
      fullName,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: buildAuthResponse(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.json({
      success: true,
      message: "Logged in successfully",
      data: buildAuthResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
};

const updateMyRole = async (req, res) => {
  try {
    const role = typeof req.body.role === "string" ? req.body.role.trim() : "";

    if (!["renter", "owner"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either renter or owner",
      });
    }

    const onboardingFlag = roleOnboardingFlags[role];
    const onboardingCompleted = Boolean(req.user[onboardingFlag]);
    const currentOnboardingFlag = roleOnboardingFlags[req.user.role];
    const currentRoleIsOnboarded =
      !currentOnboardingFlag || Boolean(req.user[currentOnboardingFlag]);

    if (!onboardingCompleted) {
      if (
        req.user.role === null ||
        req.user.role === role ||
        !currentRoleIsOnboarded
      ) {
        req.user.role = role;
        await req.user.save();

        return res.json({
          success: true,
          message: `Complete the ${role} survey before accessing ${role} features`,
          data: {
            user: buildUserPayload(req.user),
            onboardingRequired: true,
            onboardingRole: role,
          },
        });
      }

      return res.status(409).json({
        success: false,
        message: `Complete the ${role} survey before switching to ${role}`,
        data: {
          currentRole: req.user.role,
          onboardingRequired: true,
          onboardingRole: role,
        },
      });
    }

    req.user.role = role;
    await req.user.save();

    res.json({
      success: true,
      message: "Role updated successfully",
      data: {
        user: buildUserPayload(req.user),
        onboardingRequired: false,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMyRole,
};
