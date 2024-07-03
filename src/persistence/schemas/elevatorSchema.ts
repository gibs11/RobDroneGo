import { IElevatorPersistence } from '../../dataschema/IElevatorPersistence';
import mongoose, { Schema } from 'mongoose';

const ElevatorSchema = new Schema(
  {
    domainId: {
      type: String,
      unique: true,
    },

    uniqueNumber: {
      type: Number,
      required: [true, 'Please enter elevator uniqueNumber'],
      index: true,
    },

    brand: {
      type: String,
    },

    model: {
      type: String,
    },

    serialNumber: {
      type: String,
    },

    description: {
      type: String,
    },

    elevatorPosition: {
      xposition: {
        type: Number,
        required: [true, 'Please enter elevator x position'],
        index: true,
      },
      yposition: {
        type: Number,
        required: [true, 'Please enter elevator y position'],
        index: true,
      },
    },

    orientation: {
      type: String,
      required: [true, 'Please enter elevator orientation'],
      index: true,
    },

    building: {
      type: String,
      required: [true, 'Please enter building id'],
      index: true,
    },

    floors: {
      type: [String],
      required: [true, 'Please enter floors'],
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IElevatorPersistence & mongoose.Document>('Elevator', ElevatorSchema);
