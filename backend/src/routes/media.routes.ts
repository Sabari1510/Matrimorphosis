import { Router, Request, Response } from 'express';
import Media from '../models/media.schema';
import mongoose from 'mongoose';

const router = Router();

// GET /api/media/:id - Serve media from MongoDB
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
            return res.status(400).json({ message: 'Invalid media ID' });
        }

        const media = await Media.findById(id);
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        res.set('Content-Type', media.contentType);
        res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.send(media.data);
    } catch (error) {
        console.error('Error serving media:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
