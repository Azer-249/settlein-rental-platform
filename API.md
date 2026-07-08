
# SettleIn API Documentation

Base URL:

```text
http://127.0.0.1:5000
```

Authenticated requests must send the JWT token in the `Authorization` header:

```text
Authorization: Bearer JWT_TOKEN
```

### Existing Database Migration

After deploying the per-role onboarding fields, run this once from the `server` directory:

```text
npm run migrate:onboarding-flags
```

The migration preserves completed onboarding from the legacy `onboardingCompleted` field and from existing renter preference / owner profile documents, then removes the legacy field. It is safe to run more than once.

## Authentication

### Register User

```text
POST /api/auth/register
```

Auth required: No

Request body:

```json
{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

Notes:
- New users start with `role: null`, `renterOnboardingCompleted: false`, and `ownerOnboardingCompleted: false`.
- The user selects `renter` or `owner` after registration.
- Roles cannot be assigned through public registration.

Success response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "USER_ID",
      "fullName": "Test User",
      "email": "test@example.com",
      "role": null,
      "renterOnboardingCompleted": false,
      "ownerOnboardingCompleted": false,
      "profilePicture": "",
      "isEmailVerified": false
    },
    "token": "JWT_TOKEN"
  }
}
```

Possible errors:
- `400` - Missing required fields
- `403` - Tried to register as moderator
- `409` - Email already exists

### Login User

```text
POST /api/auth/login
```

Auth required: No

Request body:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Success response:

```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "USER_ID",
      "fullName": "Test User",
      "email": "test@example.com",
      "role": "renter",
      "renterOnboardingCompleted": true,
      "ownerOnboardingCompleted": false,
      "profilePicture": "",
      "isEmailVerified": false
    },
    "token": "JWT_TOKEN"
  }
}
```

Possible errors:
- `400` - Missing email or password
- `401` - Invalid email or password

### Get Current User

```text
GET /api/auth/me
```

Auth required: Yes

