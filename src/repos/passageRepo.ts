import { Service, Inject } from 'typedi';
import IPassageRepo from '../services/IRepos/IPassageRepo';
import { Passage } from '../domain/passage/passage';
import { PassageMap } from '../mappers/PassageMap';
import { Document, FilterQuery, Model } from 'mongoose';
import { IPassagePersistence } from '../dataschema/IPassagePersistence';
import { PassageId } from '../domain/passage/passageId';
import { Floor } from '../domain/floor/floor';
import { Coordinates } from '../domain/common/coordinates';

@Service()
export default class PassageRepo implements IPassageRepo {
  constructor(@Inject('passageSchema') private passageSchema: Model<IPassagePersistence & Document>) {}

  // Checks if a passage already exists.
  public async exists(passage: Passage): Promise<boolean> {
    const idX = passage.id instanceof PassageId ? (<PassageId>passage.id).toValue() : passage.id;

    const query = { domainId: idX };
    const passageDocument = await this.passageSchema.findOne(query as FilterQuery<IPassagePersistence & Document>);

    return !!passageDocument === true;
  }

  // Saves a passage.
  public async save(passage: Passage): Promise<Passage> {
    const query = { domainId: passage.id.toString() };

    const passageDocument = await this.passageSchema.findOne(query);
    try {
      if (passageDocument === null) {
        const rawPassage: any = PassageMap.toPersistence(passage);

        const passageCreated = await this.passageSchema.create(rawPassage);
        return PassageMap.toDomain(passageCreated);
      } else {
        passageDocument.id = passage.id.toString();

        passageDocument.passageStartPoint.floorId = passage.startPoint.floor.id.toString();
        passageDocument.passageStartPoint.firstCoordinates.x = passage.startPoint.firstCoordinates.x;
        passageDocument.passageStartPoint.firstCoordinates.y = passage.startPoint.firstCoordinates.y;
        passageDocument.passageStartPoint.lastCoordinates.x = passage.startPoint.lastCoordinates.x;
        passageDocument.passageStartPoint.lastCoordinates.y = passage.startPoint.lastCoordinates.y;

        passageDocument.passageEndPoint.floorId = passage.endPoint.floor.id.toString();
        passageDocument.passageEndPoint.firstCoordinates.x = passage.endPoint.firstCoordinates.x;
        passageDocument.passageEndPoint.firstCoordinates.y = passage.endPoint.firstCoordinates.y;
        passageDocument.passageEndPoint.lastCoordinates.x = passage.endPoint.lastCoordinates.x;
        passageDocument.passageEndPoint.lastCoordinates.y = passage.endPoint.lastCoordinates.y;
        await passageDocument.save();

        return passage;
      }
    } catch (err) {
      throw err;
    }
  }

  // Searches for a passage by its domainId
  public async findByDomainId(passageId: string): Promise<Passage> {
    const query = { domainId: passageId };

    const passageRecord = await this.passageSchema.findOne(query as FilterQuery<IPassagePersistence & Document>);
    if (passageRecord != null) {
      return PassageMap.toDomain(passageRecord);
    } else {
      return null;
    }
  }

  // Searches for a passage in the database by its points.
  public async findByFloors(startPointFloor: Floor, endPointFloor: Floor): Promise<Passage> {
    const query = {
      $or: [
        {
          'passageStartPoint.floorId': startPointFloor.id.toString(),
          'passageEndPoint.floorId': endPointFloor.id.toString(),
        },
        {
          'passageStartPoint.floorId': endPointFloor.id.toString(),
          'passageEndPoint.floorId': startPointFloor.id.toString(),
        },
      ],
    };

    const passageRecord = await this.passageSchema.findOne(query as FilterQuery<IPassagePersistence & Document>);

    if (passageRecord != null) {
      return PassageMap.toDomain(passageRecord);
    } else {
      return null;
    }
  }

