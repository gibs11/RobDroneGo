import { IPickUpAndDeliveryTaskPersistence } from '../../../dataschema/task/IPickUpAndDeliveryTaskPersistence';
import mongoose, { Schema } from 'mongoose';

const PickUpAndDeliveryTaskSchema = new Schema(
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

    pickUpPersonContact: {
      name: {
        type: String,
        required: [true, 'Please enter pick up person name'],
        index: true,
      },
      phoneNumber: {
        type: String,
        required: [true, 'Please enter pick up person phone number'],
        index: true,
      },
    },

    pickUpRoom: {
      type: String,
      required: [true, 'Please enter pick up room'],
      index: true,
    },

    deliveryPersonContact: {
      name: {
        type: String,
        required: [true, 'Please enter delivery person name'],
        index: true,
      },
      phoneNumber: {
        type: String,
        required: [true, 'Please enter delivery person phone number'],
        index: true,
      },
    },

    deliveryRoom: {
      type: String,
      required: [true, 'Please enter delivery room'],
      index: true,
    },

    description: {
      type: String,
      required: [true, 'Please enter description'],
      index: true,
    },

    confirmationCode: {
      type: Number,
      required: [true, 'Please enter confirmation code'],
      index: true,
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model<IPickUpAndDeliveryTaskPersistence & mongoose.Document>(
  'Pick Up And Delivery Task',
  PickUpAndDeliveryTaskSchema,
);
