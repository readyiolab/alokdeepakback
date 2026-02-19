// middleware/upload.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const spacesClient = require('../config/spaces');
const {
  doSpaceBucket,
  doSpaceEndPoint
} = require('../config/dotenvconfg');

// Multer config for in-memory storage and image filtering
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed.'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Function to upload file to DigitalOcean Spaces
const uploadToSpaces = async (file) => {
  const bucket = doSpaceBucket;
  let endpoint = doSpaceEndPoint;

  if (!bucket) {
    throw new Error('Missing environment variable: DO_SPACES_BUCKET');
  }

  if (!endpoint) {
    throw new Error('Missing environment variable: DO_SPACES_ENDPOINT');
  }

  // Automatically strip https:// if present
  if (endpoint.startsWith('https://')) {
    console.warn('Warning: DO_SPACES_ENDPOINT should not include "https://". Automatically removing it.');
    endpoint = endpoint.replace(/^https:\/\//, '');
  }

  const key = `downmark-blog-image/${Date.now()}_${file.originalname}`;

  const params = {
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ACL: 'public-read',
    ContentType: file.mimetype,
  };

  try {
    await spacesClient.send(new PutObjectCommand(params));
    const url = `https://${bucket}.${endpoint}/${key}`;
    console.log('File uploaded successfully:', url);
    return url;
  } catch (error) {
    console.error('Upload to Spaces failed:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

module.exports = { upload, uploadToSpaces };