  // Searches for a passage by its coordinates.
  public async findByCoordinates(firstCoordinates: Coordinates, lastCoordinates: Coordinates): Promise<Passage> {
    // finds passage by its coordinates
    const query = {
      $or: [
        {
          'passageStartPoint.firstCoordinates.x': firstCoordinates.x,
          'passageStartPoint.firstCoordinates.y': firstCoordinates.y,
          'passageStartPoint.lastCoordinates.x': lastCoordinates.x,
          'passageStartPoint.lastCoordinates.y': lastCoordinates.y,
        },
        {
          'passageEndPoint.firstCoordinates.x': firstCoordinates.x,
          'passageEndPoint.firstCoordinates.y': firstCoordinates.y,
          'passageEndPoint.lastCoordinates.x': lastCoordinates.x,
          'passageEndPoint.lastCoordinates.y': lastCoordinates.y,
        },
      ],
    };

    const positionsRecord = await this.passageSchema.findOne(query as FilterQuery<IPassagePersistence & Document>);

    if (positionsRecord != null) {
      return PassageMap.toDomain(positionsRecord);
    } else {
      return null;
    }
  }

  public async findByPassagePositionCoordinates(coordinateX: number, coordinateY: number): Promise<Passage> {
    // Queries to find a passage considering both start and end points.
    const startPositionQuery = {
      'passagePositions.positions.0.0': coordinateX,
      'passagePositions.positions.0.1': coordinateY,
    };
    const endPositionQuery = {
      'passagePositions.positions.1.0': coordinateX,
      'passagePositions.positions.1.1': coordinateY,
    };

    const startPositionRecord = await this.passageSchema.findOne(
      startPositionQuery as FilterQuery<IPassagePersistence & Document>,
    );
    const endPositionRecord = await this.passageSchema.findOne(
      endPositionQuery as FilterQuery<IPassagePersistence & Document>,
    );

    if (startPositionRecord != null) {
      return PassageMap.toDomain(startPositionRecord);
    } else if (endPositionRecord != null) {
      return PassageMap.toDomain(endPositionRecord);
    } else {
      return null;
    }
  }

  public async findPassagesByFloorId(floorId: string): Promise<Passage[]> {
    const query = {
      $or: [
        {
          'passageStartPoint.floorId': floorId,
        },
        {
          'passageEndPoint.floorId': floorId,
        },
      ],
    };

    const passageRecord = await this.passageSchema.find(query as FilterQuery<IPassagePersistence & Document>);

    if (passageRecord != null) {
      return Promise.all(passageRecord.map(async passage => await PassageMap.toDomain(passage)));
    } else {
      return null;
    }
  }

