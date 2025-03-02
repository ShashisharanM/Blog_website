const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const cloudinary = require('cloudinary').v2;

// Load environment variables
dotenv.config({ path: './.env' });

// Ensure required environment variables are set
if (!process.env.MONGO_URI || !process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
  console.error("❌ Missing environment variables. Check your .env file.");
  process.exit(1);
}

// Debugging: Check if MongoDB URI is loaded correctly
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
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Database is connected successfully!');
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
};

// Middleware setup
app.use(cookieParser());
app.use(express.json());

// ✅ Fix CORS issue
const allowedOrigins = [
  "http://localhost:5173", // Local frontend
  "https://blog-website-shashisharans-projects.vercel.app", // Deployed frontend
  "https://blog-website-git-main-shashisharans-projects.vercel.app" // Vercel preview
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🚫 Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
}));

// Debugging middleware to log request origins
app.use((req, res, next) => {
  console.log("🔍 Incoming Request Origin:", req.get("Origin") || "🚫 No Origin (Non-Browser Request)");
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary image upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image provided!' });
  }

  cloudinary.uploader.upload_stream(
    { folder: 'blog_images' },
    (error, result) => {
      if (error) {
        console.error("❌ Cloudinary Upload Error:", error);
        return res.status(500).json({ message: 'Cloudinary upload failed', error });
      }
      res.status(200).json({ url: result.secure_url });
    }
  ).end(req.file.buffer);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log("==> Your service is live 🎉");
});
