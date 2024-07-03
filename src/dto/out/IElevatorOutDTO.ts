import IFloorOutDTO from './IFloorOutDTO';
import IBuildingOutDTO from './IBuildingOutDTO';

interface ElevatorPositionDTO {
  xposition: number;
  yposition: number;
}

export default interface IElevatorOutDTO {
  domainId: string;
  uniqueNumber: number;
  brand?: string;
  model?: string;
  serialNumber?: string;
  description?: string;
  elevatorPosition: ElevatorPositionDTO;
  orientation: string;
  building: IBuildingOutDTO;
  floors: IFloorOutDTO[];
}