  public async isTherePassageBetweenFloorAndBuilding(floorId: string, buildingId: string): Promise<boolean> {
    const aggPipeline = [
      {
        $match: {
          $or: [
            {
              'passageStartPoint.floorId': floorId,
            },
            {
              'passageEndPoint.floorId': floorId,
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'floors',
          localField: 'passageStartPoint.floorId',
          foreignField: 'domainId',
          as: 'startFloor',
        },
      },
      {
        $unwind: '$startFloor',
      },
      {
        $lookup: {
          from: 'floors',
          localField: 'passageEndPoint.floorId',
          foreignField: 'domainId',
          as: 'endFloor',
        },
      },
      {
        $unwind: '$endFloor',
      },
      {
        $match: {
          $or: [
            {
              'startFloor.buildingId': buildingId,
            },
            {
              'endFloor.buildingId': buildingId,
            },
          ],
        },
      },
    ];

    const buildingRecords = await this.passageSchema.aggregate(aggPipeline);
    return buildingRecords.length > 0;
  }

  public async isThereAPassageInFloorCoordinates(
    coordinateX: number,
    coordinateY: number,
    floorId: string,
    passageId: string,
  ): Promise<boolean> {
    const query = {
      $and: [
        {
          domainId: { $ne: passageId }, // Exclude the passage with the specified id
        },
        {
          $or: [
            {
              $and: [
                { 'passageStartPoint.floorId': floorId },
                {
                  $or: [
                    {
                      'passageStartPoint.firstCoordinates.x': coordinateX,
                      'passageStartPoint.firstCoordinates.y': coordinateY,
                    },
                    {
                      'passageStartPoint.lastCoordinates.x': coordinateX,
                      'passageStartPoint.lastCoordinates.y': coordinateY,
                    },
                  ],
                },
              ],
            },
            {
              $and: [
                { 'passageEndPoint.floorId': floorId },
                {
                  $or: [
                    {
                      'passageEndPoint.firstCoordinates.x': coordinateX,
                      'passageEndPoint.firstCoordinates.y': coordinateY,
                    },
                    {
                      'passageEndPoint.lastCoordinates.x': coordinateX,
                      'passageEndPoint.lastCoordinates.y': coordinateY,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const passageRecord = await this.passageSchema.findOne(query as FilterQuery<IPassagePersistence & Document>);
    return passageRecord != null;
  }

  public async findPassagesBetweenBuildings(firstBuildingId: string, lastBuildingId: string): Promise<Passage[]> {
    const pipeline = [
      {
        $lookup: {
          from: 'floors',
          localField: 'passageStartPoint.floorId',
          foreignField: 'domainId',
          as: 'startFloor',
        },
      },
      {
        $lookup: {
          from: 'floors',
          localField: 'passageEndPoint.floorId',
          foreignField: 'domainId',
          as: 'endFloor',
        },
      },
      {
        $project: {
          domainId: 1,
          buildingIdStartFloor: '$startFloor.buildingId',
          buildingIdEndFloor: '$endFloor.buildingId',
        },
      },
      {
        $match: {
          $or: [
            { buildingIdStartFloor: firstBuildingId, buildingIdEndFloor: lastBuildingId },
            { buildingIdStartFloor: lastBuildingId, buildingIdEndFloor: firstBuildingId },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          domainId: '$domainId',
        },
      },
    ];

    const passages: Passage[] = [];

    for await (const passage of this.passageSchema.aggregate(pipeline)) {
      passages.push(await this.findByDomainId(passage.domainId));
    }

    return passages;
  }

  public async findAll(): Promise<Passage[]> {
    const passages: Passage[] = [];

    for await (const passage of this.passageSchema.find()) {
      passages.push(await PassageMap.toDomain(passage));
    }

    return passages;
  }

  public async checkIfPassageExistInArea(
    initialX: number,
    initialY: number,
    finalX: number,
    finalY: number,
    floor: Floor,
  ): Promise<boolean> {
    const query = {
      $or: [
        {
          $and: [
            { 'passageStartPoint.floorId': floor.id.toString() },
            {
              $or: [
                {
                  $and: [
                    { 'passageStartPoint.firstCoordinates.x': { $gte: initialX, $lte: finalX } },
                    { 'passageStartPoint.firstCoordinates.y': { $gte: initialY, $lte: finalY } },
                  ],
                },
                {
                  $and: [
                    { 'passageStartPoint.lastCoordinates.x': { $gte: initialX, $lte: finalX } },
                    { 'passageStartPoint.lastCoordinates.y': { $gte: initialY, $lte: finalY } },
                  ],
                },
              ],
            },
          ],
        },
        {
          $and: [
            { 'passageEndPoint.floorId': floor.id.toString() },
            {
              $or: [
                {
                  $and: [
                    { 'passageEndPoint.firstCoordinates.x': { $gte: initialX, $lte: finalX } },
                    { 'passageEndPoint.firstCoordinates.y': { $gte: initialY, $lte: finalY } },
                  ],
                },
                {
                  $and: [
                    { 'passageEndPoint.lastCoordinates.x': { $gte: initialX, $lte: finalX } },
                    { 'passageEndPoint.lastCoordinates.y': { $gte: initialY, $lte: finalY } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const passages = await this.passageSchema.find(query as FilterQuery<IPassagePersistence & Document>);

    return passages.length !== 0;
  }
}
