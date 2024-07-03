import { Inject, Service } from 'typedi';

import IBuildingRepo from '../services/IRepos/IBuildingRepo';
import { Building } from '../domain/building/building';
import { BuildingMap } from '../mappers/BuildingMap';

import { Document, FilterQuery, Model } from 'mongoose';
import { IBuildingPersistence } from '../dataschema/IBuildingPersistence';
import { BuildingId } from '../domain/building/buildingId';

@Service()
export default class BuildingRepo implements IBuildingRepo {
  constructor(@Inject('buildingSchema') private buildingSchema: Model<IBuildingPersistence & Document>) {}

  public async exists(building: Building): Promise<boolean> {
    const idX = building.id instanceof BuildingId ? (<BuildingId>building.id).toValue() : building.id;

    const query = { domainId: idX };
    const buildingDocument = await this.buildingSchema.findOne(query as FilterQuery<IBuildingPersistence & Document>);

    return !!buildingDocument === true;
  }

  public async save(building: Building): Promise<Building> {
    const query = { domainId: building.id.toString() };
    const buildingDocument = await this.buildingSchema.findOne(query);

    try {
      if (buildingDocument === null) {
        const rawBuilding: any = BuildingMap.toPersistence(building);

        const buildingCreated = await this.buildingSchema.create(rawBuilding);

        return BuildingMap.toDomain(buildingCreated);
      } else {
        if (building.name) {
          buildingDocument.buildingName = building.name.value;
        } else {
          buildingDocument.buildingName = null;
        }
        if (building.description) {
          buildingDocument.buildingDescription = building.description.value;
        } else {
          buildingDocument.buildingDescription = null;
        }
        if (building.dimensions.length) {
          buildingDocument.buildingDimensions.length = building.dimensions.length;
        }
        if (building.dimensions.width) {
          buildingDocument.buildingDimensions.width = building.dimensions.width;
        }
        await buildingDocument.save();
        return building;
      }
    } catch (err) {
      throw err;
    }
  }

  public async findByDomainId(buildingId: BuildingId | string): Promise<Building> {
    const query = { domainId: buildingId };
    const buildingRecord = await this.buildingSchema.findOne(query as FilterQuery<IBuildingPersistence & Document>);

    if (buildingRecord != null) {
      return BuildingMap.toDomain(buildingRecord);
    } else return null;
  }

  public async findByBuildingCode(buildingCode: string): Promise<Building> {
    const query = { buildingCode: buildingCode };
    const buildingRecord = await this.buildingSchema.findOne(query as FilterQuery<IBuildingPersistence & Document>);
    if (buildingRecord != null) {
      return BuildingMap.toDomain(buildingRecord);
    } else {
      return null;
    }
  }

  public async findAll(): Promise<Building[]> {
    const buildingRecords = await this.buildingSchema.find();
    const buildingPromises = buildingRecords.map(BuildingMap.toDomain);
    return Promise.all(buildingPromises);
  }

  public async findWithMinAndMaxFloors(minFloors: number, maxFloors: number): Promise<Building[]> {
    const pipeline = [
      {
        $lookup: {
          from: 'floors',
          localField: 'domainId',
          foreignField: 'buildingId',
          as: 'floors',
        },
      },
      {
        $project: {
          _id: 1,
          domainId: 1,
          buildingName: 1,
          buildingDimensions: 1,
          buildingDescription: 1,
          buildingCode: 1,
          createdAt: 1,
          updatedAt: 1,
          floorCount: { $size: '$floors' },
        },
      },
      {
        $match: {
          floorCount: {
            $gte: minFloors,
            $lte: maxFloors,
          },
        },
      },
    ];

    const buildingRecords = await this.buildingSchema.aggregate(pipeline);
    const buildingPromises = buildingRecords.map(BuildingMap.toDomain);
    return Promise.all(buildingPromises);
  }
}
