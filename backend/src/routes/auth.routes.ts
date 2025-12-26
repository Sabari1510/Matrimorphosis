import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { upload } from '../config/upload';

const router = Router();

// Auth routes - register with optional photo upload
router.post('/register', upload.single('photo'), register);
router.post('/login', login);

export default router;
