import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
    },
    fileFilter: (req, file, cb) => {
        // MIME type from header (cheap, fast check)
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only JPG, PNG and WebP are allowed.'));
        }
        cb(null, true);
    },
});