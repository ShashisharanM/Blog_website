const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Load environment variables
dotenv.config({ path: './.env' });

// Debugging: Check if MONGO_URI is loaded correctly
console.log("MongoDB URI:", process.env.MONGO_URI);

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is undefined. Check your .env file.");
    }
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Database is connected successfully!');
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1); // Exit the process if DB connection fails
  }
};

// Middleware setup
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image provided!' });
  }

  cloudinary.uploader.upload_stream({ folder: 'blog_images' }, (error, result) => {
    if (error) {
      return res.status(500).json({ message: 'Cloudinary upload failed', error });
    }
    res.status(200).json({ url: result.secure_url });
  }).end(req.file.buffer); 
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server is running on port ${PORT}`);
});
