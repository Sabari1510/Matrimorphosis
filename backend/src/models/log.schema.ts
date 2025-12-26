import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
    level: string;
    message: string;
    meta: any;
    timestamp: Date;
}

const LogSchema: Schema = new Schema({
    level: { type: String, required: true },
    message: { type: String, required: true },
    meta: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<ILog>('Log', LogSchema);
