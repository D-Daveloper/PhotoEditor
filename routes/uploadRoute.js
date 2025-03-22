const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  testUpload,
  removeBackground,
  replaceBackground,
  applyEhance,
  retouch,
  expand,
  applyEffect,
  applyArtStlye,
} = require("../controller/photoEditor");

const router = express.Router();

const checkFileUpload = (req, res, next) => {
    // Check for single file upload
    if (req.file) {
      return next(); // Proceed to the next middleware or route handler
    }
  
    // Check for multiple file uploads
    if (req.files && Object.values(req.files).length > 0) {
      return next(); // Proceed to the next middleware or route handler
    }
    // If no files are uploaded, return an error
    next(new Error('No files uploaded'));
  };

// Set up Multer storage
const storage = multer.memoryStorage(); // Use memory storage for Cloudinary
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/; // Allowed file types
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname && file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    cb(new Error("Error: File type not supported!"));
  },
}); // Limit file size to 10MB

// Define the upload route
router.post("/upload", upload.single("image"),checkFileUpload, testUpload);
router.post("/removeBg", upload.single("image"),checkFileUpload, removeBackground);
router.post("/applyEhance", upload.single("image"),checkFileUpload, applyEhance);
router.post("/replaceBg", upload.fields([{ name: 'image' }, { name: 'background' }]),checkFileUpload, replaceBackground);
router.post("/retouch", upload.single("image"),checkFileUpload,retouch);
router.post("/expand", upload.single("image"),checkFileUpload,expand);
router.post("/applyEffect", upload.single("image"),checkFileUpload,applyEffect);
router.post("/applyArt", upload.single("image"),checkFileUpload,applyArtStlye);

module.exports = router;
