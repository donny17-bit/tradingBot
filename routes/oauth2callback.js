const express = require("express");
const router = express.Router();
const User = require("../models/user");
const oAuth2Client = require("../config/googleClient");
const { google } = require("googleapis");

router.get("/oauth2callback", async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Get user ID from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // save login info to DB
    await User.upsert({
      user_id: userInfo.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
    });

    res.send(
      "Authentication successful. You can now fetch emails from /emails."
    );
  } catch (err) {
    console.error("OAuth error:", err);
    res.status(500).send("Authentication failed.");
  }
});

module.exports = router;
