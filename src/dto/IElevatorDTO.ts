interface ElevatorPositionDTO {
  xposition: number;
  yposition: number;
}

export default interface IElevatorDTO {
  domainId: string;
  uniqueNumber: number;
  brand?: string;
  model?: string;
  serialNumber?: string;
  description?: string;
  elevatorPosition: ElevatorPositionDTO;
  orientation: string;
  building: string;
  floors: string[];
}
