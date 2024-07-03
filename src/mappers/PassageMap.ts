import { Mapper } from '../core/infra/Mapper';

import IPassageOutDTO from '../dto/out/IPassageOutDTO';

import { UniqueEntityID } from '../core/domain/UniqueEntityID';

import { Passage } from '../domain/passage/passage';
import { PassagePoint } from '../domain/passage/passagePoint';
import FloorRepo from '../repos/floorRepo';
import Container from 'typedi';
import { Coordinates } from '../domain/common/coordinates';
import { FloorMap } from './FloorMap';

export class PassageMap extends Mapper<Passage> {
  // Converts the passage entity to a DTO.
  public static toDTO(passage: Passage): IPassageOutDTO {
    return {
      domainId: passage.id.toString(),
      passageStartPoint: {
        floor: FloorMap.toDTO(passage.startPoint.floor),
        firstCoordinates: {
          x: passage.startPoint.firstCoordinates.x,
          y: passage.startPoint.firstCoordinates.y,
        },
        lastCoordinates: {
          x: passage.startPoint.lastCoordinates.x,
          y: passage.startPoint.lastCoordinates.y,
        },
      },
      passageEndPoint: {
        floor: FloorMap.toDTO(passage.endPoint.floor),
        firstCoordinates: {
          x: passage.endPoint.firstCoordinates.x,
          y: passage.endPoint.firstCoordinates.y,
        },
        lastCoordinates: {
          x: passage.endPoint.lastCoordinates.x,
          y: passage.endPoint.lastCoordinates.y,
        },
      },
    };
  }

  // Converts the DTO to a passage entity.
  public static async toDomain(raw: any): Promise<Passage> {
    // Retrieve the Floor.
    const floorRepo = Container.get(FloorRepo);
    const startPointFloor = await floorRepo.findByDomainId(raw.passageStartPoint.floorId);
    const endPointFloor = await floorRepo.findByDomainId(raw.passageEndPoint.floorId);

    // Create the passageStartPoint.
    const passageStartPointOrError = PassagePoint.create({
      floor: startPointFloor,
      firstCoordinates: Coordinates.create(raw.passageStartPoint.firstCoordinates).getValue(),
      lastCoordinates: Coordinates.create(raw.passageStartPoint.lastCoordinates).getValue(),
    });
    if (passageStartPointOrError.isFailure) {
      throw new TypeError(passageStartPointOrError.errorMessage());
    }

    // Create the passageEndPoint.
    const passageEndPointOrError = PassagePoint.create({
      floor: endPointFloor,
      firstCoordinates: Coordinates.create(raw.passageEndPoint.firstCoordinates).getValue(),
      lastCoordinates: Coordinates.create(raw.passageEndPoint.lastCoordinates).getValue(),
    });
    if (passageEndPointOrError.isFailure) {
      throw new TypeError(passageEndPointOrError.errorMessage());
    }

    // Create the Passage entity.
    const passageOrError = Passage.create(
      {
        passageStartPoint: passageStartPointOrError.getValue(),
        passageEndPoint: passageEndPointOrError.getValue(),
      },
      new UniqueEntityID(raw.domainId),
    );

    // Return the passage entity. If the passage entity is invalid, return null.
    return passageOrError.isSuccess ? passageOrError.getValue() : null;
  }

  // Converts the passage entity to a persistence object.
  public static toPersistence(passage: Passage): any {
    return {
      domainId: passage.id.toString(),
      passageStartPoint: {
        floorId: passage.startPoint.floor.id.toValue(),
        firstCoordinates: {
          x: passage.startPoint.firstCoordinates.x,
          y: passage.startPoint.firstCoordinates.y,
        },
        lastCoordinates: {
          x: passage.startPoint.lastCoordinates.x,
          y: passage.startPoint.lastCoordinates.y,
        },
      },
      passageEndPoint: {
        floorId: passage.endPoint.floor.id.toValue(),
        firstCoordinates: {
          x: passage.endPoint.firstCoordinates.x,
          y: passage.endPoint.firstCoordinates.y,
        },
        lastCoordinates: {
          x: passage.endPoint.lastCoordinates.x,
          y: passage.endPoint.lastCoordinates.y,
        },
      },
    };
  }
}
