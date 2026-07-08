const OwnerProfile = require("../models/OwnerProfile");
const User = require("../models/User");

const createOwnerProfile = async (req, res) => {
  try {
    const { phoneNumber, whatsappNumber, languages, preferredContactMethods } =
      req.body;

    const existingOwner = await OwnerProfile.findOne({ user: req.user._id });

    if (existingOwner) {
      if (!req.user.ownerOnboardingCompleted || req.user.role !== "owner") {
        const updatedUser = await User.findByIdAndUpdate(
          req.user._id,
          {
            role: "owner",
            ownerOnboardingCompleted: true,
          },
          { runValidators: true, returnDocument: "after" }
        );

        return res.status(200).json({
          success: true,
          message: "Owner profile already exists; owner role activated",
          data: {
            profile: existingOwner,
            user: {
              role: updatedUser.role,
              renterOnboardingCompleted:
                updatedUser.renterOnboardingCompleted,
              ownerOnboardingCompleted: updatedUser.ownerOnboardingCompleted,
            },
          },
        });
      }

      return res.status(409).json({
        success: false,
        message: "Owner profile already exists for this user",
      });
    }

    const profile = await OwnerProfile.create({
      user: req.user._id,
      phoneNumber,
      whatsappNumber,
      languages,
      preferredContactMethods,
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        role: "owner",
        ownerOnboardingCompleted: true,
      },
      { runValidators: true, returnDocument: "after" }
    );

    res.status(201).json({
      success: true,
      message: "Owner profile created successfully",
      data: {
        profile,
        user: {
          role: updatedUser.role,
          renterOnboardingCompleted: updatedUser.renterOnboardingCompleted,
          ownerOnboardingCompleted: updatedUser.ownerOnboardingCompleted,
        },
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Owner profile already exists for this user",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
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

const getMyOwnerProfile = async (req, res) => {
  try {
    const profile = await OwnerProfile.findOne({
      user: req.user._id,
    }).populate("user", "fullName email");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Owner profile not found",
      });
    }

    res.json({
      success: true,
      data: {
        profile,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
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

const updateMyOwnerProfile = async (req, res) => {
  try {
    const { phoneNumber, whatsappNumber, languages, preferredContactMethods } =
      req.body;

    const profile = await OwnerProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        phoneNumber,
        whatsappNumber,
        languages,
        preferredContactMethods,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).populate("user", "fullName email");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Owner profile not found",
      });
    }

    res.json({
      success: true,
      message: "Owner profile updated successfully",
      data: {
        profile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOwnerProfile,
  getMyOwnerProfile,
  updateMyOwnerProfile,
};
