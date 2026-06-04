import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  clientId: mongoose.Types.ObjectId;
  clientName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  paidAmount: number;
  studioRoom?: string;
  notes?: string;
  createdAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    clientName: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled', 'completed'],
      default: 'pending',
      required: true,
    },
    amount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'partial'],
      default: 'pending',
      required: true,
    },
    paidAmount: { type: Number, default: 0, required: true },
    studioRoom: { type: String },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
