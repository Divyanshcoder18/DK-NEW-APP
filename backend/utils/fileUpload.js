import multer from 'multer';
import path from 'path';
import fs from 'fs';

//  STEP 1: Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
/*
fs.mkdirSync() = "make directory synchronously"
mkdirSync('uploads') → Creates a folder named 'uploads'

*/

//  STEP 2: Configure WHERE and HOW to save files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // WHERE: Save to 'uploads/' folder
        cb(null, uploadDir);
    },

    /*
req = The HTTP request object (contains user info, headers, etc.)
file = The file being uploaded (contains info like name, size, type)
cb = "callback" function - you call this to tell Multer what to do
    */
    filename: (req, file, cb) => {
        // HOW: Create unique filename
        // Format: timestamp-randomnumber-originalname.ext
        // Example: 1703592000000-123456789.jpg
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName); // null means no error result dal dia 
    }
});

//  STEP 3: Filter - Only allow certain file types (SECURITY!)
const fileFilter = (req, file, cb) => {
    // Allowed extensions
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|mov|avi/;
    
    // Check file extension (e.g., ".jpg")
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    // Check MIME type (e.g., "image/jpeg")
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);  // ✅ Allow this file
    } else {
        cb(new Error('Only images, videos, PDFs, and documents are allowed!'));
    }
};

//  STEP 4: Create the upload middleware with all settings

//upload: Combines storage + size limit + filter
const upload = multer({
    storage: storage,                    // Use our diskStorage config
    limits: { fileSize: 10 * 1024 * 1024 }, // Max 10 MB
    fileFilter: fileFilter                
});

export default upload ; 




