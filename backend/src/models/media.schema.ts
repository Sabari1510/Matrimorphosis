import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
    filename: string;
    contentType: string;
    data: Buffer;
    uploadDate: Date;
}

const MediaSchema: Schema = new Schema({
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
    uploadDate: { type: Date, default: Date.now }
});

export default mongoose.model<IMedia>('Media', MediaSchema);
