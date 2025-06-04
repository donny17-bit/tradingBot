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

    await User.findOne({
      where: { email: userInfo.email },
    }).then(async (user) => {
      if (user) {
        user.access_token = tokens.access_token;
        user.refresh_token = tokens.refresh_token;
        user.scope = tokens.scope;
        user.token_type = tokens.token_type;
        user.expiry_date = tokens.expiry_date;
        user.updated_at = new Date();
        user.save();
      } else {
        // save login info to DB
        await User.upsert({
          email: userInfo.email,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          scope: tokens.scope,
          token_type: tokens.token_type,
          expiry_date: tokens.expiry_date,
          created_at: new Date(),
        });
      }
    });

    // 👇 Gmail Push Notification Setup
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
    await gmail.users.watch({
      userId: "me",
      requestBody: {
        topicName: process.env.PUB_SUB_TOPIC,
        labelIds: ["INBOX"],
        labelFilterAction: "include",
      },
    });

    const profile = await gmail.users.getProfile({ userId: "me" });
    const historyId = profile.data.historyId;

    // Store or update the last_history_id in DB
    await User.update(
      { last_history_id: historyId },
      { where: { email: userInfo.email } }
    );

    // res.redirect("/get-email-message");
    res.send(
      "Authentication successful. You can now fetch emails from /emails."
    );
  } catch (err) {
    console.error("OAuth error:", err);
    res.status(500).send("Authentication failed.");
  }
});

module.exports = router;