Success response:

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "USER_ID",
      "fullName": "Test User",
      "email": "test@example.com",
      "role": "renter",
      "renterOnboardingCompleted": true,
      "ownerOnboardingCompleted": false,
      "profilePicture": "",
      "isEmailVerified": false,
      "createdAt": "2026-06-19T04:52:05.491Z",
      "updatedAt": "2026-06-19T04:52:05.491Z"
    }
  }
}
```

Possible errors:
- `401` - Missing token
- `401` - Invalid or expired token

### Select or Switch Active Role

```text
PATCH /api/auth/me/role
```

Auth required: Yes

Request body:

```json
{
  "role": "renter"
}
```

Notes:
- `role` must be `renter` or `owner`.
- `moderator` cannot be selected through this endpoint.
- `role` is the user's currently active mode.
- First-time users can select an initial role before completing that role's survey.
- Existing users can switch to a role only after completing that role's survey.
- A renter needs onboarding when `renterOnboardingCompleted` is `false`.
- An owner needs onboarding when `ownerOnboardingCompleted` is `false`.
- Submitting renter preferences activates the renter role and sets `renterOnboardingCompleted` to `true`.
- Submitting an owner profile activates the owner role and sets `ownerOnboardingCompleted` to `true`.

Success response:

```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "user": {
      "id": "USER_ID",
      "fullName": "Test User",
      "email": "test@example.com",
      "role": "owner",
      "renterOnboardingCompleted": true,
      "ownerOnboardingCompleted": false,
      "profilePicture": "",
      "isEmailVerified": false
    }
  }
}
```

Onboarding-required response for a first-time role selection:

```json
{
  "success": true,
  "message": "Complete the renter survey before accessing renter features",
  "data": {
    "user": {
      "id": "USER_ID",
      "role": "renter",
      "renterOnboardingCompleted": false,
      "ownerOnboardingCompleted": false
    },
    "onboardingRequired": true,
    "onboardingRole": "renter"
  }
}
```

Possible errors:
- `400` - Invalid role
- `401` - Missing or invalid token
- `409` - Target role survey is required before switching from the current active role

## Renter Preferences

### Create Renter Preferences

```text
POST /api/renter-preferences
```

Auth required: Yes

Request body:

```json
{
  "location": {
    "city": "Tbilisi",
    "districts": ["Saburtalo", "Vake"],
    "nearMetro": true,
    "nearBusStop": true,
    "nearMall": false,
    "nearPark": true,
    "nearHospital": false,
    "cityCenter": false
  },
  "budget": {
    "min": 500,
    "max": 1200,
    "withoutDeposit": false
  },
  "propertyDetails": {
    "roomCount": [1, 2, 3],
    "bathroomCount": [1, 2],
    "minArea": 40,
    "maxArea": 90,
    "furnished": true,
    "apartment": true
  },
  "lifestyle": {
    "petOwner": true,
    "quietLifestyle": true,
    "studentFriendly": true
  },
  "livingSituation": {
    "livingAlone": true,
    "longTermStay": true
  },
  "features": {
    "wifi": true,
    "balcony": true,
    "elevator": true,
    "heatingSystem": true,
    "washingMachine": true
  }
}
```

Notes:
- Boolean fields default to `false`.
- Any authenticated user can submit renter preferences as the renter survey.
- Successful creation automatically sets `role` to `renter` and `renterOnboardingCompleted` to `true` without changing the owner flag.
- Budget values are treated as Georgian lari (`GEL`) for now.
- `budget.max` cannot be lower than `budget.min`.
- `propertyDetails.maxArea` cannot be lower than `propertyDetails.minArea`.
- `withoutDeposit: true` means the renter specifically wants properties without a deposit.
- `withoutDeposit: false` means deposit does not matter.
- `sharedApartment: true` without `maleRoommates` or `femaleRoommates` means any/mixed roommates.
- `roomCount` and `bathroomCount` must be arrays because renters can choose multiple acceptable counts.
- Each user can only have one renter preferences document.

Success response:

```json
{
  "success": true,
  "message": "Renter preferences created successfully",
  "data": {
    "preferences": {
      "_id": "PREFERENCES_ID",
      "user": "USER_ID",
      "location": {},
      "budget": {},
      "propertyDetails": {},
      "lifestyle": {},
      "livingSituation": {},
      "features": {},
      "createdAt": "2026-06-19T04:52:05.491Z",
      "updatedAt": "2026-06-19T04:52:05.491Z"
    },
    "user": {
      "role": "renter",
      "renterOnboardingCompleted": true,
      "ownerOnboardingCompleted": false
    }
  }
}
```

Possible errors:
- `400` - Invalid preference data
- `401` - Missing or invalid token
- `409` - Renter preferences already exist for this user

### Get My Renter Preferences

```text
GET /api/renter-preferences/me
```

Auth required: Yes

Success response:

```json
{
  "success": true,
  "data": {
    "preferences": {
      "_id": "PREFERENCES_ID",
      "user": "USER_ID",
      "location": {},
      "budget": {},
      "propertyDetails": {},
      "lifestyle": {},
      "livingSituation": {},
      "features": {},
      "createdAt": "2026-06-19T04:52:05.491Z",
      "updatedAt": "2026-06-19T04:52:05.491Z"
    }
  }
}
```

Possible errors:
- `400` - Invalid preference data
- `401` - Missing or invalid token
- `404` - Renter preferences not found

### Update My Renter Preferences

```text
PUT /api/renter-preferences/me
```

Auth required: Yes

Request body:

Send the same shape as create. Partial updates are supported.
Only the documented preference fields can be updated. The `user` ownership field
is controlled by the backend and cannot be changed through this endpoint.

Example:

```json
{
  "budget": {
    "min": 700,
    "max": 1500,
    "withoutDeposit": true
  },
  "features": {
    "wifi": true,
    "balcony": true,
    "parkingArea": true,
    "elevator": true
  }
}
```

Success response:

```json
{
  "success": true,
  "message": "Renter preferences updated successfully",
  "data": {
    "preferences": {
      "_id": "PREFERENCES_ID",
      "user": "USER_ID",
      "budget": {},
      "features": {},
      "createdAt": "2026-06-19T04:52:05.491Z",
      "updatedAt": "2026-06-19T05:10:12.100Z"
    }
  }
}
```

Possible errors:
- `401` - Missing or invalid token
- `404` - Renter preferences not found

## Owner Profile

### Create Owner Profile

```text
POST /api/owner-profile
```

Auth required: Yes

Request body:

```json
{
  "phoneNumber": "+995555123456",
  "whatsappNumber": "+995555123456",
  "languages": ["English", "Georgian"],
  "preferredContactMethods": ["phone", "whatsapp", "email"]
}
```

Notes:
- Owner profile stores account-level contact information only.
- Any authenticated user can submit an owner profile as the owner survey.
- Successful creation automatically sets `role` to `owner` and `ownerOnboardingCompleted` to `true` without changing the renter flag.
- Email is not stored directly in the owner profile.
- Owner email comes from the linked `User` account email.
- `preferredContactMethods` can include `phone`, `whatsapp`, and `email`.
- Owners can choose one method, multiple methods, or leave the array empty.
- Property-specific rules such as pets, smoking, students, families, short-term stays, and long-term stays belong to the `Property` model.
- Each user can only have one owner profile.

Success response:

```json
{
  "success": true,
  "message": "Owner profile created successfully",
  "data": {
    "profile": {
      "_id": "OWNER_PROFILE_ID",
      "user": "USER_ID",
      "phoneNumber": "+995555123456",
      "whatsappNumber": "+995555123456",
      "languages": ["English", "Georgian"],
      "preferredContactMethods": ["phone", "whatsapp", "email"],
      "createdAt": "2026-06-19T04:52:05.491Z",
      "updatedAt": "2026-06-19T04:52:05.491Z"
    },
    "user": {
      "role": "owner",
      "renterOnboardingCompleted": true,
      "ownerOnboardingCompleted": true
    }
  }
}
```

Possible errors:
- `400` - Invalid owner profile data
- `401` - Missing or invalid token
- `409` - Owner profile already exists for this user

### Get My Owner Profile

```text
GET /api/owner-profile/me
```

Auth required: Yes

Success response:

```json
{
  "success": true,
  "data": {
    "profile": {
      "_id": "OWNER_PROFILE_ID",
      "user": {
        "_id": "USER_ID",
        "fullName": "Test User",
        "email": "test@example.com"
      },
      "phoneNumber": "+995555123456",
      "whatsappNumber": "+995555123456",
      "languages": ["English", "Georgian"],
      "preferredContactMethods": ["phone", "whatsapp", "email"],
      "createdAt": "2026-06-19T04:52:05.491Z",
      "updatedAt": "2026-06-19T04:52:05.491Z"
    }
  }
}
```

Possible errors:
- `401` - Missing or invalid token
- `404` - Owner profile not found

### Update My Owner Profile

```text
PUT /api/owner-profile/me
```

Auth required: Yes

Request body:

```json
{
  "phoneNumber": "+995555999999",
  "whatsappNumber": "+995555888888",
  "languages": ["English", "Georgian", "Turkish"],
  "preferredContactMethods": ["whatsapp", "email"]
}
```

Notes:
- Updating with the same values again is valid and should still return `200 OK`.
- Only owner profile contact fields should be updated here.

Success response:

```json
{
  "success": true,
  "message": "Owner profile updated successfully",
  "data": {
    "profile": {
      "_id": "OWNER_PROFILE_ID",
      "user": {
        "_id": "USER_ID",
        "fullName": "Test User",
        "email": "test@example.com"
      },
      "phoneNumber": "+995555999999",
      "whatsappNumber": "+995555888888",
      "languages": ["English", "Georgian", "Turkish"],
      "preferredContactMethods": ["whatsapp", "email"],
      "createdAt": "2026-06-19T04:52:05.491Z",
      "updatedAt": "2026-06-19T05:10:12.100Z"
    }
  }
}
```

Possible errors:
- `401` - Missing or invalid token
- `404` - Owner profile not found

## Properties

### Property Rules and Values

- Only authenticated users with the `owner` role can create, update, delete, or list their own properties.
- An owner profile must exist before the owner can create a property.
- New and content-edited properties receive `moderationStatus: "pending"`.
- Owners cannot assign themselves, approve properties, or set rejection reasons through property requests.
- Public property lists only include properties with `moderationStatus: "approved"` and `availabilityStatus: "available"`.
- Public property details only include approved and available properties.
- Public property list and detail responses do not include private property verification documents.
- `propertyType` can be `apartment`, `villa`, or `duplex`.
- `rentalType` can be `entire-property` or `shared-apartment`.
- `roommatePreference` can be `any`, `male`, or `female`. It defaults to `any`.
- `currency` is `GEL` only for now. It defaults to `GEL`.
- `availabilityStatus` can be `available`, `unavailable`, or `rented`.
- `moderationStatus` can be `pending`, `approved`, or `rejected`.
- Optional Boolean fields default to `false`.

### Create Property

```text
POST /api/properties
```

Auth required: Yes

Required role: `owner`

Body type: `form-data`

Form-data fields:

```text
propertyData
images
documents
video
```

`propertyData` must be a JSON string containing the property fields:

```json
{
  "basicInformation": {
    "title": "Modern apartment in Saburtalo",
    "description": "Furnished apartment located near the metro."
  },
  "location": {
    "city": "Tbilisi",
    "district": "Saburtalo",
    "address": "Test Address 10",
    "nearMall": false,
    "nearPark": true,
    "nearMetro": true,
    "nearHospital": false,
    "nearBusStop": true,
    "cityCenter": false
  },
  "pricing": {
    "monthlyRent": 1200,
    "depositRequired": true,
    "depositAmount": 1200,
    "currency": "GEL"
  },
  "propertyDetails": {
    "propertyType": "apartment",
    "roomCount": 2,
    "bathroomCount": 1,
    "area": 70,
    "floor": 4,
    "totalFloors": 10,
    "furnished": true,
    "newBuilding": true
  },
  "tenantRules": {
    "acceptsStudents": true,
    "acceptsFamilies": true,
    "acceptsPets": true,
    "allowsSmoking": false,
    "nightlifeFriendly": false,
    "quietLifestyle": true,
    "allowsShortTerm": false,
    "allowsLongTerm": true
  },
  "livingSituation": {
    "rentalType": "entire-property",
    "roommatePreference": "any"
  },
  "features": {
    "wifi": true,
    "balcony": true,
    "parkingArea": false,
    "elevator": true,
    "airConditioner": true,
    "heatingSystem": true,
    "washingMachine": true,
    "dryer": false,
    "dishwasher": false,
    "kitchenEquipment": true,
    "refrigerator": true,
    "microwave": true,
    "tv": false,
    "privateBathroom": true,
    "securityCameras": true,
    "gatedBuilding": false,
    "garden": false,
    "terrace": false,
    "storageRoom": false,
    "swimmingPool": false,
    "gymAccess": false
  }
}
```

`images` must contain 1 to 12 image files.

`documents` must contain 1 to 5 verification document files.

`video` must contain 1 video tour file.

Required property fields:
- `basicInformation.title`
- `basicInformation.description`
- `location.city`
- `location.district`
- `location.address`
- `pricing.monthlyRent`
- `propertyDetails.propertyType`
- `propertyDetails.roomCount`
- `propertyDetails.bathroomCount`
- `propertyDetails.area`
- `livingSituation.rentalType`

Notes:
- `owner` is taken from the authenticated user and must not be sent.
- `moderationStatus`, `rejectionReason`, and `availabilityStatus` are controlled by the backend during creation.
- Initial property creation requires property data, images, verification documents, and a video tour in the same request.
- The property is created only after all required images, documents, and video upload successfully.
- If any media upload fails, the backend deletes any files already uploaded to Cloudinary and does not create the property.
- Do not use the separate image/document upload endpoints for first-time property creation. Those endpoints are for editing an existing property after creation.
- Accepted image formats are JPEG, PNG, and WebP.
- Each image must be 5 MB or smaller and at least 1200x900 pixels.
- Accepted document formats are PDF, JPEG, PNG, and WebP.
- Each document must be 10 MB or smaller.
- Accepted video formats are MP4, WebM, and MOV.
- The video must be 50 MB or smaller.

Success response: `201 Created`

```json
{
  "success": true,
  "message": "Property created successfully and is pending approval",
  "data": {
    "property": {
      "_id": "PROPERTY_ID",
      "owner": "USER_ID",
      "basicInformation": {},
      "location": {},
      "pricing": {},
      "propertyDetails": {},
      "tenantRules": {},
      "livingSituation": {},
      "features": {},
      "images": [
        {
          "_id": "IMAGE_ID",
          "url": "https://res.cloudinary.com/example/image/upload/example.jpg",
          "publicId": "settlein/properties/example",
          "width": 1792,
          "height": 1024,
          "format": "jpg",
          "bytes": 1346327,
          "isCover": true
        }
      ],
      "videoTour": {
        "url": "https://res.cloudinary.com/example/video/upload/example.mp4",
        "publicId": "settlein/properties/video-tours/example",
        "format": "mp4",
        "bytes": 12345678,
        "duration": 42.4
      },
      "propertyDocuments": [
        {
          "_id": "DOCUMENT_ID",
          "url": "https://res.cloudinary.com/example/raw/upload/example.pdf",
          "publicId": "settlein/properties/documents/example",
          "resourceType": "raw",
          "format": "pdf",
          "bytes": 345678,
          "originalName": "ownership-paper.pdf"
        }
      ],
      "availabilityStatus": "available",
      "moderationStatus": "pending",
      "rejectionReason": "",
      "createdAt": "2026-06-21T10:00:00.000Z",
      "updatedAt": "2026-06-21T10:00:00.000Z"
    }
  }
}
```

Possible errors:
- `400` - Invalid or missing property data, missing media, unsupported media, media too large, or image dimensions too small
- `401` - Missing or invalid token
- `403` - Authenticated user is not an owner
- `404` - Owner profile does not exist

### Get My Properties

```text
GET /api/properties/mine
```

Auth required: Yes

Required role: `owner`

Notes:
- Returns all properties belonging to the authenticated owner.
- Pending, approved, rejected, unavailable, and rented properties are included.
- Results are sorted newest first.

Success response:

```json
{
  "success": true,
  "count": 1,
  "data": {
    "properties": [
      {
        "_id": "PROPERTY_ID",
        "owner": "USER_ID",
        "basicInformation": {},
        "moderationStatus": "pending",
        "availabilityStatus": "available"
      }
    ]
  }
}
```

Possible errors:
- `401` - Missing or invalid token
- `403` - Authenticated user is not an owner

### Get Public Properties

```text
GET /api/properties
```

Auth required: No

Notes:
- Returns only approved and currently available properties.
- Results are sorted newest first.
- The owner is populated with `fullName` and `profilePicture`.
- Private `propertyDocuments` are excluded.

Success response:

```json
{
  "success": true,
  "count": 1,
  "data": {
    "properties": [
      {
        "_id": "PROPERTY_ID",
        "owner": {
          "_id": "USER_ID",
          "fullName": "Property Owner",
          "profilePicture": ""
        },
        "basicInformation": {},
        "location": {},
        "pricing": {},
        "moderationStatus": "approved",
        "availabilityStatus": "available"
      }
    ]
  }
}
```

### Get Public Property Details

```text
GET /api/properties/:id
```

Auth required: No

Notes:
- Only approved and currently available properties can be retrieved through this endpoint.
- Returns the owner's public account identity only.
- Owner email, phone number, and WhatsApp are only returned to renters whose interest has been approved by the owner.
- Private `propertyDocuments` are excluded.

Success response:

```json
{
  "success": true,
  "data": {
    "property": {
      "_id": "PROPERTY_ID",
      "owner": {
        "_id": "USER_ID",
        "fullName": "Property Owner",
        "profilePicture": ""
      },
      "basicInformation": {},
      "location": {},
      "pricing": {},
      "propertyDetails": {},
      "tenantRules": {},
      "livingSituation": {},
      "features": {},
      "images": []
    }
  }
}
```

Possible errors:
- `400` - Invalid property ID
- `404` - Property does not exist, is not approved, or is not available

### Update Property

```text
PUT /api/properties/:id
```

Auth required: Yes

Required role: `owner`

Request body:

Partial updates are supported. Only send fields that should change.

```json
{
  "pricing": {
    "monthlyRent": 1300
  },
  "features": {
    "parkingArea": true
  }
}
```

To change only availability:

```json
{
  "availabilityStatus": "rented"
}
```

Notes:
- The authenticated user must own the property.
- Nested updates preserve fields that were not sent.
- Content changes reset `moderationStatus` to `pending` and clear `rejectionReason`.
- Changing only `availabilityStatus` does not require moderation again.
- `owner`, `moderationStatus`, and `rejectionReason` cannot be changed through this endpoint.

Success response:

```json
{
  "success": true,
  "message": "Property updated successfully and is pending approval",
  "data": {
    "property": {
      "_id": "PROPERTY_ID",
      "owner": "USER_ID",
      "moderationStatus": "pending",
      "availabilityStatus": "available"
    }
  }
}
```

Possible errors:
- `400` - Invalid ID, invalid data, or no supported fields provided
- `401` - Missing or invalid token
- `403` - Authenticated user is not an owner
- `404` - Property does not exist or is owned by another user

### Upload Property Images

```text
POST /api/properties/:id/images
```

Auth required: Yes

Required role: `owner`

Body type: `form-data`

Form-data field:

```text
images
```

Field type: `File`

Notes:
- The authenticated user must own the property.
- Upload at least one image.
- A property can have a maximum of 12 images.
- Each image must be 5 MB or smaller.
- Accepted formats are JPEG, PNG, and WebP.
- Each image must be at least 1200x900 pixels.
- The first image uploaded to a property becomes the cover image automatically.
- Uploading images resets `moderationStatus` to `pending` and clears `rejectionReason`.

Success response:

```json
{
  "success": true,
  "message": "Property images uploaded successfully",
  "data": {
    "property": {
      "_id": "PROPERTY_ID",
      "images": [
        {
          "_id": "IMAGE_ID",
          "url": "https://res.cloudinary.com/example/image/upload/example.jpg",
          "publicId": "settlein/properties/example",
          "width": 1792,
          "height": 1024,
          "format": "jpg",
          "bytes": 1346327,
          "isCover": true
        }
      ],
      "moderationStatus": "pending",
      "rejectionReason": ""
    }
  }
}
```

Possible errors:
- `400` - Missing file, too many images, unsupported type, file too large, or image dimensions too small
- `401` - Missing or invalid token
- `403` - Authenticated user is not an owner
- `404` - Property does not exist or is owned by another user

### Set Property Cover Image

```text
PATCH /api/properties/:id/images/:imageId/cover
```

Auth required: Yes

Required role: `owner`

Request body: None

Notes:
- The authenticated user must own the property.
- `imageId` is the MongoDB `_id` of the image object inside the property's `images` array.
- This endpoint sets the selected image to `isCover: true` and sets all other images to `isCover: false`.
- Changing the cover image does not delete or re-upload any image.

Success response:

```json
{
  "success": true,
  "message": "Property cover image updated successfully",
  "data": {
    "property": {
      "_id": "PROPERTY_ID",
      "images": [
        {
          "_id": "IMAGE_ID",
          "isCover": true
        }
      ]
    }
  }
}
```

Possible errors:
- `400` - Invalid property ID
- `401` - Missing or invalid token
- `403` - Authenticated user is not an owner
- `404` - Property or image does not exist, or property is owned by another user

### Delete Property Image

```text
DELETE /api/properties/:id/images/:imageId
```

Auth required: Yes

Required role: `owner`

Notes:
- The authenticated user must own the property.
- `imageId` is the MongoDB `_id` of the image object inside the property's `images` array.
- The image is removed from both Cloudinary and the property document.
- Deleting the final image is blocked because each property must keep at least one image.
- If the deleted image was the cover image, the first remaining image becomes the new cover.
- Deleting an image resets `moderationStatus` to `pending` and clears `rejectionReason`.

Success response:

```json
{
  "success": true,
  "message": "Property image deleted successfully",
  "data": {
    "property": {
      "_id": "PROPERTY_ID",
      "images": [
        {
          "_id": "REMAINING_IMAGE_ID",
          "isCover": true
        }
      ],
      "moderationStatus": "pending",
      "rejectionReason": ""
    }
  }
}
```

Possible errors:
- `400` - Invalid property ID or attempted to delete the final image
- `401` - Missing or invalid token
- `403` - Authenticated user is not an owner
- `404` - Property or image does not exist, or property is owned by another user

### Upload Property Video Tour

```text
POST /api/properties/:id/video-tour
```

Auth required: Yes

Required role: `owner`

Body type: `form-data`

Form-data field:

```text
video
```

Field type: `File`

Notes:
- The authenticated user must own the property.
- Each property can have one video tour.
- Uploading a new video tour replaces the previous one and deletes the old Cloudinary video.
- The video must be 50 MB or smaller.
- Accepted formats are MP4, WebM, and MOV.
- Uploading a video tour resets `moderationStatus` to `pending` and clears `rejectionReason`.

Success response:

```json
{
  "success": true,
  "message": "Property video tour uploaded successfully",
  "data": {
    "property": {
      "_id": "PROPERTY_ID",
      "videoTour": {
        "url": "https://res.cloudinary.com/example/video/upload/example.mp4",
        "publicId": "settlein/properties/video-tours/example",
        "format": "mp4",
        "bytes": 12345678,
        "duration": 42.4
      },
      "moderationStatus": "pending",
      "rejectionReason": ""
    }
  }
}
```

Possible errors:
- `400` - Missing file, unsupported type, or video too large
- `401` - Missing or invalid token
- `403` - Authenticated user is not an owner
- `404` - Property does not exist or is owned by another user

### Delete Property Video Tour

```text
DELETE /api/properties/:id/video-tour
```

Auth required: Yes

Required role: `owner`

Notes:
- The authenticated user must own the property.
- The video tour is removed from both Cloudinary and the property document.
- Deleting a video tour resets `moderationStatus` to `pending` and clears `rejectionReason`.

Success response:

```json
{
  "success": true,
  "message": "Property video tour deleted successfully",
  "data": {
    "property": {
      "_id": "PROPERTY_ID",
      "videoTour": {
        "url": "",
        "publicId": "",
        "format": "",
        "bytes": 0,
        "duration": 0
      },
      "moderationStatus": "pending",
      "rejectionReason": ""
    }
  }
}
```

Possible errors:
- `400` - Invalid property ID
- `401` - Missing or invalid token
- `403` - Authenticated user is not an owner
- `404` - Property or video tour does not exist, or property is owned by another user

### Upload Property Documents

```text
POST /api/properties/:id/documents
```

Auth required: Yes

Required role: `owner`

Body type: `form-data`

Form-data field:

```text
documents
```

Field type: `File`

Notes:
- The authenticated user must own the property.
- Property documents are private verification files for owner/moderator review.
- A property can have a maximum of 5 documents.
- Each document must be 10 MB or smaller.
- Accepted formats are PDF, JPEG, PNG, and WebP.
- Uploading documents resets `moderationStatus` to `pending` and clears `rejectionReason`.

Success response:

```json
{
  "success": true,
  "message": "Property documents uploaded successfully",
  "data": {
    "property": {
      "_id": "PROPERTY_ID",
      "propertyDocuments": [
        {
          "_id": "DOCUMENT_ID",
          "url": "https://res.cloudinary.com/example/raw/upload/example.pdf",
          "publicId": "settlein/properties/documents/example",
          "resourceType": "raw",
          "format": "pdf",
          "bytes": 345678,
          "originalName": "ownership-paper.pdf"
        }
      ],
      "moderationStatus": "pending",
      "rejectionReason": ""
    }
  }
}
```

Possible errors:
- `400` - Missing file, too many documents, unsupported type, or document too large
- `401` - Missing or invalid token
- `403` - Authenticated user is not an owner
- `404` - Property does not exist or is owned by another user

### Delete Property Document

```text
DELETE /api/properties/:id/documents/:documentId
```

Auth required: Yes

Required role: `owner`

Notes:
- The authenticated user must own the property.
- `documentId` is the MongoDB `_id` of the document object inside the property's `propertyDocuments` array.
- The document is removed from both Cloudinary and the property document.
- Deleting a document resets `moderationStatus` to `pending` and clears `rejectionReason`.

Success response:

```json
{
  "success": true,
  "message": "Property document deleted successfully",
  "data": {
    "property": {
      "_id": "PROPERTY_ID",
      "propertyDocuments": [],
      "moderationStatus": "pending",
      "rejectionReason": ""
    }
  }
}
```

Possible errors:
- `400` - Invalid property ID
- `401` - Missing or invalid token
- `403` - Authenticated user is not an owner
- `404` - Property or document does not exist, or property is owned by another user

### Delete Property

```text
DELETE /api/properties/:id
```

Auth required: Yes

Required role: `owner`

Notes:
- The authenticated user must own the property.
- This permanently deletes the database record.
- Uploaded property images are also deleted from Cloudinary.
- Uploaded property video tour is also deleted from Cloudinary.
- Uploaded property verification documents are also deleted from Cloudinary.

Success response:

```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

