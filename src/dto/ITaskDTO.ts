/**
 * Interface for the Pickup and Delivery Task DTO
 */
interface IPickUpAndDeliveryTaskDTO {
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

/**
 * Interface for the Surveillance Task DTO
 */
interface ISurveillanceTaskDTO {
  emergencyPhoneNumber: string;
  startingPointToWatch: string;
  endingPointToWatch: string;
}

/**
 * Interface for the Task DTO
 */
export default interface ITaskDTO {
  domainId: string;
  robisepType: string;
  taskCode: number;
  // The IAM ID of the user
  iamId: string;

  // Pick up and delivery task
  pickUpAndDeliveryTask?: IPickUpAndDeliveryTaskDTO;

  // Surveillance task
  surveillanceTask?: ISurveillanceTaskDTO;
}
