import { IBuildingPersistence } from '../../dataschema/IBuildingPersistence';
import mongoose, { Schema } from 'mongoose';

const BuildingSchema = new Schema(
  {
    domainId: {
      type: String,
      unique: true,
    },

    buildingName: {
      type: String,
    },

    buildingDimensions: {
      width: {
        type: Number,
        required: [true, 'Please enter building width'],
        index: true,
      },
      length: {
        type: Number,
        required: [true, 'Please enter building length'],
        index: true,
      },
    },

    buildingDescription: {
      type: String,
    },

    buildingCode: {
      type: String,
      required: [true, 'Please enter building code'],
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IBuildingPersistence & mongoose.Document>('Building', BuildingSchema);
