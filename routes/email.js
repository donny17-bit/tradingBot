const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { google } = require("googleapis");
const oAuth2Client = require("../config/googleClient");

function getUserIdFromGoogle(oAuth2Client) {
  const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
  return oauth2.userinfo.get().then((res) => res.data.id);
}

router.get("/get-email-message", async (req, res) => {
  try {
    // Use access_token from query (in production you'd use session or JWT)
    const accessToken = req.query.token;
    if (!accessToken) return res.status(400).send("Missing access token");

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oAuth2Client.setCredentials({ access_token: accessToken });

    const userId = await getUserIdFromGoogle(oAuth2Client);
    const userToken = await User.findOne({ where: { user_id: userId } });

    if (!userToken) return res.status(401).send("No stored token found.");

    oAuth2Client.setCredentials({
      access_token: userToken.access_token,
      refresh_token: userToken.refresh_token,
      expiry_date: userToken.expiry_date,
    });

    oAuth2Client.on("tokens", async (tokens) => {
      const updates = {};
      if (tokens.access_token) updates.access_token = tokens.access_token;
      if (tokens.expiry_date) updates.expiry_date = tokens.expiry_date;
      await User.update(updates, { where: { user_id: userId } });
    });

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    await gmail.users.watch({
      userId: "me",
      requestBody: {
        topicName: "projects/YOUR_PROJECT_ID/topics/gmail-push-topic", // Replace with your actual topic
        labelIds: ["INBOX"],
        labelFilterAction: "include",
      },
    });

    const list = await gmail.users.messages.list({
      userId: "me",
      maxResults: 1,
      q: "doniwahyu14@gmail.com",
    });
    if (!list.data.messages?.length) return res.send("No messages.");

    const message = await gmail.users.messages.get({
      userId: "me",
      id: list.data.messages[0].id,
      format: "full",
    });

    const headers = message.data.payload.headers;
    const subject = headers.find((h) => h.name === "Subject")?.value;
    const from = headers.find((h) => h.name === "From")?.value;
    const date = headers.find((h) => h.name === "Date")?.value;

    // Helper function to decode base64url string to utf-8
    function decodeBase64(base64String) {
      const buff = Buffer.from(base64String, "base64");
      return buff.toString("utf-8");
    }

    // Recursive function to get body content from parts
    function getBody(payload) {
      if (!payload) return "";

      if (payload.parts) {
        // multipart message - recurse through parts
        return payload.parts.map(getBody).join("");
      } else if (payload.body && payload.body.data) {
        return decodeBase64(payload.body.data);
      }
      return "";
    }

    // Extract body text/html
    const fullBody = getBody(message.data.payload);

    // --- START: Clean and parse JSON from body ---
    let parsedMessage = null;

    // Try to extract the first `{...}` block only
    const match = fullBody.match(/{[^}]+}/);

    if (match) {
      let rawJsonLike = match[0];

      // Fix unquoted keys using regex
      const fixedBody = rawJsonLike.replace(
        /([{,])\s*([a-zA-Z0-9_]+)\s*:/g,
        '$1"$2":'
      );

      try {
        parsedMessage = JSON.parse(fixedBody);
      } catch (err) {
        console.error("Failed to parse JSON from email body:", err);
      }
    } else {
      console.warn("No JSON-like content found in email body.");
    }
    // --- END ---

    res.json({ subject, from, date, fullBody, parsedMessage });
  } catch (err) {
    console.error("Error fetching latest email:", err);
    res.status(500).send("Failed to fetch latest email");
  }
});

module.exports = router;
