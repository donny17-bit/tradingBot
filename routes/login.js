const express = require("express");
const router = express.Router();
const oAuth2Client = require("../config/googleClient");

router.get("/login", (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email", // nnti coba dihapus
    "https://www.googleapis.com/auth/userinfo.profile",
  ];
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // ini juga dihapus, karena berguna untuk force login dari awal (generate refresh token)
    scope: scopes,
  });
  res.redirect(url);
});

module.exports = router;
