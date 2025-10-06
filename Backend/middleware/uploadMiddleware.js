// Backend/middleware/uploadMiddleware.js

import multer from 'multer';
import path from 'path';

// Configure storage for PDF certificates
const certificateStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/certificates/'); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `uc-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter to accept only PDFs
const pdfFileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

export const uploadCertificate = multer({
    storage: certificateStorage,
    fileFilter: pdfFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
});