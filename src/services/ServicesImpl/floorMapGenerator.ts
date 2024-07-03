import { Inject, Service } from 'typedi';
import config from '../../../config';
import IFloorMapGenerator from '../IServices/IFloorMapGenerator';
import IFloorMapOutDTO, { Connection, ConnectionType, FloorElement } from '../../dto/out/IFloorMapOutDTO';
import IRoomRepo from '../IRepos/IRoomRepo';
import IElevatorRepo from '../IRepos/IElevatorRepo';
import IPassageRepo from '../IRepos/IPassageRepo';
import { Floor } from '../../domain/floor/floor';
import { Room } from '../../domain/room/Room';
import { Elevator } from '../../domain/elevator/elevator';
import { Passage } from '../../domain/passage/passage';
import { FloorPlanMap } from '../../mappers/FloorPlanMap';

@Service()
export default class FloorMapGenerator implements IFloorMapGenerator {
  constructor(
    @Inject(config.repos.room.name) private roomRepo: IRoomRepo,
    @Inject(config.repos.elevator.name) private elevatorRepo: IElevatorRepo,
    @Inject(config.repos.passage.name) private passageRepo: IPassageRepo,
  ) {}

  public async calculateFloorMap(floor: Floor): Promise<IFloorMapOutDTO> {
    const width = floor.building.dimensions.width; // Will represent the x-axis
    const length = floor.building.dimensions.length; // Will represent the y-axis

    // Will hold the representation of the floor
    const mapGrid = this.initializeMapGrid(width, length);
    // Will hold the connections between floors
    const connections: Connection[] = [];
    // Will hold the floor elements
    const floorElements: FloorElement[] = [];

    // Get all rooms in the floor
    const rooms = await this.roomRepo.findByFloorId(floor.id.toString());
    // Handle rooms updates
    this.handleRooms(mapGrid, floorElements, rooms, length, width);

    // Get all elevators in the floor
    const elevators = await this.elevatorRepo.findAllByFloorID(floor.id.toString());
    // Handle elevators updates
    this.handleElevators(mapGrid, connections, floorElements, floor, elevators);

    // Get all passages in the floor
    const passages = await this.passageRepo.findPassagesByFloorId(floor.id.toString());
    // Handle passages updates
    this.handlePassages(mapGrid, connections, floorElements, passages, floor, width, length);

    const size: { width: number; length: number } = { width: width, length: length };

    // Return a FloorMapOutDTO
    return FloorPlanMap.toDTO(size, mapGrid, connections, floorElements);
  }

  /**
   * Initialize the mapGrid with the dimensions of the floor
   *
   * @param width - The width of the floor
   * @param length - The length of the floor
   * @returns The mapGrid
   */
  private initializeMapGrid(width: number, length: number): number[][] {
    const mapGrid: number[][] = [];

    // Initialize the mapGrid
    for (let y = 0; y <= length; y++) {
      mapGrid[y] = [];
      for (let x = 0; x <= width; x++) {
        // Top left corner
        if (x === 0 && y === 0) mapGrid[y][x] = 3;
        // Bottom right corner
        else if (x === width && y === length) mapGrid[y][x] = 0;
        // Right wall
        else if (x === width) mapGrid[y][x] = 1;
        // Bottom Wall
        else if (y === length) mapGrid[y][x] = 2;
        // Left wall
        else if (x === 0) mapGrid[y][x] = 1;
        // Top wall
        else if (y === 0) mapGrid[y][x] = 2;
        else mapGrid[y][x] = 0;
      }
    }

    return mapGrid;
  }

