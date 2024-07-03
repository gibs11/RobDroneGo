import { IRobisepPersistence } from '../../dataschema/IRobisepPersistence';
import mongoose from 'mongoose';

const RobisepSchema = new mongoose.Schema(
  {
    domainId: {
      type: String,
      unique: true,
    },
    nickname: {
      type: String,
      required: [true, 'Please enter robisep designation'],
    },
    serialNumber: {
      type: String,
      required: [true, 'Please enter robisep serialNumber'],
    },
    code: {
      type: String,
      required: [true, 'Please enter robisep code'],
      unique: true,
    },
    state: {
      type: String,
      required: [true, 'Please enter robisep state'],
    },
    description: {
      type: String,
      required: false,
    },
    robisepTypeId: {
      type: String,
      required: [true, 'Please enter robisep robisepTypeId'],
    },
    roomId: {
      type: String,
      required: [true, 'Please enter robisep roomId'],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IRobisepPersistence & mongoose.Document>('Robisep', RobisepSchema);
