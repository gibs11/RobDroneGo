import IFloorMapOutDTO, { Connection, ConnectionType, FloorElement } from '../dto/out/IFloorMapOutDTO';

export class FloorPlanMap {
  public static toDTO(
    size: {
      width: number;
      length: number;
    },
    map: number[][],
    connections: Connection[],
    floorElements: FloorElement[],
  ): IFloorMapOutDTO {
    return {
      size: size,
      map: map,
      connections: connections,
      floorElements: floorElements,
    };
  }

  public static ConnectionToDTO(
    connectionType: ConnectionType,
    connectionCoords: number[],
    destFloorId: { [key: number]: string },
    destFloorInitiCoords: number[],
    destFloorInitiDirection: number,
  ): Connection {
    return {
      connectionType: connectionType,
      connectionCoords: connectionCoords,
      destFloorId: destFloorId,
      destFloorInitiCoords: destFloorInitiCoords,
      destFloorInitiDirection: destFloorInitiDirection,
    };
  }

  public static FloorElementToDTO(initCoords: number[], finalCoords: number[], displayName: string): FloorElement {
    return {
      initCoords: initCoords,
      finalCoords: finalCoords,
      displayName: displayName,
    };
  }
}