  /**
   * Update the mapGrid with the existing rooms
   *
   * @param mapGrid - The mapGrid
   * @param floorElements - The floor elements
   * @param rooms - The rooms in the floor
   * @returns The updated mapGrid
   */
  private handleRooms(
    mapGrid: number[][],
    floorElements: FloorElement[],
    rooms: Room[],
    length: number,
    width: number,
  ): void {
    for (const room of rooms) {
      const initialX = room.dimensions.initialPosition.xPosition;
      const initialY = room.dimensions.initialPosition.yPosition;
      const finalX = room.dimensions.finalPosition.xPosition;
      const finalY = room.dimensions.finalPosition.yPosition;
      const doorX = room.doorPosition.xPosition;
      const doorY = room.doorPosition.yPosition;
      const doorOrientation = room.doorOrientation;

      // Iterate through the mapGrid, starting from the initial position of the room
      for (let y = initialY; y <= finalY; y++) {
        for (let x = initialX; x <= finalX; x++) {
          mapGrid[y][x] = 0;

          // Right wall
          if (x === finalX) mapGrid[y][x + 1] = 1;

          // Bottom Wall
          if (y === finalY) mapGrid[y + 1][x] = 2;

          // Left wall
          if (x === initialX) mapGrid[y][x] = 1;

          // Top wall
          if (y === initialY) mapGrid[y][x] = 2;

          // Top left corner
          if (x === initialX && y === initialY) mapGrid[y][x] = 3;

          // If current position is the top of the room and top of the floor, then place 3
          if (x === finalX && y == 0 && x !== width - 1) {
            mapGrid[y][x + 1] = 3;
          }

          // If the current position is the left of the room and left of the floor, then place 3
          if (y === finalY && x === 0 && y !== length - 1) {
            mapGrid[y + 1][x] = 3;
          }

          // Door
          // Update FloorElement
          let floorElement;
          if (x === doorX && y === doorY) {
            if (doorOrientation === 'NORTH') {
              mapGrid[y][x] = 5;
              floorElement = FloorPlanMap.FloorElementToDTO([x, y], [x, y], room.name.value);
            } else if (doorOrientation === 'SOUTH') {
              mapGrid[y + 1][x] = 5;
              floorElement = FloorPlanMap.FloorElementToDTO([x, y + 1], [x, y + 1], room.name.value);
            } else if (doorOrientation === 'EAST') {
              mapGrid[y][x + 1] = 4;
              floorElement = FloorPlanMap.FloorElementToDTO([x + 1, y], [x + 1, y], room.name.value);
            } else if (doorOrientation === 'WEST') {
              mapGrid[y][x] = 4;
              floorElement = FloorPlanMap.FloorElementToDTO([x, y], [x, y], room.name.value);
            }
            floorElements.push(floorElement);
          }
        }
      }
    }
  }

  /**
   * Update the mapGrid with the existing elevators
   *
   * @param mapGrid - The mapGrid
   * @param connections - The connections in the floor
   * @param floorElements - The floor elements
   * @param floor - The floor
   * @param elevators - The elevators in the floor
   * @returns The updated mapGrid
   */
  private handleElevators(
    mapGrid: number[][],
    connections: Connection[],
    floorElements: FloorElement[],
    floor: Floor,
    elevators: Elevator[],
  ) {
    for (const elevator of elevators) {
      const x = elevator.position.xposition;
      const y = elevator.position.yposition;
      const orientation = elevator.orientation;

      // Update connections
      const destFloorId: { [key: number]: string } = {};
      for (const currentFloor of elevator.floors) {
        if (floor.id.toString() !== currentFloor.id.toString())
          destFloorId[currentFloor.floorNumber.value] = currentFloor.building.code.value;
      }
      // Connections provided by the elevator
      const connection = FloorPlanMap.ConnectionToDTO(
        ConnectionType.ELEVATOR,
        [x, y],
        destFloorId,
        [x, y],
        this.calculateElevatorDirection(orientation),
      );
      connections.push(connection);

      // Update FloorElement
      const floorElement = FloorPlanMap.FloorElementToDTO([x, y], [x, y], elevator.uniqueNumber.toString());
      floorElements.push(floorElement);

      // Place the extra 6 on the right position
      if (orientation === 'NORTH') {
        mapGrid[y][x] = 6;
      } else if (orientation === 'SOUTH') {
        mapGrid[y][x] = 7;
      } else if (orientation === 'EAST') {
        mapGrid[y][x] = 8;
      } else if (orientation === 'WEST') {
        mapGrid[y][x] = 9;
      }
    }
  }

