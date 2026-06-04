import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  name: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt: Date;
}

const ClientSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    // Avoid Mongoose adding the version key __v to document serializations
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