Possible errors:
- `400` - Invalid property ID
- `401` - Missing or invalid token
- `403` - Authenticated user is not an owner
- `404` - Property does not exist or is owned by another user

## Renter Feed

All renter feed endpoints require a valid JWT belonging to a user whose active
role is `renter`.

### Get Renter Feed

```text
GET /api/renter-feed?limit=20
```

Auth required: Yes

Required role: `renter`

Query parameters:
- `limit` - Optional number of cards to return. Defaults to `20`. Maximum is `50`.

Notes:
- The renter must have renter preferences.
- The renter preferences must include a city.
- The feed only considers properties that are approved, available, and priced in `GEL`.
- Public feed properties exclude private verification documents.
- City, smoking compatibility, rental type, and roommate compatibility are used as hard filters when relevant.
- Budget, deposit preference, property type, furnished preference, room count, bathroom count, and pets affect similarity score instead of eliminating otherwise compatible properties.
- Budget is scored out of `30` points. Properties inside the selected range receive full budget points; properties below the minimum receive a small penalty; properties above the maximum lose points aggressively as the overage grows.
- Deposit preference is scored out of `22` points when `withoutDeposit` is selected.
- Furnished preference is scored out of `18` points when selected.
- Property type and room count are each scored out of `16` points when selected. Nearby room-count misses receive partial credit.
- Bathroom count is scored out of `10` points when selected. Nearby bathroom-count misses receive partial credit.
- Pet compatibility is scored out of `20` points when the renter has pets.
- Districts use a manual neighbor map so nearby districts can still rank well.
- Properties at or above `65%` similarity are prioritized first.
- Properties at or below `60%` similarity are hidden from the feed. If there are too few strong matches, fallback matches from `61%` to `64%` are returned after them.
- Swipe-left rejected properties are hidden for 2 hours.
- Properties with `pending`, `approved`, or owner-`rejected` interests are hidden from the feed.
- Properties with `withdrawn` interests can appear in the feed again.

