const jwt = require("jsonwebtoken");
const User = require("../models/User");

const roleOnboardingRequirements = {
  owner: "ownerOnboardingCompleted",
  renter: "renterOnboardingCompleted",
};

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user no longer exists",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this route",
      });
    }

    const onboardingFlag = roleOnboardingRequirements[req.user.role];

    if (onboardingFlag && !req.user[onboardingFlag]) {
      return res.status(403).json({
        success: false,
        message: `Complete the ${req.user.role} survey before accessing this route`,
        data: {
          onboardingRequired: true,
          onboardingRole: req.user.role,
        },
      });
    }

    next();
  };
};

module.exports = {
  protect,
  requireRole,
};
