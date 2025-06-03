const express = require("express");
const router = express.Router();
const User = require("../models/user");
const oAuth2Client = require("../config/googleClient");
const { google } = require("googleapis");

router.post("/gmail-notification", async (req, res) => {
  const message = req.body.message;

  if (!message || !message.data) {
    return res.status(400).send("Invalid Pub/Sub message");
  }

  const data = Buffer.from(message.data, "base64").toString("utf-8");
  console.log("🔔 New Gmail notification:", data);

  // TODO: Optionally trigger message fetch here using historyId

  res.status(200).send("OK message received");
});

module.exports = router;
