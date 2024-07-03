import { Service } from 'typedi';
import { Passage } from '../domain/passage/passage';
import { PassagePoint } from '../domain/passage/passagePoint';
import { UniqueEntityID } from '../core/domain/UniqueEntityID';
import { Floor } from '../domain/floor/floor';
import { Coordinates } from '../domain/common/coordinates';
import IPassageBuilder from '../services/IFactories/IPassageBuilder';

@Service()
export default class PassageBuilder implements IPassageBuilder {
  constructor() {}

  private startPointFloor: Floor;
  private endPointFloor: Floor;
  private rawData: any;

  public withStartPointFloor(floor: Floor): PassageBuilder {
    this.startPointFloor = floor;
    return this;
  }

  public withEndPointFloor(floor: Floor): PassageBuilder {
    this.endPointFloor = floor;
    return this;
  }

  public withPassageDTO(raw: any): PassageBuilder {
    this.rawData = raw;
    return this;
  }

  public async build(): Promise<Passage> {
    if (!this.startPointFloor || !this.endPointFloor || !this.rawData) {
      throw new TypeError('Invalid input');
    }

    // Create the passageStartPoint.
    const passageStartPointOrError = PassagePoint.create({
      floor: this.startPointFloor,
      firstCoordinates: Coordinates.create(this.rawData.passageStartPoint.firstCoordinates).getValue(),
      lastCoordinates: Coordinates.create(this.rawData.passageStartPoint.lastCoordinates).getValue(),
    });
    if (passageStartPointOrError.isFailure) {
      throw new TypeError(passageStartPointOrError.errorMessage());
    }

    // Create the passageEndPoint.
    const passageEndPointOrError = PassagePoint.create({
      floor: this.endPointFloor,
      firstCoordinates: Coordinates.create(this.rawData.passageEndPoint.firstCoordinates).getValue(),
      lastCoordinates: Coordinates.create(this.rawData.passageEndPoint.lastCoordinates).getValue(),
    });
    if (passageEndPointOrError.isFailure) {
      throw new TypeError(passageEndPointOrError.errorMessage());
    }

    const passageOrError = Passage.create(
      {
        passageStartPoint: passageStartPointOrError.getValue(),
        passageEndPoint: passageEndPointOrError.getValue(),
      },
      new UniqueEntityID(this.rawData.domainId),
    );

    return passageOrError.isSuccess ? passageOrError.getValue() : null;
  }
}
