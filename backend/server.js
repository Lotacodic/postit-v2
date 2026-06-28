const app = require("./app");
const connectDB = require("./config/db");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
  });
});