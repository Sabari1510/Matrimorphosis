import { Router, Request, Response } from 'express';
import Media from '../models/media.schema';

const router = Router();

// Get media by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const media = await Media.findById(req.params.id);

        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        res.set('Content-Type', media.contentType);
        res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.send(media.data);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving media' });
    }
});

export default router;
