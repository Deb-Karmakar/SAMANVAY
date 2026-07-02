import multer from 'multer';
import uploadService from '../services/uploadService.js';

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
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const url = uploadService.getUploadUrl(req.protocol, req.get('host'), req.file.filename);
        res.status(200).json({ url });
    } catch (error) {
        res.status(400).json({ message: 'Upload failed', error: error.message });
    }
};

export { upload, uploadImage };