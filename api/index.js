// const app = require("../server"); // Import your Express app
const app = require("../server");
const { createServer } = require("@vercel/node");

module.exports = createServer(app);
