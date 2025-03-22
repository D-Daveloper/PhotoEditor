const cloudinary = require("../config/cloudinary");
require("dotenv").config();
const status = process.env.STATUS;

// Define a route for file upload
const testUpload = (req, res, next) => {
  res.send(`File uploaded: ${req.file.originalname}`);
};

// Helper function to upload a stream and return the result
const uploadStream = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Remove the background of an image
const removeBackground = async (req, res) => {
  try {
    const result = await uploadStream(req.file.buffer, {
      background_removal: "cloudinary_ai",
    });
    // console.log(result);
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove background" });
  }
};

// Replace the background of an image with another image
const replaceBackground = async (req, res) => {
  try {
    // console.log("rpb", req.files);
    if (!req.files.image || !req.files.background) {
      return res
        .status(400)
        .json({ error: "Both image and background required" });
    }

    // Step 1: Upload the foreground image and remove background
    const foreground = await uploadStream(req.files.image[0].buffer, {
      background_removal: "cloudinary_ai",
    });
    console.log("Foreground uploaded:", foreground.secure_url); // Debug log

    // Step 2: Upload the background image
    const background = await uploadStream(req.files.background[0].buffer, {});
    console.log("Background uploaded:", background.secure_url); // Debug log

    // Overlay foreground on background
    const result = await cloudinary.uploader.upload(background.secure_url, {
      transformation: [
        { overlay: foreground.public_id },
        { flags: "layer_apply" },
      ],
    });
    console.log("result111", result);

    res.json({ url: result.secure_url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to replace background" });
  }
};

// Enhance an image by applying auto brightness, auto contrast, mand sharpening
const applyEhance = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Image required" });

    const result = await uploadStream(req.file.buffer, {
      transformation: [
        { effect: "auto_brightness" },
        { effect: "auto_contrast" },
        { quality: "auto" },
        { effect: "sharpen" },
      ],
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to enhance image" });
  }
};

// Retouch an image by applying facial enhancement and wrinkle reduction
const retouch = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Image required" });
    console.log("status", status);
    
    const options =
      status === "development"
        ? {
            transformation: [
              { effect: "improve" }, // Basic enhancement for free tier
              { effect: "sharpen" },
            ],
          }
        : {
            transformation: [
              { effect: "face_enhance" }, // Applies facial enhancement (skin smoothing, feature boost)
              { effect: "sharpen" }, // Optional: Adds clarity to the result
              // Optional: Fine-tune with parameters if needed
              { effect: "wrinkle_reduction:50" }, // Example custom tweak (adjustable)
            ],
            detection: "adv_face", // Triggers the Advanced Facial Attribute Detection add-on
          };

    const result = await uploadStream(req.file.buffer, options);

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retouch image" });
  }
};

// Expand an image to a specified width and height
const expand = async (req, res) => {
  try {
    const { width, height } = req.body;
    if (!req.file || !width || !height)
      return res.status(400).json({ error: "Image and dimensions required" });
    const result = await uploadStream(req.file.buffer, {
      generative_fill: true,
      width,
      height,
      crop: "pad",
    });
    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: "Failed to expand image" });
  }
};

// Apply a specified effect to an image
const applyEffect = async (req, res) => {
  try {
    const { effect, intensity } = req.body;
    if (!req.file || !effect)
      return res.status(400).json({ error: "Image and effect required" });
    
    const transformations = {
      cinematic: { effect: "art:zorro", contrast: 20 },
      golden_hour: { effect: "art:al_dente", warmth: 30 },
      vibrant: { effect: "vibrance:50" },
      moody: { effect: "art:peacock", brightness: -10 },
      dreamy: { effect: "art:athena", opacity: 80 },
      balanced: { effect: "improve" },
    };

    const transformation = transformations[effect] || { effect: "improve" };

    if (intensity) transformation.effect += `:${intensity}`;

    const result = await uploadStream(req.file.buffer, { transformation });
    
    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: "Failed to apply effect" });
  }
};


// Apply art style to an image
const applyArtStlye = async (req, res) => {
  try {
    const { style, intensity } = req.body;
    if (!req.file || !style)
      return res.status(400).json({ error: "Image and style required" });
    const styles = {
      oil_painting: "art:zorro",
      sketch: "art:pencil",
      pixel_art: "art:pixelate",
      watercolor: "art:aurora",
      glitch: "art:glitch",
      dreamscape: "art:athena",
    };
    const effect = styles[style] || "art:improve";
    const transformation = {
      effect: intensity ? `${effect}:${intensity}` : effect,
    };
    const result = await uploadStream(req.file.buffer, { transformation });
    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: "Failed to apply art style" });
  }
};
module.exports = {
  testUpload,
  removeBackground,
  replaceBackground,
  applyEhance,
  retouch,
  expand,
  applyEffect,
  applyArtStlye,
};

// const applyEhance = async (req, res) => {
//   try {
//     const { filter } = req.body;
//     if (!filter) return res.status(400).json({ error: "filter required" });
//     // Example filters: 'sepia', 'grayscale', 'auto_enhance'
//     let transformation;
//     switch (filter) {
//       case "sepia":
//         transformation = { effect: "sepia" };
//         break;
//       case "grayscale":
//         transformation = { effect: "grayscale" };
//         break;
//       case "auto_enhance":
//         transformation = { effect: "auto_brightness" };
//         break;
//       default:
//         return res.status(400).json({ error: "Unsupported filter" });
//     }

//     const result = await uploadStream(req.file.buffer, {
//       transformation,
//     });
//     res.json({ url: result.secure_url });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to apply filter" });
//   }
// };
