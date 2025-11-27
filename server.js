const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const METADATA_FILE = path.join(__dirname, 'uploads', 'videos.json');

// ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(METADATA_FILE)) fs.writeFileSync(METADATA_FILE, JSON.stringify([]), 'utf8');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, safe);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB limit
});

// Serve site static files (the existing frontend)
app.use(express.static(path.join(__dirname)));
// Serve uploaded files
app.use('/uploads', express.static(UPLOAD_DIR));

// Upload endpoint
app.post('/upload', upload.single('video'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const title = req.body.title || req.file.originalname;
    const description = req.body.description || '';

    const entry = {
      id: Date.now(),
      filename: req.file.filename,
      url: '/uploads/' + req.file.filename,
      title: title,
      description: description,
      created: Date.now()
    };

    // append to metadata file
    const data = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8') || '[]');
    data.push(entry);
    fs.writeFileSync(METADATA_FILE, JSON.stringify(data, null, 2), 'utf8');

    res.json({ success: true, entry: entry });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// List uploaded videos
app.get('/videos', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8') || '[]');
    res.json(data);
  } catch (err) {
    console.error('List videos error', err);
    res.status(500).json([]);
  }
});

app.listen(PORT, () => {
  console.log('Server started on port', PORT);
  console.log('Open http://localhost:' + PORT + '/index.html');
});