Success response:

```json
{
  "success": true,
  "count": 2,
  "data": {
    "matches": [
      {
        "similarity": 87,
        "property": {
          "_id": "PROPERTY_ID",
          "owner": {
            "_id": "OWNER_ID",
            "fullName": "Property Owner",
            "profilePicture": ""
          },
          "basicInformation": {},
          "location": {},
          "pricing": {},
          "propertyDetails": {},
          "tenantRules": {},
          "livingSituation": {},
          "features": {},
          "images": [],
          "availabilityStatus": "available",
          "moderationStatus": "approved"
        }
      }
    ]
  }
}
```

`images` must contain 1 to 12 image files.

`documents` must contain 1 to 5 verification document files.

Possible errors:
- `400` - Renter preferences are missing required feed data
- `401` - Missing or invalid token
- `403` - Authenticated user is not a renter
- `404` - Renter preferences not found

### Reject Property From Feed

```text
POST /api/renter-feed/:propertyId/reject
```

Auth required: Yes

Required role: `renter`

Request body: None

Notes:
- Use this when a renter swipes left.
- The backend stores the rejection and hides the property from this renter's feed for 2 hours.
- This is a temporary feed dismissal. It is separate from an owner rejecting a renter's interest.

Success response:

```json
{
  "success": true,
  "message": "Property rejected for this renter feed",
  "data": {
    "interaction": {
      "_id": "INTERACTION_ID",
      "renter": "RENTER_ID",
      "property": "PROPERTY_ID",
      "action": "rejected",
      "rejectedAt": "2026-06-26T10:00:00.000Z",
      "dismissedUntil": "2026-06-26T12:00:00.000Z"
    }
  }
}
```

