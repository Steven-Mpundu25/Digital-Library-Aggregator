const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');
const app = express();

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static folder for serving uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',          // Replace with your MySQL username
    password: '',          // Replace with your MySQL password
    database: 'digital_library'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ', err);
    } else {
        console.log('Connected to MySQL database.');
    }
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /pdf|doc|docx|mp4|mp3/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);
        if (extName && mimeType) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, DOCX, MP4, and MP3 files are allowed!'));
        }
    }
});

// POST route for form submission
app.post('/submit-resource', upload.single('file'), (req, res) => {
    const {
        name,
        email,
        role,
        title,
        type,
        author,
        publication_date,
        description,
        keywords,
        access_level
    } = req.body;

    // File path from upload
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Validate required fields
    if (!name || !email || !role || !title || !type || !author || !publication_date || !description || !access_level || !filePath) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Insert data into MySQL
    const query = `
        INSERT INTO submissions (
            name, email, role, title, type, author, publication_date, description, keywords, file_url, access_level
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [name, email, role, title, type, author, publication_date, description, keywords, filePath, access_level];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting data into database: ', err);
            return res.status(500).json({ error: 'Database error occurred.' });
        }
        return res.status(200).json({ message: 'Resource submitted successfully!', resourceId: result.insertId });
    });
});

// Error handling for file uploads
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(500).json({ error: err.message });
    }
    next();
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});