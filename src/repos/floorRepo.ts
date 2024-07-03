import { Inject, Service } from 'typedi';

import IFloorRepo from '../services/IRepos/IFloorRepo';

import { Floor } from '../domain/floor/floor';
import { FloorId } from '../domain/floor/floorId';
import { FloorMap } from '../mappers/FloorMap';

import { Document, FilterQuery, Model } from 'mongoose';
import { IFloorPersistence } from '../dataschema/IFloorPersistence';

import { FloorNumber } from '../domain/floor/floorNumber';
import { BuildingId } from '../domain/building/buildingId';

@Service()
export default class FloorRepo implements IFloorRepo {
  constructor(@Inject('floorSchema') private floorSchema: Model<IFloorPersistence & Document>) {}

  public async exists(floor: Floor): Promise<boolean> {
    const idX = floor.id instanceof FloorId ? (<FloorId>floor.id).toValue() : floor.id;

    const query = { domainId: idX };
    const floorDocument = await this.floorSchema.findOne(query as FilterQuery<IFloorPersistence & Document>);

    return !!floorDocument === true;
  }

  public async save(floor: Floor): Promise<Floor> {
    const query = { domainId: floor.id.toString() };

    const floorDocument = await this.floorSchema.findOne(query);

    try {
      if (floorDocument === null) {
        const rawFloor: any = FloorMap.toPersistence(floor);

        const floorCreated = await this.floorSchema.create(rawFloor);

        return FloorMap.toDomain(floorCreated);
      } else {
        floorDocument.id = floor.id.toString();
        floorDocument.building = floor.building.code.value;
        floorDocument.floorNumber = floor.floorNumber.value;

        // Allow for null floor description
        if (floor.floorDescription) floorDocument.floorDescription = floor.floorDescription.value;
        else floorDocument.floorDescription = null;

        // Allow for null floor plan
        if (floor.floorPlan) floorDocument.floorPlan = floor.floorPlan.value;
        else floorDocument.floorPlan = null;

        await floorDocument.save();

        return floor;
      }
    } catch (err) {
      throw err;
    }
  }

  public async findByDomainId(floorId: FloorId | string): Promise<Floor> {
    const query = { domainId: floorId };
    const floorRecord = await this.floorSchema.findOne(query as FilterQuery<IFloorPersistence & Document>);

    if (floorRecord != null) {
      return FloorMap.toDomain(floorRecord);
    } else return null;
  }

  public async findAll(): Promise<Floor[]> {
    const floorRecords = await this.floorSchema.find();
    const floorPromises = floorRecords.map(FloorMap.toDomain);
    return Promise.all(floorPromises);
  }

  public async findByFloorNumberAndBuildingId(
    floorNumber: number | FloorNumber,
    buildingId: string | BuildingId,
  ): Promise<Floor> {
    const query = { floorNumber: floorNumber, buildingId: buildingId };
    const floorRecord = await this.floorSchema.findOne(query as FilterQuery<IFloorPersistence & Document>);

    if (floorRecord != null) {
      return FloorMap.toDomain(floorRecord);
    }

    return null;
  }

  public async findByBuildingId(buildingId: string): Promise<Floor[]> {
    const query = { buildingId: buildingId };
    const floorRecords = await this.floorSchema.find(query as FilterQuery<IFloorPersistence & Document>);
    const floorPromises = floorRecords.map(FloorMap.toDomain);

    return Promise.all(floorPromises);
  }

  public async findFloorsWithElevatorByBuildingId(buildingId: string): Promise<Floor[]> {
    const pipeline = [
      {
        $lookup: {
          from: 'elevators',
          localField: 'building',
          foreignField: 'building.buildingId',
          as: 'elevators',
        },
      },
      {
        $unwind: '$elevators',
      },
      {
        $match: {
          $expr: {
            $in: ['$domainId', '$elevators.floors'],
          },
          'elevators.building': buildingId,
        },
      },
      {
        $group: {
          _id: '$_id',
          domainId: { $first: '$domainId' },
          floorNumber: { $first: '$floorNumber' },
          floorDescription: { $first: '$floorDescription' },
          floorPlan: { $first: '$floorPlan' },
          buildingId: { $first: '$buildingId' },
        },
      },
    ];

    const uniqueFloorsWithElevators = await this.floorSchema.aggregate(pipeline);
    const floorPromises = uniqueFloorsWithElevators.map(FloorMap.toDomain);
    return Promise.all(floorPromises);
  }

  public async findFloorsWithPassageByBuildingId(buildingId: string): Promise<Floor[]> {
    const pipeline = [
      {
        $match: {
          buildingId: buildingId,
        },
      },
      {
        $lookup: {
          from: 'passages',
          let: { floorId: '$domainId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$passageStartPoint.floorId', '$$floorId'] },
                    { $eq: ['$passageEndPoint.floorId', '$$floorId'] },
                  ],
                },
              },
            },
          ],
          as: 'passagesCol',
        },
      },
      {
        $match: {
          'passagesCol.0': { $exists: true },
        },
      },
    ];

    const floorsWithPassages = await this.floorSchema.aggregate(pipeline);
    const floorPromises = floorsWithPassages.map(FloorMap.toDomain);
    return Promise.all(floorPromises);
  }

  public async findByBuildingCodeAndFloorNumber(buildingCode: string, floorNumber: number): Promise<Floor> {
    const pipeline = [
      {
        $lookup: {
          from: 'buildings',
          localField: 'buildingId',
          foreignField: 'domainId',
          as: 'joined_docs',
        },
      },
      {
        $match: {
          'joined_docs.buildingCode': { $eq: buildingCode },
          floorNumber: { $eq: floorNumber },
        },
      },
    ];

    const floorDocument = await this.floorSchema.aggregate(pipeline);

    // Check if floorDocument is empty
    if (floorDocument.length === 0) {
      return null;
    }

    return FloorMap.toDomain(floorDocument[0]);
  }
}
