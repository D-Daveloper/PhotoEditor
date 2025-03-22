require("dotenv").config();
const express = require("express");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;
const photoEditorRoute = require("./routes/uploadRoute");

// Middleware to parse JSON
app.use(express.json());

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