Possible errors:
- `401` - Missing or invalid token
- `403` - Authenticated user is not a renter, or tried to reject their own property
- `404` - Property does not exist or is not available

### Mark Property Interest

```text
POST /api/renter-feed/:propertyId/interest
```

Auth required: Yes

Required role: `renter`

Request body: None

Notes:
- Use this when a renter swipes right.
- Creates or reactivates a property interest with `status: "pending"`.
- Pending interests are visible to the property owner.
- The property is hidden from this renter's feed while the interest is `pending`, `approved`, or `rejected`.
- If the renter previously withdrew interest, this endpoint changes it back to `pending`.
- If the owner already rejected the interest, the renter cannot create it again.

Success response:

```json
{
  "success": true,
  "message": "Property interest saved",
  "data": {
    "interest": {
      "_id": "INTEREST_ID",
      "renter": "RENTER_ID",
      "owner": "OWNER_ID",
      "property": "PROPERTY_ID",
      "status": "pending",
      "interestedAt": "2026-06-26T10:00:00.000Z"
    }
  }
}
```

Possible errors:
- `401` - Missing or invalid token
- `403` - Authenticated user is not a renter, or tried to mark interest in their own property
- `404` - Property does not exist or is not available
- `409` - The owner already rejected this interest request

## Renter Interests

