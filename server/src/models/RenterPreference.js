const mongoose = require("mongoose");

const renterPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    location: {
      city: {
        type: String,
        trim: true,
      },
      districts: {
        type: [String],
        default: [],
      },
      nearMall: {
        type: Boolean,
        default: false,
      },
      nearPark: {
        type: Boolean,
        default: false,
      },
      nearMetro: {
        type: Boolean,
        default: false,
      },
      nearHospital: {
        type: Boolean,
        default: false,
      },
      nearBusStop: {
        type: Boolean,
        default: false,
      },
      cityCenter: {
        type: Boolean,
        default: false,
      },
    },
    budget: {
      min: {
        type: Number,
        min: 0,
        validate: {
          validator(value) {
            return this.budget?.max == null || this.budget.max >= value;
          },
          message: "Budget minimum cannot be greater than budget maximum",
        },
      },
      max: {
        type: Number,
        min: 0,
        validate: {
          validator(value) {
            return (
              value == null ||
              this.budget?.min == null ||
              value >= this.budget.min
            );
          },
          message: "Budget maximum cannot be lower than budget minimum",
        },
      },
      withoutDeposit: {
        type: Boolean,
        default: false,
      },
    },
    propertyDetails: {
      roomCount: {
        type: [Number],
        default: [],
      },
      bathroomCount: {
        type: [Number],
        default: [],
      },
      minArea: {
        type: Number,
        min: 0,
        validate: {
          validator(value) {
            return (
              value == null ||
              this.propertyDetails?.maxArea == null ||
              this.propertyDetails.maxArea >= value
            );
          },
          message: "Minimum area cannot be greater than maximum area",
        },
      },
      maxArea: {
        type: Number,
        min: 0,
        validate: {
          validator(value) {
            return (
              value == null ||
              this.propertyDetails?.minArea == null ||
              value >= this.propertyDetails.minArea
            );
          },
          message: "Maximum area cannot be lower than minimum area",
        },
      },
      firstFloor: {
        type: Boolean,
        default: false,
      },
      lastFloor: {
        type: Boolean,
        default: false,
      },
      furnished: {
        type: Boolean,
        default: false,
      },
      newBuilding: {
        type: Boolean,
        default: false,
      },
      villa: {
        type: Boolean,
        default: false,
      },
      duplex: {
        type: Boolean,
        default: false,
      },
      apartment: {
        type: Boolean,
        default: false,
      },
    },
    lifestyle: {
      smoker: {
        type: Boolean,
        default: false,
      },
      petOwner: {
        type: Boolean,
        default: false,
      },
      nightlifeFriendly: {
        type: Boolean,
        default: false,
      },
      quietLifestyle: {
        type: Boolean,
        default: false,
      },
      studentFriendly: {
        type: Boolean,
        default: false,
      },
      familyFriendly: {
        type: Boolean,
        default: false,
      },
    },
    livingSituation: {
      livingAlone: {
        type: Boolean,
        default: false,
      },
      family: {
        type: Boolean,
        default: false,
      },
      sharedApartment: {
        type: Boolean,
        default: false,
      },
      femaleRoommates: {
        type: Boolean,
        default: false,
      },
      maleRoommates: {
        type: Boolean,
        default: false,
      },
      longTermStay: {
        type: Boolean,
        default: false,
      },
      shortTermStay: {
        type: Boolean,
        default: false,
      },
    },
    features: {
      wifi: {
        type: Boolean,
        default: false,
      },
      balcony: {
        type: Boolean,
        default: false,
      },
      parkingArea: {
        type: Boolean,
        default: false,
      },
      elevator: {
        type: Boolean,
        default: false,
      },
      airConditioner: {
        type: Boolean,
        default: false,
      },
      heatingSystem: {
        type: Boolean,
        default: false,
      },
      washingMachine: {
        type: Boolean,
        default: false,
      },
      dryer: {
        type: Boolean,
        default: false,
      },
      dishwasher: {
        type: Boolean,
        default: false,
      },
      kitchenEquipment: {
        type: Boolean,
        default: false,
      },
      refrigerator: {
        type: Boolean,
        default: false,
      },
      microwave: {
        type: Boolean,
        default: false,
      },
      tv: {
        type: Boolean,
        default: false,
      },
      privateBathroom: {
        type: Boolean,
        default: false,
      },
      securityCameras: {
        type: Boolean,
        default: false,
      },
      gatedBuilding: {
        type: Boolean,
        default: false,
      },
      garden: {
        type: Boolean,
        default: false,
      },
      terrace: {
        type: Boolean,
        default: false,
      },
      storageRoom: {
        type: Boolean,
        default: false,
      },
      swimmingPool: {
        type: Boolean,
        default: false,
      },
      gymAccess: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("RenterPreference", renterPreferenceSchema);
