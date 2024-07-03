import { IRobisepTypePersistence } from '../../dataschema/IRobisepTypePersistence';
import mongoose from 'mongoose';

const RobisepSchema = new mongoose.Schema(
  {
    domainId: {
      type: String,
      unique: true,
    },
    designation: {
      type: String,
      required: [true, 'Please enter robisepType designation'],
      unique: true,
    },
    brand: {
      type: String,
      required: [true, 'Please enter robisepType brand'],
    },
    model: {
      type: String,
      required: [true, 'Please enter robisepType model'],
    },
    tasksType: {
      type: Array,
      required: [true, 'Please enter robisepType tasksType'],
    },
  },
  {
    timestamps: true,
  },
);
export default mongoose.model<IRobisepTypePersistence & mongoose.Document>('RobisepType', RobisepSchema);