All renter interest endpoints require a valid JWT belonging to a user whose
active role is `renter`.

### Get My Interested Properties

```text
GET /api/renter-interests/me
```

Auth required: Yes

Required role: `renter`

Query parameters:
- `includeWithdrawn=true` - Optional. Include withdrawn interests in the response.

Notes:
- Returns the renter's `pending`, `approved`, and `rejected` property interests by default.
- `withdrawn` interests are excluded unless `includeWithdrawn=true` is sent.
- Approved interests include owner contact information.
- Pending and rejected interests do not include owner contact information.

Success response:

```json
{
  "success": true,
  "count": 1,
  "data": {
    "interests": [
      {
        "_id": "INTEREST_ID",
        "renter": "RENTER_ID",
        "owner": "OWNER_ID",
        "property": {
          "_id": "PROPERTY_ID",
          "owner": {
            "_id": "OWNER_ID",
            "fullName": "Property Owner",
            "profilePicture": ""
          },
          "basicInformation": {},
          "location": {},
          "pricing": {}
        },
        "status": "approved",
        "interestedAt": "2026-06-26T10:00:00.000Z",
        "approvedAt": "2026-06-26T10:30:00.000Z",
        "ownerContact": {
          "owner": {
            "_id": "OWNER_ID",
            "fullName": "Property Owner",
            "email": "owner@example.com",
            "profilePicture": ""
          },
          "ownerProfile": {
            "_id": "OWNER_PROFILE_ID",
            "phoneNumber": "+995555123456",
            "whatsappNumber": "+995555123456",
            "languages": ["English", "Georgian"],
            "preferredContactMethods": ["phone", "whatsapp", "email"]
          }
        }
      }
    ]
  }
}
```

