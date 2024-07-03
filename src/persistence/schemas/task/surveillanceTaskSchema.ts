import { ISurveillanceTaskPersistence } from '../../../dataschema/task/ISurveillanceTaskPersistence';
import mongoose, { Schema } from 'mongoose';

const SurveillanceTaskSchema = new Schema(
  {
    domainId: {
      type: String,
      unique: true,
    },

    robisepTypeId: {
      type: String,
      required: [true, 'Please enter robisep type id'],
      index: true,
    },

    robisepId: {
      type: String,
    },

    taskCode: {
      type: Number,
      required: [true, 'Please enter task code'],
      index: true,
    },

    email: {
      type: String,
      required: [true, 'Please enter email'],
      index: true,
    },

    taskState: {
      type: String,
      required: [true, 'Please enter task state'],
      index: true,
    },

    emergencyPhoneNumber: {
      type: String,
      required: [true, 'Please enter emergency phone number'],
      index: true,
    },

    startingPointToWatchId: {
      type: String,
      required: [true, 'Please enter starting point to watch id'],
      index: true,
    },

    endingPointToWatchId: {
      type: String,
      required: [true, 'Please enter ending point to watch id'],
      index: true,
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model<ISurveillanceTaskPersistence & mongoose.Document>(
  'Surveillance Task',
  SurveillanceTaskSchema,
);
