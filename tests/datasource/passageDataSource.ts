import { Passage } from "../../src/domain/passage/passage";
import { PassagePoint } from "../../src/domain/passage/passagePoint";
import IPassageDTO from "../../src/dto/IPassageDTO";
import { UniqueEntityID } from "../../src/core/domain/UniqueEntityID";
import FloorDataSource from "./floorDataSource";
import { Coordinates } from "../../src/domain/common/coordinates";

class PassageDataSource {

  static getPassagePointA(): PassagePoint {
    const floor = FloorDataSource.getFirstFloor();
    const coordsProps1 = {
      x: 0,
      y: 0
    };

    const coordsProps2 = {
      x: 0,
      y: 1
    };
    const coords1 = Coordinates.create(coordsProps1).getValue();
    const coords2 = Coordinates.create(coordsProps2).getValue();
    const passagePointProps =
      {
        floor: floor,
        firstCoordinates: coords1,
        lastCoordinates: coords2
      };

    return PassagePoint.create(passagePointProps).getValue();
  }

  static getPassagePointB(): PassagePoint {
    const floor = FloorDataSource.getSecondFloor();
    const coordsProps1 = {
      x: 0,
      y: 0
    };
    const coordsProps2 = {
      x: 1,
      y: 0
    };
    const coords1 = Coordinates.create(coordsProps1).getValue();
    const coords2 = Coordinates.create(coordsProps2).getValue();
    const passagePointProps =
      {
        floor: floor,
        firstCoordinates: coords1,
        lastCoordinates: coords2
      };

    return PassagePoint.create(passagePointProps).getValue();
  }

  static getPassageA(): Passage {
    const passagePointA = this.getPassagePointA();
    const passagePointB = this.getPassagePointB();
    const passageProps = {
      domainId: new UniqueEntityID("1"),
      passageStartPoint: passagePointA,
      passageEndPoint: passagePointB
    };
    return Passage.create(passageProps).getValue();
  }

  static getPassageADTO(): IPassageDTO {
    return {
      domainId: "1",
      passageStartPoint: {
        floorId: "1",
        firstCoordinates: {
          x: 0,
          y: 0
        },
        lastCoordinates: {
          x: 0,
          y: 1
        }
      },
      passageEndPoint: {
        floorId: "2",
        firstCoordinates: {
          x: 0,
          y: 0
        },
        lastCoordinates: {
          x: 1,
          y: 0
        }
      }
    };
  }

  static getPassagePointAForProlog1(): PassagePoint {
    const floor = FloorDataSource.floorForProlog1();
    const coordsProps1 = {
      x: 0,
      y: 0
    };

    const coordsProps2 = {
      x: 0,
      y: 1
    };
    const coords1 = Coordinates.create(coordsProps1).getValue();
    const coords2 = Coordinates.create(coordsProps2).getValue();
    const passagePointProps =
      {
        floor: floor,
        firstCoordinates: coords1,
        lastCoordinates: coords2
      };

    return PassagePoint.create(passagePointProps).getValue();
  }

  static getPassagePointBForProlog1(): PassagePoint {
    const floor = FloorDataSource.floorForProlog2();
    const coordsProps1 = {
      x: 0,
      y: 0
    };
    const coordsProps2 = {
      x: 1,
      y: 0
    };
    const coords1 = Coordinates.create(coordsProps1).getValue();
    const coords2 = Coordinates.create(coordsProps2).getValue();
    const passagePointProps =
      {
        floor: floor,
        firstCoordinates: coords1,
        lastCoordinates: coords2
      };

    return PassagePoint.create(passagePointProps).getValue();
  }

  static passageForProlog1(): Passage {
    const passagePointA = this.getPassagePointAForProlog1();
    const passagePointB = this.getPassagePointBForProlog1();
    const passageProps = {
      domainId: new UniqueEntityID("prolog-passage-1"),
      passageStartPoint: passagePointA,
      passageEndPoint: passagePointB
    };
    return Passage.create(passageProps).getValue();
  }

  static passageForProlog2(): Passage {
    const passagePointA = this.getPassagePointAForProlog1();
    const passagePointB = this.getPassagePointBForProlog1();
    const passageProps = {
      domainId: new UniqueEntityID("prolog-passage-1"),
      passageStartPoint: passagePointB,
      passageEndPoint: passagePointA
    };
    return Passage.create(passageProps).getValue();
  }
}

export default PassageDataSource;