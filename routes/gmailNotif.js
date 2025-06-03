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

  const data = JSON.parse(
    Buffer.from(message.data, "base64").toString("utf-8")
  );

  const { emailAddress, historyId } = data;
  console.log("🔔 Gmail Push:", emailAddress, "History ID:", historyId);

  // Lookup user by email
  const user = await User.findOne({ where: { email: emailAddress } });
  if (!user) return res.status(404).send("User not found");

  // Set credentials
  oAuth2Client.setCredentials({
    access_token: user.access_token,
    refresh_token: user.refresh_token,
    expiry_date: user.expiry_date,
  });

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  // Get changes since the last known historyId
  const historyRes = await gmail.users.history.list({
    userId: "me",
    startHistoryId: historyId,
    // historyTypes: ["messageAdded"],
  });

  console.log("📜 History Response:", historyRes);

  const addedMessages =
    historyRes.data.history?.flatMap((h) => h.messages) || [];
  if (addedMessages.length === 0) {
    console.log("✅ No new messages.");
    return res.send("No new messages");
  }

  // Fetch full message data
  for (const msg of addedMessages) {
    const fullMessage = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "full",
    });

    const subject = fullMessage.data.payload.headers.find(
      (h) => h.name === "Subject"
    )?.value;
    console.log("📩 New Email Subject:", subject);

    // Print the body message
    function extractEmailBody(payload) {
      const getBodyFromPart = (part) => {
        if (part.body?.data) {
          const decoded = Buffer.from(part.body.data, "base64").toString(
            "utf-8"
          );
          return decoded;
        }
        return null;
      };

      if (
        payload.mimeType === "text/plain" ||
        payload.mimeType === "text/html"
      ) {
        return getBodyFromPart(payload);
      }

      // Sometimes the message body is in the `parts` array
      if (payload.parts && Array.isArray(payload.parts)) {
        for (const part of payload.parts) {
          const result = getBodyFromPart(part);
          if (result) return result;
        }
      }

      return "[No message body found]";
    }

    const body = extractEmailBody(fullMessage.data.payload);
    console.log("📨 Full email body:\n", body);
  }

  // TODO: Optionally trigger message fetch here using historyId
  res.status(200).send("OK message received");
});

module.exports = router;
