import { IPassagePersistence } from '../../dataschema/IPassagePersistence';
import mongoose from 'mongoose';

const PassageSchema = new mongoose.Schema(
  {
    domainId: {
      type: String,
      unique: true,
    },
    passageStartPoint: {
      floorId: {
        type: String,
        required: true,
        index: true,
      },
      firstCoordinates: {
        x: {
          type: Number,
          required: true,
          index: true,
        },
        y: {
          type: Number,
          required: true,
          index: true,
        },
      },
      lastCoordinates: {
        x: {
          type: Number,
          required: true,
          index: true,
        },
        y: {
          type: Number,
          required: true,
          index: true,
        },
      },
    },
    passageEndPoint: {
      floorId: {
        type: String,
        required: true,
        index: true,
      },
      firstCoordinates: {
        x: {
          type: Number,
          required: true,
          index: true,
        },
        y: {
          type: Number,
          required: true,
          index: true,
        },
      },
      lastCoordinates: {
        x: {
          type: Number,
          required: true,
          index: true,
        },
        y: {
          type: Number,
          required: true,
          index: true,
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IPassagePersistence & mongoose.Document>('Passage', PassageSchema);
