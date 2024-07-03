import { IFloorPersistence } from '../../dataschema/IFloorPersistence';
import mongoose, { Schema } from 'mongoose';

const FloorSchema = new Schema(
  {
    domainId: {
      type: String,
      unique: true,
    },

    floorNumber: {
      type: Number,
      required: [true, 'Please enter floor number'],
      index: true,
    },

    floorDescription: {
      type: String,
    },

    floorPlan: {
      type: String,
    },

    buildingId: {
      type: String,
      required: [true, 'Please enter building id'],
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model<IFloorPersistence & mongoose.Document>('Floor', FloorSchema);
