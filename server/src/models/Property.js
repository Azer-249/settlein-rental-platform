const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    basicInformation: {
      title: {
        type: String,
        trim: true,
        required: [true, "Property title is required"],
        minlength: 5,
        maxlength: 100,
      },
      description: {
        type: String,
        trim: true,
        required: [true, "Property description is required"],
        maxlength: 3000,
      },
    },
    location: {
      city: {
        type: String,
        trim: true,
        required: [true, "City is required"],
      },
      district: {
        type: String,
        trim: true,
        required: [true, "District is required"],
      },
      address: {
        type: String,
        trim: true,
        required: [true, "Address is required"],
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
    pricing: {
      monthlyRent: {
        type: Number,
        required: [true, "Monthly rent is required"],
        min: 0,
      },
      depositRequired: {
        type: Boolean,
        default: false,
      },
      depositAmount: {
        type: Number,
        default: 0,
        min: 0,
      },
      currency: {
        type: String,
        enum: ["GEL"],
        default: "GEL",
      },
    },
    propertyDetails: {
      propertyType: {
        type: String,
        enum: ["apartment", "villa", "duplex"],
        required: [true, "Property type is required"],
      },
      roomCount: {
        type: Number,
        required: [true, "Room count is required"],
        min: 0,
      },
      bathroomCount: {
        type: Number,
        required: [true, "Bathroom count is required"],
        min: 0,
      },
      area: {
        type: Number,
        required: [true, "Property area is required"],
        min: 1,
      },
      floor: {
        type: Number,
        min: 0,
      },
      totalFloors: {
        type: Number,
        min: 1,
      },
      furnished: {
        type: Boolean,
        default: false,
      },
      newBuilding: {
        type: Boolean,
        default: false,
      },
    },
    tenantRules: {
      acceptsStudents: {
        type: Boolean,
        default: false,
      },
      acceptsFamilies: {
        type: Boolean,
        default: false,
      },
      acceptsPets: {
        type: Boolean,
        default: false,
      },
      allowsSmoking: {
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
      allowsShortTerm: {
        type: Boolean,
        default: false,
      },
      allowsLongTerm: {
        type: Boolean,
        default: false,
      },
    },
    livingSituation: {
      rentalType: {
        type: String,
        enum: ["entire-property", "shared-apartment"],
        required: [true, "Rental type is required"],
      },
      roommatePreference: {
        type: String,
        enum: ["any", "male", "female"],
        default: "any",
      },
    },
    features: {
      wifi: { type: Boolean, default: false },
      balcony: { type: Boolean, default: false },
      parkingArea: { type: Boolean, default: false },
      elevator: { type: Boolean, default: false },
      airConditioner: { type: Boolean, default: false },
      heatingSystem: { type: Boolean, default: false },
      washingMachine: { type: Boolean, default: false },
      dryer: { type: Boolean, default: false },
      dishwasher: { type: Boolean, default: false },
      kitchenEquipment: { type: Boolean, default: false },
      refrigerator: { type: Boolean, default: false },
      microwave: { type: Boolean, default: false },
      tv: { type: Boolean, default: false },
      privateBathroom: { type: Boolean, default: false },
      securityCameras: { type: Boolean, default: false },
      gatedBuilding: { type: Boolean, default: false },
      garden: { type: Boolean, default: false },
      terrace: { type: Boolean, default: false },
      storageRoom: { type: Boolean, default: false },
      swimmingPool: { type: Boolean, default: false },
      gymAccess: { type: Boolean, default: false },
    },
    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
            trim: true,
          },
          publicId: {
            type: String,
            required: true,
            trim: true,
          },
          width: {
            type: Number,
            required: true,
          },
          height: {
            type: Number,
            required: true,
          },
          format: {
            type: String,
            required: true,
            trim: true,
          },
          bytes: {
            type: Number,
            required: true,
          },
          isCover: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [],
    },
    videoTour: {
      url: {
        type: String,
        trim: true,
        default: "",
      },
      publicId: {
        type: String,
        trim: true,
        default: "",
      },
      format: {
        type: String,
        trim: true,
        default: "",
      },
      bytes: {
        type: Number,
        default: 0,
      },
      duration: {
        type: Number,
        default: 0,
      },
    },
    propertyDocuments: {
      type: [
        {
          url: {
            type: String,
            required: true,
            trim: true,
          },
          publicId: {
            type: String,
            required: true,
            trim: true,
          },
          resourceType: {
            type: String,
            enum: ["image", "raw"],
            required: true,
          },
          format: {
            type: String,
            required: true,
            trim: true,
          },
          bytes: {
            type: Number,
            required: true,
          },
          originalName: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      default: [],
    },
    availabilityStatus: {
      type: String,
      enum: ["available", "unavailable", "rented"],
      default: "available",
    },
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

propertySchema.index({
  moderationStatus: 1,
  availabilityStatus: 1,
  "location.city": 1,
  "location.district": 1,
  "pricing.monthlyRent": 1,
  createdAt: -1,
});

module.exports = mongoose.model("Property", propertySchema);