  /**
   * Update the mapGrid with the existing passages
   *
   * @param mapGrid - The mapGrid
   * @param connections
   * @param floorElements - The floor elements
   * @param passages - The passages in the floor
   * @param floor - The floor
   * @param width - The width of the floor
   * @param length - The length of the floor
   * @returns The updated mapGrid
   */
  private handlePassages(
    mapGrid: number[][],
    connections: Connection[],
    floorElements: FloorElement[],
    passages: Passage[],
    floor: Floor,
    width: number,
    length: number,
  ) {
    for (const passage of passages) {
      let firstX;
      let firstY;
      let lastX;
      let lastY;
      let endFirstX;
      let endFirstY;
      let endLastX;
      let endLastY;

      const destFloorId: { [key: number]: string } = {};
      if (passage.startPoint.floor.id.toString() === floor.id.toString()) {
        firstX = passage.startPoint.firstCoordinates.x;
        firstY = passage.startPoint.firstCoordinates.y;
        lastX = passage.startPoint.lastCoordinates.x;
        lastY = passage.startPoint.lastCoordinates.y;
        destFloorId[passage.endPoint.floor.floorNumber.value] = passage.endPoint.floor.building.code.value;

        // Update Connections - it has to have this floor's position
        const floorElement = FloorPlanMap.FloorElementToDTO([firstX, firstY], [lastX, lastY], '');
        floorElements.push(floorElement);

        // To calculate the direction of the end passage
        endFirstX = passage.endPoint.firstCoordinates.x;
        endFirstY = passage.endPoint.firstCoordinates.y;
        endLastX = passage.endPoint.lastCoordinates.x;
        endLastY = passage.endPoint.lastCoordinates.y;

        // Update Connections
        const startConnection = FloorPlanMap.ConnectionToDTO(
          ConnectionType.PASSAGE,
          [passage.startPoint.firstCoordinates.x, passage.startPoint.firstCoordinates.y],
          destFloorId,
          [passage.endPoint.firstCoordinates.x, passage.endPoint.firstCoordinates.y],
          this.calculatePassageDirection(
            endFirstX,
            endFirstY,
            endLastX,
            endLastY,
            passage.endPoint.floor.building.dimensions.width,
            passage.endPoint.floor.building.dimensions.length,
          ),
        );
        const endConnection = FloorPlanMap.ConnectionToDTO(
          ConnectionType.PASSAGE,
          [passage.startPoint.lastCoordinates.x, passage.startPoint.lastCoordinates.y],
          destFloorId,
          [passage.endPoint.lastCoordinates.x, passage.endPoint.lastCoordinates.y],
          this.calculatePassageDirection(
            endFirstX,
            endFirstY,
            endLastX,
            endLastY,
            passage.endPoint.floor.building.dimensions.width,
            passage.endPoint.floor.building.dimensions.length,
          ),
        );
        connections.push(startConnection);
        connections.push(endConnection);
      } else {
        firstX = passage.endPoint.firstCoordinates.x;
        firstY = passage.endPoint.firstCoordinates.y;
        lastX = passage.endPoint.lastCoordinates.x;
        lastY = passage.endPoint.lastCoordinates.y;
        destFloorId[passage.startPoint.floor.floorNumber.value] = passage.startPoint.floor.building.code.value;

        // To calculate the direction of the end passage
        endFirstX = passage.startPoint.firstCoordinates.x;
        endFirstY = passage.startPoint.firstCoordinates.y;
        endLastX = passage.startPoint.lastCoordinates.x;
        endLastY = passage.startPoint.lastCoordinates.y;

        // Update Connections
        const startConnection = FloorPlanMap.ConnectionToDTO(
          ConnectionType.PASSAGE,
          [passage.endPoint.firstCoordinates.x, passage.endPoint.firstCoordinates.y],
          destFloorId,
          [passage.startPoint.firstCoordinates.x, passage.startPoint.firstCoordinates.y],
          this.calculatePassageDirection(
            endFirstX,
            endFirstY,
            endLastX,
            endLastY,
            passage.startPoint.floor.building.dimensions.width,
            passage.startPoint.floor.building.dimensions.length,
          ),
        );
        const endConnection = FloorPlanMap.ConnectionToDTO(
          ConnectionType.PASSAGE,
          [passage.endPoint.lastCoordinates.x, passage.endPoint.lastCoordinates.y],
          destFloorId,
          [passage.startPoint.lastCoordinates.x, passage.startPoint.lastCoordinates.y],
          this.calculatePassageDirection(
            endFirstX,
            endFirstY,
            endLastX,
            endLastY,
            passage.startPoint.floor.building.dimensions.width,
            passage.startPoint.floor.building.dimensions.length,
          ),
        );
        connections.push(startConnection);
        connections.push(endConnection);
      }

      if (((firstX === 0 && lastX === 1) || (firstX === 1 && lastX === 0)) && firstY === 0) {
        if (firstX < lastX) {
          mapGrid[firstY][firstX] = 20;
          mapGrid[lastY][lastX] = 13;
        } else {
          mapGrid[firstY][firstX] = 13;
          mapGrid[lastY][lastX] = 20;
        }
      } else if (((firstY === 0 && lastY === 1) || (firstY === 1 && lastY === 0)) && firstX === 0) {
        if (firstY < lastY) {
          mapGrid[firstY][firstX] = 21;
          mapGrid[lastY][lastX] = 15;
        } else {
          mapGrid[firstY][firstX] = 15;
          mapGrid[lastY][lastX] = 21;
        }
      }
      // Check if is in top wall
      else if (firstY === 0 && lastY === 0) {
        if (firstX < lastX) {
          mapGrid[firstY][firstX] = 12;
          mapGrid[lastY][lastX] = 13;
        } else {
          mapGrid[firstY][firstX] = 13;
          mapGrid[lastY][lastX] = 12;
        }
      }
      // Check if is in left wall
      else if (firstX === 0 && lastX === 0) {
        if (firstY < lastY) {
          mapGrid[firstY][firstX] = 14;
          mapGrid[lastY][lastX] = 15;
        } else {
          mapGrid[firstY][firstX] = 15;
          mapGrid[lastY][lastX] = 14;
        }
      }
      // Check if is in right wall
      else if (firstX === width - 1) {
        if (firstY < lastY) {
          mapGrid[firstY][firstX + 1] = 16;
          mapGrid[lastY][lastX + 1] = 17;
        } else {
          mapGrid[firstY][firstX + 1] = 17;
          mapGrid[lastY][lastX + 1] = 16;
        }
      }
      // Check if is in bottom wall
      else if (firstY === length - 1) {
        if (firstX < lastX) {
          mapGrid[firstY + 1][firstX] = 18;
          mapGrid[lastY + 1][lastX] = 19;
        } else {
          mapGrid[firstY + 1][firstX] = 19;
          mapGrid[lastY + 1][lastX] = 18;
        }
      }
    }
  }

