require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require('cors'); // Import the cors package

const app = express();
const PORT = process.env.PORT || 3000;
const photoEditorRoute = require("./routes/uploadRoute");

// Middleware to parse JSON
app.use(express.json());
// Define the CORS options
const corsOptions = {
  credentials: true,
  origin: ["http://localhost:3000"], // Whitelist the domains you want to allow
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
};

app.use(cors(corsOptions)); // Use the cors middleware with your options

app.use("/api/v1",photoEditorRoute);



// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle Multer-specific errors
    console.log("first",err);
    return res.status(500).json({ message: err.message });
  } else if (err) {
    // Handle other errors (like the one from fileFilter)
    console.log("second",err);
    return res.status(400).json({ message: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
