const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const spacesClient = require('../config/spaces');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

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
    cb(new Error('Only images are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const uploadToSpaces = async (file) => {
  // Validate environment variables
  if (!process.env.DO_SPACES_BUCKET) {
    throw new Error('DO_SPACES_BUCKET environment variable is not set');
  }
  if (!process.env.DO_SPACES_ENDPOINT) {
    throw new Error('DO_SPACES_ENDPOINT environment variable is not set');
  }

  const key = `downmark-blog-image/${Date.now()}_${file.originalname}`;
  const params = {
    Bucket: process.env.DO_SPACES_BUCKET, // Fixed to plural SPACES
    Key: key,
    Body: file.buffer,
    ACL: 'public-read',
    ContentType: file.mimetype,
  };

  try {
    await spacesClient.send(new PutObjectCommand(params));
    return `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_ENDPOINT}/${key}`; // Fixed to plural SPACES
  } catch (error) {
    console.error('Upload to Spaces failed:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

module.exports = { upload, uploadToSpaces };