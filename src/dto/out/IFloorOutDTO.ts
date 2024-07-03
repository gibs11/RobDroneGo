import IBuildingOutDTO from './IBuildingOutDTO';

/**
 * Interface for the Floor Plan DTO
 */
interface IFloorPlanDTO {
  planFloorNumber: number;
  planFloorSize: {
    width: number;
    height: number;
  };
  floorPlanGrid: number[][];
  floorPlanRooms?: {
    roomName: string;
    roomCoordinates: { x: number; y: number }[];
    roomDoorCoordinates: { x: number; y: number };
  }[];
  floorPlanElevator?: {
    elevatorNumber: number;
    elevatorCoordinates: { x: number; y: number };
  }[];
  floorPlanPassages?: {
    toFloor: string;
    passageCoordinates: { x: number; y: number };
  }[];
  floorWallTexture: string;
  floorDoorTexture: string;
  floorElevatorTexture: string;
}

/**
 * Interface for the Floor DTO
 */
export default interface IFloorOutDTO {
  domainId: string;
  floorNumber: number;
  floorDescription?: string;
  building: IBuildingOutDTO;
  floorPlan?: IFloorPlanDTO;
}