Possible errors:
- `401` - Missing or invalid token
- `403` - Authenticated user is not a renter

### Withdraw My Property Interest

```text
DELETE /api/renter-interests/:interestId
```

Auth required: Yes

Required role: `renter`

Notes:
- Use this when a renter is no longer interested in a property.
- The interest status becomes `withdrawn`.
- Withdrawn properties can appear in the renter feed again.
- Owner-rejected interests cannot be withdrawn because they permanently block that property from returning to the renter's feed.

Success response:

```json
{
  "success": true,
  "message": "Property interest withdrawn",
  "data": {
    "interest": {
      "_id": "INTEREST_ID",
      "renter": "RENTER_ID",
      "property": "PROPERTY_ID",
      "status": "withdrawn",
      "withdrawnAt": "2026-06-26T11:00:00.000Z"
    }
  }
}
```

Possible errors:
- `400` - Invalid interest ID
- `401` - Missing or invalid token
- `403` - Authenticated user is not a renter
- `404` - Interest not found
- `409` - Owner-rejected interests cannot be withdrawn

## Owner Property Interests

These endpoints require a valid JWT belonging to the owner of the property.

### Get Interested Renters For Property

```text
GET /api/properties/:propertyId/interests
```

Auth required: Yes

Required role: `owner`

Query parameters:
- `includeWithdrawn=true` - Optional. Include withdrawn interests in the response.

Notes:
- Returns `pending`, `approved`, and `rejected` interests for the owner's property by default.
- Withdrawn interests are excluded unless `includeWithdrawn=true` is sent.
- Owners can approve as many renters as they want.
- Approval only means the owner consents to sharing contact information with that renter.
- Approval does not reserve or rent the property.

Success response:

```json
{
  "success": true,
  "count": 1,
  "data": {
    "property": {
      "_id": "PROPERTY_ID",
      "owner": "OWNER_ID",
      "basicInformation": {}
    },
    "interests": [
      {
        "_id": "INTEREST_ID",
        "renter": {
          "_id": "RENTER_ID",
          "fullName": "Interested Renter",
          "email": "renter@example.com",
          "profilePicture": ""
        },
        "property": "PROPERTY_ID",
        "status": "pending",
        "interestedAt": "2026-06-26T10:00:00.000Z"
      }
    ]
  }
}
```

Possible errors:
- `401` - Missing or invalid token
- `403` - Authenticated user is not an owner
- `404` - Property does not exist or is owned by another user

### Approve Property Interest

```text
PATCH /api/properties/:propertyId/interests/:interestId/approve
```

Auth required: Yes

Required role: `owner`

Notes:
- Only pending interests can be approved.
- Approval shares the owner's contact information with that renter through `GET /api/renter-interests/me`.
- Approval does not reserve the property and does not change property availability.

