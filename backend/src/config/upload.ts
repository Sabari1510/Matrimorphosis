import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure memory storage
const storage = multer.memoryStorage();


// File filter - only images
// File filter - allow images and videos
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|mpeg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        console.warn(`Upload rejected: Invalid file type. Ext: ${path.extname(file.originalname)}, Mime: ${file.mimetype}`);
        cb(new Error('Only image and video files are allowed! (jpeg, jpg, png, gif, webp, mp4, webm)'));
    }
};

// Export multer upload middleware
export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});
