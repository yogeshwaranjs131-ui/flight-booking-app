import multer from 'multer';
import path from 'path';
import fs from 'fs'; // கோப்புறை உள்ளதா என்பதை உறுதிப்படுத்த fs ஐ இறக்குமதி செய்யவும்

// Use memory storage to handle files as buffers, which is ideal for cloud uploads
const storage = multer.memoryStorage();

// File filter to allow only specific image types
function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
}

// 'uploads' கோப்புறை backend திட்டத்தின் ரூட்டில் இருக்கும் என்று கருதுகிறோம்
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

// 'uploads' கோப்புறை இல்லையென்றால் அதை உருவாக்கவும்
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// சுயவிவரப் படங்களுக்கான வட்டு சேமிப்பகத்தை உள்ளமைக்கவும்
const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR); // 'uploads' கோப்புறைக்குள் சேமிக்கவும்
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: profileImageStorage, fileFilter });

export default upload;