Success response:

```json
{
  "success": true,
  "message": "Property interest approved",
  "data": {
    "interest": {
      "_id": "INTEREST_ID",
      "status": "approved",
      "approvedAt": "2026-06-26T10:30:00.000Z",
      "ownerRespondedAt": "2026-06-26T10:30:00.000Z",
      "contactSharedAt": "2026-06-26T10:30:00.000Z"
    }
  }
}
```

Possible errors:
- `400` - Invalid interest ID
- `401` - Missing or invalid token
- `403` - Authenticated user is not an owner
- `404` - Property or interest not found
- `409` - Interest is not pending

### Reject Property Interest

```text
PATCH /api/properties/:propertyId/interests/:interestId/reject
```

Auth required: Yes

Required role: `owner`

Notes:
- Only pending interests can be rejected.
- Owner-rejected properties never appear in that renter's feed again.
- Rejection does not affect other renters or property availability.

Success response:

```json
{
  "success": true,
  "message": "Property interest rejected",
  "data": {
    "interest": {
      "_id": "INTEREST_ID",
      "status": "rejected",
      "rejectedAt": "2026-06-26T10:30:00.000Z",
      "ownerRespondedAt": "2026-06-26T10:30:00.000Z"
    }
  }
}
```

Possible errors:
- `400` - Invalid interest ID
- `401` - Missing or invalid token
- `403` - Authenticated user is not an owner
- `404` - Property or interest not found
- `409` - Interest is not pending

## Moderation

All moderation endpoints require a valid JWT belonging to a user whose role is
`moderator`.

### Get Pending Properties

```text
GET /api/moderation/properties/pending
```

Auth required: Yes

Required role: `moderator`

Notes:
- Returns properties whose `moderationStatus` is `pending`.
- Results are sorted from oldest to newest.
- Each property's owner is populated with `fullName`, `email`, and `profilePicture`.

Success response:

```json
{
  "success": true,
  "count": 1,
  "data": {
    "properties": [
      {
        "_id": "PROPERTY_ID",
        "owner": {
          "_id": "USER_ID",
          "fullName": "Property Owner",
          "email": "owner@example.com",
          "profilePicture": ""
        },
        "moderationStatus": "pending"
      }
    ]
  }
}
```

Possible errors:
- `401` - Missing or invalid token
- `403` - Authenticated user is not a moderator

### Get Property For Moderation

```text
GET /api/moderation/properties/:id
```

Auth required: Yes

Required role: `moderator`

Notes:
- Returns a property regardless of whether it is pending, approved, or rejected.
- Use this endpoint when the moderator needs to cross-reference the submitted property form, uploaded images, video tour, and property documents.
- The owner is populated with `fullName`, `email`, and `profilePicture`.
- The owner profile is included with contact details and preferred contact methods.

Success response:

```json
{
  "success": true,
  "data": {
    "property": {
      "_id": "PROPERTY_ID",
      "owner": {
        "_id": "USER_ID",
        "fullName": "Property Owner",
        "email": "owner@example.com",
        "profilePicture": ""
      },
      "basicInformation": {},
      "location": {},
      "pricing": {},
      "propertyDetails": {},
      "tenantRules": {},
      "livingSituation": {},
      "features": {},
      "images": [],
      "videoTour": {},
      "propertyDocuments": [],
      "moderationStatus": "pending",
      "rejectionReason": ""
    },
    "ownerProfile": {
      "_id": "OWNER_PROFILE_ID",
      "phoneNumber": "+995555123456",
      "whatsappNumber": "+995555123456",
      "languages": ["English", "Georgian"],
      "preferredContactMethods": ["phone", "whatsapp", "email"]
    }
  }
}
```

Possible errors:
- `400` - Invalid property ID
- `401` - Missing or invalid token
- `403` - Authenticated user is not a moderator
- `404` - Property does not exist

### Approve Property

```text
PATCH /api/moderation/properties/:id/approve
```

Auth required: Yes

Required role: `moderator`

Request body: None

Notes:
- Only a property currently marked as `pending` can be approved.
- A property must have at least one image before it can be approved.
- Approval sets `moderationStatus` to `approved` and clears `rejectionReason`.
- Once approved, an available property can appear in the public property list.

Success response:

```json
{
  "success": true,
  "message": "Property approved successfully",
  "data": {
    "property": {
      "_id": "PROPERTY_ID",
      "moderationStatus": "approved",
      "rejectionReason": ""
    }
  }
}
```

Possible errors:
- `400` - Invalid property ID, or the property has no images
- `401` - Missing or invalid token
- `403` - Authenticated user is not a moderator
- `404` - Property does not exist
- `409` - Property is no longer pending

### Reject Property

```text
PATCH /api/moderation/properties/:id/reject
```

Auth required: Yes

Required role: `moderator`

Request body:

```json
{
  "rejectionReason": "Property information is incomplete."
}
```

Notes:
- `rejectionReason` is required and cannot be empty.
- Only a property currently marked as `pending` can be rejected.
- Rejection sets `moderationStatus` to `rejected` and stores the trimmed reason.

Success response:

```json
{
  "success": true,
  "message": "Property rejected successfully",
  "data": {
    "property": {
      "_id": "PROPERTY_ID",
      "moderationStatus": "rejected",
      "rejectionReason": "Property information is incomplete."
    }
  }
}
```

Possible errors:
- `400` - Invalid property ID or missing rejection reason
- `401` - Missing or invalid token
- `403` - Authenticated user is not a moderator
- `404` - Property does not exist
- `409` - Property is no longer pending
