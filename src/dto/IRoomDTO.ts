interface PositionDTO {
  xPosition: number;
  yPosition: number;
}

interface RoomDimensionsDTO {
  initialPosition: PositionDTO;
  finalPosition: PositionDTO;
}

export default interface IRoomDTO {
  domainId: string;
  name: string;
  description: string;
  category: string;
  dimensions: RoomDimensionsDTO;
  doorPosition: PositionDTO;
  doorOrientation: string;
  floorId: string;
}
