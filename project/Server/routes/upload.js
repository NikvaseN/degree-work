import checkAuth from '../utils/checkAuth.js';
import multer from "multer"
import express from 'express';
import path from 'path';
import crypto from 'crypto';

const app = express();

// Функция для фильтрации файлов по типу
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
        cb(null, true);
    } else {
        cb(new Error('Допустимы только файлы типов JPEG, JPG, PNG, GIF'), false);
    }
};

const storage = multer.diskStorage({
	destination: (req,res, cb) =>{
		cb(null, 'uploads')
	},
	filename: (_, file, cb) =>{
		cb(null, file.originalname)
	},
});

const upload = multer({ storage, fileFilter});

app.use('/uploads', express.static('uploads'));

app.post('/uploads', checkAuth, upload.single('image'), (req,res) => {
	res.json({
		url : `/uploads/${req.file.originalname}`,
	});
});

export default app