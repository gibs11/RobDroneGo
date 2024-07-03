import { IRoomPersistence } from '../../dataschema/IRoomPersistence';
import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema(
  {
    domainId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Please enter room name'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please enter room description'],
    },
    category: {
      type: String,
      required: [true, 'Please enter room category'],
    },
    dimensions: {
      initialPosition: {
        xPosition: {
          type: Number,
          required: [true, 'Please enter room initial x position'],
        },
        yPosition: {
          type: Number,
          required: [true, 'Please enter room initial y position'],
        },
      },
      finalPosition: {
        xPosition: {
          type: Number,
          required: [true, 'Please enter room final x position'],
        },
        yPosition: {
          type: Number,
          required: [true, 'Please enter room final y position'],
        },
      },
    },
    doorPosition: {
      xPosition: {
        type: Number,
        required: [true, 'Please enter room door x position'],
      },
      yPosition: {
        type: Number,
        required: [true, 'Please enter room door y position'],
      },
    },
    doorOrientation: {
      type: String,
      required: [true, 'Please enter room door orientation'],
    },
    floorId: {
      type: String,
      required: [true, 'Please enter room floor id'],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IRoomPersistence & mongoose.Document>('Room', RoomSchema);
