import { Inject, Service } from 'typedi';

import config from '../../../config';

import { FailureType, Result } from '../../core/logic/Result';

import IPrologFloorPlanService from '../IServices/IPrologFloorPlanService';

import IPrologFloorPlanDTO from '../../dto/IPrologFloorPlanDTO';

import IFloorRepo from '../IRepos/IFloorRepo';
import IRoomRepo from '../IRepos/IRoomRepo';
import IElevatorRepo from '../IRepos/IElevatorRepo';

import { ElevatorOrientation } from '../../domain/elevator/elevatorOrientation';
import { DoorOrientation } from '../../domain/room/DoorOrientation';
import { Room } from '../../domain/room/Room';

@Service()
export default class PrologFloorPlanService implements IPrologFloorPlanService {
  constructor(
    // Services to obtain floors, passages and elevators
    @Inject(config.repos.floor.name) private floorRepo: IFloorRepo,
    @Inject(config.repos.room.name) private roomRepo: IRoomRepo,
    @Inject(config.repos.elevator.name) private elevatorRepo: IElevatorRepo,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject('logger') private logger: any,
  ) {}

  public async obtainFloorPlan(floorId: string): Promise<Result<IPrologFloorPlanDTO>> {
    // Verify if the floor exists
    const floorExists = await this.floorRepo.findByDomainId(floorId);
    if (!floorExists) {
      return Result.fail<IPrologFloorPlanDTO>(
        `Floor with id ${floorId} does not exist`,
        FailureType.EntityDoesNotExist,
      );
    }

    // Preparation of the floor plan
    const floorHeight = floorExists.building.dimensions.length;
    const floorWidth = floorExists.building.dimensions.width;

    // Floor plan
    const floorPlan: number[][] = new Array(floorHeight);
    for (let rows = 0; rows < floorHeight; rows++) {
      floorPlan[rows] = new Array(floorWidth);
    }

    // Rooms for the floor
    const rooms = await this.roomRepo.findByFloorId(floorId);

    for (let row = 0; row < floorHeight; row++) {
      for (let column = 0; column < floorWidth; column++) {
        // Check if a cell is inside a room
        if (this.isCellInRoom(row, column, rooms) && rooms.length > 0) {
          floorPlan[row][column] = 1;
        } else {
          floorPlan[row][column] = 0;
        }
      }
    }

    if (rooms.length > 0) {
      rooms.forEach(room => {
        switch (room.doorOrientation) {
          case DoorOrientation.SOUTH:
            floorPlan[room.doorPosition.yPosition + 1][room.doorPosition.xPosition] = 0;
            break;
          case DoorOrientation.NORTH:
            floorPlan[room.doorPosition.yPosition - 1][room.doorPosition.xPosition] = 0;
            break;
          case DoorOrientation.EAST:
            floorPlan[room.doorPosition.yPosition][room.doorPosition.xPosition + 1] = 0;
            break;
          case DoorOrientation.WEST:
            floorPlan[room.doorPosition.yPosition][room.doorPosition.xPosition - 1] = 0;
            break;
        }
      });
    }

    // Elevators for the floor
    const elevators = await this.elevatorRepo.findAllByFloorID(floorId);

    if (elevators.length > 0) {
      elevators.forEach(elevator => {
        // Remove the occupied state of the cells that are occupied by elevators
        floorPlan[elevator.position.yposition][elevator.position.xposition] = 1;

        switch (elevator.orientation) {
          case ElevatorOrientation.SOUTH:
            floorPlan[elevator.position.yposition + 1][elevator.position.xposition] = 0;
            break;
          case ElevatorOrientation.NORTH:
            floorPlan[elevator.position.yposition - 1][elevator.position.xposition] = 0;
            break;
          case ElevatorOrientation.EAST:
            floorPlan[elevator.position.yposition][elevator.position.xposition + 1] = 0;
            break;
          case ElevatorOrientation.WEST:
            floorPlan[elevator.position.yposition][elevator.position.xposition - 1] = 0;
            break;
        }
      });
    }

    // DTO to return (floor plan is an array of strings, each string representing a fact of type: m(col, row, value))
    const prologFloorPlan: IPrologFloorPlanDTO = {
      floorPlanHeight: floorHeight,
      floorPlanWidth: floorWidth,
      floorPlanCells: [],
    };

    // Fill the floor plan to return
    for (let row = 0; row < floorHeight; row++) {
      for (let column = 0; column < floorWidth; column++) {
        prologFloorPlan.floorPlanCells.push(`m(${floorId},${column + 1},${row + 1},${floorPlan[row][column]})`);
      }
    }

    // Return the floor plan
    return Result.ok<IPrologFloorPlanDTO>(prologFloorPlan);
  }

  private isCellInRoom(row: number, column: number, rooms: Room[]): boolean {
    for (const room of rooms) {
      // Compare the cell with the room coords
      if (
        room.dimensions.initialPosition.yPosition <= row &&
        row <= room.dimensions.finalPosition.yPosition &&
        room.dimensions.initialPosition.xPosition <= column &&
        column <= room.dimensions.finalPosition.xPosition
      ) {
        return true;
      }
    }

    // Cell is not in room
    return false;
  }
}
