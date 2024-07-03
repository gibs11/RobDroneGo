export interface IPickUpAndDeliveryTaskPersistence {
  _id: string;
  robisepType: string;
  robisepId: string | null;
  taskCode: number;
  email: string;
  taskState: string;
  pickUpPersonContact: {
    name: string;
    phoneNumber: string;
  };
  deliveryPersonContact: {
    name: string;
    phoneNumber: string;
  };
  description: string;
  confirmationCode: number;
  pickUpRoom: string;
  deliveryRoom: string;
}
