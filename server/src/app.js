const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const renterPreferenceRoutes = require("./routes/renterPreferenceRoutes");
const ownerProfileRoutes = require("./routes/ownerProfileRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const moderationRoutes = require("./routes/moderationRoutes");
const renterFeedRoutes = require("./routes/renterFeedRoutes");
const renterInterestRoutes = require("./routes/renterInterestRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/renter-preferences", renterPreferenceRoutes);
app.use("/api/owner-profile", ownerProfileRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/renter-feed", renterFeedRoutes);
app.use("/api/renter-interests", renterInterestRoutes);

app.get("/", (req, res) => {
  res.send("SettleIn backend is running");
});

module.exports = app;
