// Backend/controllers/uploadController.js
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

const uploadImage = async (req, res) => {
    try {
        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.status(200).json({ url });
    } catch (error) {
        res.status(400).json({ message: 'Upload failed', error: error.message });
    }
};

export { upload, uploadImage };