  /**
   * Calculate the direction to be applied to the player once he enters the elevator
   *
   * @param orientation
   * @returns number - The direction to be applied to the player
   */
  private calculateElevatorDirection(orientation: string): number {
    switch (orientation) {
      case 'NORTH':
        return 180;
      case 'SOUTH':
        return 0;
      case 'EAST':
        return 90;
      case 'WEST':
        return 270;
    }
  }

  /**
   * Calculate the passage direction
   * If the passage is horizontal and on x-axis, the direction is 0.5
   * If the pssage is horizotnal and parallel to x-axis, the direction is 0.0
   * If the passage is vertical and on y-axis, the direction is 0.75
   * If the passage is vertical and parallel to y-axis, the direction is 0.25
   *
   *
   * @param firstX - The first x coordinate
   * @param firstY - The first y coordinate
   * @param lastX - The last x coordinate
   * @param lastY - The last y coordinate
   * @param width - The width of the building
   * @param length - The length of the building
   * @private
   */
  private calculatePassageDirection(
    firstX: number,
    firstY: number,
    lastX: number,
    lastY: number,
    width: number,
    length: number,
  ): number {
    if (firstX === 0 && lastX === 0) {
      return 90;
    } else if (firstY === 0 && lastY === 0) {
      return 0;
    } else if (firstX === width - 1 && lastX === width - 1) {
      return 270;
    } else if (firstY === length - 1 && lastY === length - 1) {
      return 180;
    }
  }
}
