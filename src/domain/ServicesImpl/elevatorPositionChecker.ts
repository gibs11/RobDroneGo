import { Inject, Service } from 'typedi';

import config from '../../../config';

import IPositionChecker from '../IServices/IPositionChecker';
import { Floor } from '../floor/floor';
import IElevatorRepo from '../../services/IRepos/IElevatorRepo';

@Service()
export default class ElevatorPositionChecker implements IPositionChecker {
  constructor(@Inject(config.repos.elevator.name) private elevatorRepo: IElevatorRepo) {}

  public async isPositionAvailable(
    coordinateX: number,
    coordinateY: number,
    floor: Floor,
    id: string,
  ): Promise<boolean> {
    // Check if there is an elevator in the floor.
    const elevators = await this.elevatorRepo.findAllByFloorID(floor.id.toString());

    // Check if id is in the list and remove it.
    if (elevators !== null && elevators.length > 0) {
      const index = elevators.findIndex(elevator => elevator.id.toString() === id);
      if (index > -1) {
        elevators.splice(index, 1);
      }
    }

    // If there is no elevators in the floor, the position is available.
    if (elevators === null || elevators.length === 0) {
      return true;
    }

    // If there are elevators in the floor, check if it is in the position.
    for (const elevator of elevators) {
      const xPosition = elevator.position.xposition;
      const yPosition = elevator.position.yposition;
      const orientation = elevator.orientation.toString();

      //Check if the elevator is in the position.
      if (
        xPosition !== undefined &&
        yPosition !== undefined &&
        xPosition === coordinateX &&
        yPosition === coordinateY
      ) {
        return false;
      }

      //Check if the elevator is in the door position.
      if (orientation === 'NORTH') {
        if (
          xPosition !== undefined &&
          yPosition !== undefined &&
          xPosition === coordinateX &&
          yPosition - 1 === coordinateY
        ) {
          return false;
        }
      }

      if (orientation === 'SOUTH') {
        if (
          xPosition !== undefined &&
          yPosition !== undefined &&
          xPosition === coordinateX &&
          yPosition + 1 === coordinateY
        ) {
          return false;
        }
      }

      if (orientation === 'WEST') {
        if (
          xPosition !== undefined &&
          yPosition !== undefined &&
          xPosition - 1 === coordinateX &&
          yPosition === coordinateY
        ) {
          return false;
        }
      }

      if (orientation === 'EAST') {
        if (
          xPosition !== undefined &&
          yPosition !== undefined &&
          xPosition + 1 === coordinateX &&
          yPosition === coordinateY
        ) {
          return false;
        }
      }
    }

    // If there are no elevators in the position, the position is available.
    return true;
  }
}
