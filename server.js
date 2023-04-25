const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

// Local Imports
const app = require("./app");

exports.prisma = new PrismaClient();

const port = process.env.PORT || 5050;

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
