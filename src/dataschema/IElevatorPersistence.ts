export interface IElevatorPersistence {
  _id: string;
  uniqueNumber: number;
  brand: string;
  model: string;
  serialNumber: string;
  description: string;
  elevatorPosition: {
    xposition: number;
    yposition: number;
  };
  orientation: string;
  building: string;
  floors: string[];
}
