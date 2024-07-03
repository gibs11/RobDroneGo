import { Service, Inject } from 'typedi';

import IElevatorRepo from '../services/IRepos/IElevatorRepo';
import { Elevator } from '../domain/elevator/elevator';
import { ElevatorMap } from '../mappers/ElevatorMap';

import { Document, FilterQuery, Model } from 'mongoose';
import { IElevatorPersistence } from '../dataschema/IElevatorPersistence';
import { ElevatorID } from '../domain/elevator/elevatorID';
import { Floor } from '../domain/floor/floor';

@Service()
export default class ElevatorRepo implements IElevatorRepo {
  constructor(@Inject('elevatorSchema') private elevatorSchema: Model<IElevatorPersistence & Document>) {}

  public async exists(elevator: Elevator): Promise<boolean> {
    const idX = elevator.id instanceof ElevatorID ? (<ElevatorID>elevator.id).toValue() : elevator.id;

    const query = { domainId: idX };
    const elevatorDocument = await this.elevatorSchema.findOne(query as FilterQuery<IElevatorPersistence & Document>);

    return !!elevatorDocument === true;
  }

  public async save(elevator: Elevator): Promise<Elevator> {
    const query = { domainId: elevator.id.toString() };
    const elevatorDocument = await this.elevatorSchema.findOne(query);

    try {
      if (elevatorDocument === null) {
        const rawElevator: any = ElevatorMap.toPersistence(elevator);

        const elevatorCreated = await this.elevatorSchema.create(rawElevator);

        return ElevatorMap.toDomain(elevatorCreated);
      } else {
        elevatorDocument.id = elevator.id.toString();
        elevatorDocument.uniqueNumber = elevator.uniqueNumber;
        elevatorDocument.elevatorPosition.xposition = elevator.position.xposition;
        elevatorDocument.elevatorPosition.yposition = elevator.position.yposition;
        elevatorDocument.orientation = elevator.orientation.toString();
        elevatorDocument.building = elevator.building.id.toString();
        elevatorDocument.floors = elevator.floors.map(floor => floor.id.toString());

        // Allow for null elevator description
        if (elevator.description) elevatorDocument.description = elevator.description.value;
        else elevatorDocument.description = null;

        // Allow for null brand
        if (elevator.brand) elevatorDocument.brand = elevator.brand.value;
        else elevatorDocument.brand = null;

        // Allow for null model
        if (elevator.model) elevatorDocument.model = elevator.model.value;
        else elevatorDocument.model = null;

        // Allow for null serialNumber
        if (elevator.serialNumber) elevatorDocument.serialNumber = elevator.serialNumber.value;
        else elevatorDocument.serialNumber = null;

        await elevatorDocument.save();

        return elevator;
      }
    } catch (err) {
      throw err;
    }
  }

  public async findAll(): Promise<Elevator[]> {
    const elevatorRecords = await this.elevatorSchema.find({});

    if (elevatorRecords && elevatorRecords.length > 0) {
      // If records are found, map them to domain objects and return the array
      const elevators = await Promise.all(
        elevatorRecords.map(async elevatorRecord => {
          return await ElevatorMap.toDomain(elevatorRecord);
        }),
      );
      return elevators;
    } else {
      // If no records are found, return an empty array instead of null
      return [];
    }
  }

  /**
   *
   * This method finds an elevator by its domainId
   *
   * @param elevatorId  the domainId of the elevator to be found
   * @returns
   */
  public async findByDomainId(elevatorId: string): Promise<Elevator> {
    const query = { domainId: elevatorId };
    const elevatorRecord = await this.elevatorSchema.findOne(query as FilterQuery<IElevatorPersistence & Document>);

    if (elevatorRecord != null) {
      return ElevatorMap.toDomain(elevatorRecord);
    } else return null;
  }

  /**
   * This method finds all elevators by its buildingId
   *
   * @param buildingId the buildingId of the building to be found
   * @returns A promise that resolves to an array of Elevator objects, or an empty array if no elevators are found.
   */
  public async findByBuildingId(buildingId: string): Promise<Elevator[]> {
    const query = { building: buildingId };
    const elevatorRecords = await this.elevatorSchema.find(query as FilterQuery<IElevatorPersistence & Document>);

    if (elevatorRecords && elevatorRecords.length > 0) {
      // If records are found, map them to domain objects and return the array
      const elevators = await Promise.all(
        elevatorRecords.map(async elevatorRecord => {
          return await ElevatorMap.toDomain(elevatorRecord);
        }),
      );
      return elevators;
    } else {
      // If no records are found, return an empty array instead of null
      return [];
    }
  }

  /**
   *
   * This method finds an elevator by its floorCode
   *
   * @param floorCode  the floorCode of the floor to be found
   * @returns
   */
  public async findAllByFloorID(floorCode: string): Promise<Elevator[]> {
    const query = { floors: { $in: [floorCode] } };
    const elevatorRecords = await this.elevatorSchema.find(query as FilterQuery<IElevatorPersistence & Document>);

    if (elevatorRecords && elevatorRecords.length > 0) {
      // If records are found, map them to domain objects and return the array
      const elevators = await Promise.all(
        elevatorRecords.map(async elevatorRecord => {
          return await ElevatorMap.toDomain(elevatorRecord);
        }),
      );
      return elevators;
    } else {
      // If no records are found, return an empty array instead of null
      return [];
    }
  }

  /**
   *
   * This method finds an elevator by its uniqueNumber and buildingId
   *
   * @param uniqueNumber  the uniqueNumber of the elevator to be found
   * @param buildingId  the buildingId of the building to be found
   * @returns
   */
  public async findByUniqueNumberInBuilding(uniqueNumber: number, buildingId: string): Promise<Elevator> {
    const query = { building: buildingId, uniqueNumber: uniqueNumber };
    const elevatorRecord = await this.elevatorSchema.findOne(query as FilterQuery<IElevatorPersistence & Document>);

    if (elevatorRecord != null) {
      return ElevatorMap.toDomain(elevatorRecord);
    } else {
      return null;
    }
  }

  public async checkIfElevatorExistInArea(
    initialX: number,
    initialY: number,
    finalX: number,
    finalY: number,
    floor: Floor,
  ): Promise<boolean> {
    const query = {
      floors: { $in: [floor.id.toString()] },
      $and: [
        { 'elevatorPosition.xposition': { $gte: initialX, $lte: finalX } },
        { 'elevatorPosition.yposition': { $gte: initialY, $lte: finalY } },
      ],
    };

    const elevators = await this.elevatorSchema.find(query as FilterQuery<IElevatorPersistence & Document>);

    // Return true if there is an elevator in the area
    return elevators.length !== 0;
  }
}
