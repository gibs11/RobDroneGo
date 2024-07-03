import IRoomOutDTO from './IRoomOutDTO';
import IRobisepTypeOutDTO from './IRobisepTypeOutDTO';
import IRobisepOutDTO from './IRobisepOutDTO';

/**
 * Interface for the Pickup and Delivery Task DTO
 */
export interface IPickUpAndDeliveryTaskOutDTO {
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
  pickUpRoom: IRoomOutDTO;
  deliveryRoom: IRoomOutDTO;
}

/**
 * Interface for the Surveillance Task DTO
 */
export interface ISurveillanceTaskOutDTO {
  emergencyPhoneNumber: string;
  startingPointToWatch: IRoomOutDTO;
  endingPointToWatch: IRoomOutDTO;
}

/**
 * Interface for the Task DTO
 */
export default interface ITaskOutDTO {
  domainId: string;
  robisepType: IRobisepTypeOutDTO;
  taskCode: number;
  email: string;
  robisep?: IRobisepOutDTO;

  // Task state
  state: string;

  // Pick up and delivery task
  pickUpAndDeliveryTask?: IPickUpAndDeliveryTaskOutDTO;

  // Surveillance task
  surveillanceTask?: ISurveillanceTaskOutDTO;
}
