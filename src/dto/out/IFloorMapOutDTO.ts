export enum ConnectionType {
  PASSAGE = 'passage',
  ELEVATOR = 'elevator',
}

export interface Connection {
  // Elevator or passage
  connectionType: ConnectionType;
  // Coordinates which have a connection, whether by passage or elevator
  connectionCoords: number[];
  // Number corresponds to the passage (always 0) or any elevator, String corresponds to the floorId
  destFloorId: { [key: number]: string };
  // Initial coordinates that the player will be placed when entering the connection
  destFloorInitiCoords: number[];
  // Initial direction that the player will be facing when entering the connection
  destFloorInitiDirection: number;
}

export interface FloorElement {
  initCoords: number[];
  finalCoords: number[];
  displayName: string;
}

export default interface IFloorMapOutDTO {
  size: {
    width: number;
    length: number;
  };
  map: number[][];
  connections: Connection[];
  floorElements: FloorElement[];
}
