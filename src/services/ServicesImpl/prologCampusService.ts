import { Service, Inject } from 'typedi';
import config from '../../../config';
import { FailureType, Result } from '../../core/logic/Result';

import IElevatorRepo from '../IRepos/IElevatorRepo';
import IBuildingRepo from '../IRepos/IBuildingRepo';
import IFloorRepo from '../IRepos/IFloorRepo';
import IPassageRepo from '../IRepos/IPassageRepo';
import IPrologCampusService from '../IServices/IPrologCampusService';

import IPrologCampusDTO from '../../dto/IPrologCampusDTO';
import { ElevatorOrientation } from '../../domain/elevator/elevatorOrientation';

@Service()
export default class PrologCampusService implements IPrologCampusService {
  constructor(
    @Inject(config.repos.building.name) private buildingRepo: IBuildingRepo,
    @Inject(config.repos.elevator.name) private elevatorRepo: IElevatorRepo,
    @Inject(config.repos.floor.name) private floorRepo: IFloorRepo,
    @Inject(config.repos.passage.name) private passageRepo: IPassageRepo,
    @Inject('logger') private logger,
  ) {}

  public async prologCampusFacts(): Promise<Result<IPrologCampusDTO>> {
    try {
      const prologCampus: IPrologCampusDTO = {
        floors: [],
        elevators: [],
        passages: [],
        connects: [],
      };

      // Get the campus buildings
      const buildings = await this.buildingRepo.findAll();

      for (const building of buildings) {
        // Add the campus floors
        const floors = await this.floorRepo.findByBuildingId(building.id.toString());
        const floorsIds = floors.map(floor => floor.id.toString());
        const string = 'floors(' + building.id.toString() + ',[' + floorsIds + '])';
        prologCampus.floors.push(string);

        // Add the campus elevators
        const elevators = await this.elevatorRepo.findByBuildingId(building.id.toString());

        for (const elevator of elevators) {
          const elevatorFloors = elevator.floors.map(floor => floor.id.toString());

          let xposition;

          let yposition;

          switch (elevator.orientation) {
            case ElevatorOrientation.NORTH:
              xposition = elevator.position.xposition + 1;
              yposition = elevator.position.yposition;
              break;
            case ElevatorOrientation.SOUTH:
              xposition = elevator.position.xposition + 1;
              yposition = elevator.position.yposition + 2;
              break;
            case ElevatorOrientation.EAST:
              xposition = elevator.position.xposition + 2;
              yposition = elevator.position.yposition + 1;
              break;
            case ElevatorOrientation.WEST:
              xposition = elevator.position.xposition;
              yposition = elevator.position.yposition + 1;
              break;
          }
          const string =
            'elevator(' +
            building.id.toString() +
            ',[' +
            elevatorFloors +
            '],cel(' +
            xposition.toString() +
            ',' +
            yposition.toString() +
            '))';

          prologCampus.elevators.push(string);
        }
      }

      // Get the campus passages
      const passages = await this.passageRepo.findAll();

      for (const passage of passages) {
        const passageOrg = passage.startPoint;
        const passageDest = passage.endPoint;

        const string =
          'passage(' +
          passageOrg.floor.building.id.toString() +
          ',' +
          passageDest.floor.building.id.toString() +
          ',' +
          passageOrg.floor.id.toString() +
          ',' +
          passageDest.floor.id.toString() +
          ',cel(' +
          (passageOrg.firstCoordinates.x + 1).toString() +
          ',' +
          (passageOrg.firstCoordinates.y + 1).toString() +
          '),cel(' +
          (passageDest.firstCoordinates.x + 1).toString() +
          ',' +
          (passageDest.firstCoordinates.y + 1).toString() +
          '))';

        prologCampus.passages.push(string);
      }

      // Calculate the connects

      const tempConnectsOrg = [];
      const tempConnectsDest = [];

      for (const passage of passages) {
        // Check if the passage does not already exist
        if (tempConnectsOrg.length === 0) {
          tempConnectsOrg.push(passage.startPoint.floor.building.id.toString());
          tempConnectsDest.push(passage.endPoint.floor.building.id.toString());
          continue;
        }

        let check = 0;

        for (let i = 0; i < tempConnectsOrg.length; i++) {
          if (
            (tempConnectsOrg[i] === passage.startPoint.floor.building.id.toString() &&
              tempConnectsDest[i] === passage.endPoint.floor.building.id.toString()) ||
            (tempConnectsOrg[i] === passage.endPoint.floor.building.id.toString() &&
              tempConnectsDest[i] === passage.startPoint.floor.building.id.toString())
          ) {
            check = 1;
            break;
          }
        }

        if (check === 0) {
          tempConnectsOrg.push(passage.startPoint.floor.building.id.toString());
          tempConnectsDest.push(passage.endPoint.floor.building.id.toString());
        }
      }

      // Add the connects
      for (let i = 0; i < tempConnectsOrg.length; i++) {
        const string = 'connects(' + tempConnectsOrg[i] + ',' + tempConnectsDest[i] + ')';
        prologCampus.connects.push(string);
      }

      return Result.ok<IPrologCampusDTO>(prologCampus);
    } catch (e) {
      this.logger.error(e);
      return Result.fail<IPrologCampusDTO>(e.message, FailureType.DatabaseError);
    }
  }
}
