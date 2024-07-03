import * as sinon from "sinon";
import { Passage } from "../../../../src/domain/passage/passage";
import PassageDataSource from "../../../datasource/passageDataSource";
import { UniqueEntityID } from "../../../../src/core/domain/UniqueEntityID";
import { PassagePoint } from "../../../../src/domain/passage/passagePoint";
import FloorDataSource from "../../../datasource/floorDataSource";
import { Floor } from "../../../../src/domain/floor/floor";
import { Coordinates } from "../../../../src/domain/common/coordinates";

describe("Passage", () => {
  describe("create", () => {
    describe("succeeds when", () => {
      it("creating passage with valid values", () => {
        // Arrange
        const passageStartPoint = PassageDataSource.getPassagePointA();
        const passageEndPoint = PassageDataSource.getPassagePointB();
        const props =
          {
            passageStartPoint: passageStartPoint,
            passageEndPoint: passageEndPoint
          };

        // Act
        const result = Passage.create(props);

        // Assert
        sinon.assert.match(result.isSuccess, true);
        sinon.assert.match(result.getValue().startPoint, passageStartPoint);
        sinon.assert.match(result.getValue().endPoint, passageEndPoint);
        sinon.assert.match(result.getValue().id instanceof UniqueEntityID, true);
      });
    });

    describe("fails when", () => {
      it("creating passage with no start point", () => {
        // Arrange
        const passageEndPoint = PassageDataSource.getPassagePointB();
        const props =
          {
            passageStartPoint: null,
            passageEndPoint: passageEndPoint
          };

        // Act
        const result = Passage.create(props);

        // Assert
        sinon.assert.match(result.isFailure, true);
        sinon.assert.match(result.errorMessage(), "passageStartPoint is null or undefined");
      });

      it("creating passage with no end point", () => {
        // Arrange
        const passageStartPoint = PassageDataSource.getPassagePointA();
        const props =
          {
            passageStartPoint: passageStartPoint,
            passageEndPoint: null
          };

        // Act
        const result = Passage.create(props);

        // Assert
        sinon.assert.match(result.isFailure, true);
        sinon.assert.match(result.errorMessage(), "passageEndPoint is null or undefined");
      });

      it("creating passage with the same building", () => {
        // Arrange
        const passageStartPoint = PassageDataSource.getPassagePointA();
        const props =
          {
            passageStartPoint: passageStartPoint,
            passageEndPoint: passageStartPoint
          };

        // Act
        const result = Passage.create(props);

        // Assert
        sinon.assert.match(result.isFailure, true);
        sinon.assert.match(result.errorMessage(), "You can't create a passage between floors of the same building.");
      });
    });
  });
  describe("update", () => {
    describe("succeeds when", () => {
      it("should update the passage start point", () => {
        // Arrange
        const passageToUpdate = PassageDataSource.getPassageA();
        const floor = FloorDataSource.getThirdFloor();
        const firstCoordinatesProps = {
          x: 0,
          y: 3
        };
        const secondCoordinatesProps = {
          x: 0,
          y: 4
        };
        const firstCoordinates = Coordinates.create(firstCoordinatesProps).getValue();
        const secondCoordinates = Coordinates.create(secondCoordinatesProps).getValue();

        const passagePointProps = {
          floor: floor,
          firstCoordinates: firstCoordinates,
          lastCoordinates: secondCoordinates
        }

        const passageStartPoint = PassagePoint.create(passagePointProps).getValue();

        // Act
        passageToUpdate.updateStartPoint(floor, firstCoordinates.x, firstCoordinates.y, secondCoordinates.x, secondCoordinates.y);

        // Assert
        sinon.assert.match(passageToUpdate.startPoint, passageStartPoint);
      });
      it("should update the passage end point", () => {
        // Arrange
        const passageToUpdate = PassageDataSource.getPassageA();
        const floor = FloorDataSource.getThirdFloor();
        const firstCoordinatesProps = {
          x: 0,
          y: 3
        };
        const secondCoordinatesProps = {
          x: 0,
          y: 4
        };
        const firstCoordinates = Coordinates.create(firstCoordinatesProps).getValue();
        const secondCoordinates = Coordinates.create(secondCoordinatesProps).getValue();

        const passagePointProps = {
          floor: floor,
          firstCoordinates: firstCoordinates,
          lastCoordinates: secondCoordinates
        }

        const passageEndPoint = PassagePoint.create(passagePointProps).getValue();

        // Act
        passageToUpdate.updateEndPoint(floor, firstCoordinates.x, firstCoordinates.y, secondCoordinates.x, secondCoordinates.y);

        // Assert
        sinon.assert.match(passageToUpdate.endPoint, passageEndPoint);
      });
    });
    describe("fails when", () => {
      it('should not update the start point if the first coordinates are null', () => {
        // Arrange
        const passageToUpdate = PassageDataSource.getPassageA();
        const floor = FloorDataSource.getThirdFloor();
        const firstCoordinatesProps = {
          x: 0,
          y: 3
        };
        const secondCoordinatesProps = {
          x: 0,
          y: 4
        };
        const firstCoordinates = Coordinates.create(firstCoordinatesProps).getValue();
        const secondCoordinates = Coordinates.create(secondCoordinatesProps).getValue();

        const passagePointProps = {
          floor: floor,
          firstCoordinates: firstCoordinates,
          lastCoordinates: secondCoordinates
        }

        const passageStartPoint = PassagePoint.create(passagePointProps);

        // Act
        const result = passageToUpdate.updateStartPoint(floor, null, 0, 0, 1);

        // Assert
        sinon.assert.match(result.errorMessage(), "Coordinates must be integer numbers.");
      });
      it('should not update the start point if the last coordinates are null', () => {
        // Arrange
        const passageToUpdate = PassageDataSource.getPassageA();
        const floor = FloorDataSource.getThirdFloor();
        const firstCoordinatesProps = {
          x: 0,
          y: 3
        };
        const secondCoordinatesProps = {
          x: 0,
          y: 4
        };
        const firstCoordinates = Coordinates.create(firstCoordinatesProps).getValue();
        const secondCoordinates = Coordinates.create(secondCoordinatesProps).getValue();

        const passagePointProps = {
          floor: floor,
          firstCoordinates: firstCoordinates,
          lastCoordinates: secondCoordinates
        }

        const passageStartPoint = PassagePoint.create(passagePointProps);

        // Act
        const result = passageToUpdate.updateStartPoint(floor, 0, 0, null, 1);

        // Assert
        sinon.assert.match(result.errorMessage(), "Coordinates must be integer numbers.");
      });
      it('should not update the end point if the first coordinates are null', () => {
        // Arrange
        const passageToUpdate = PassageDataSource.getPassageA();
        const floor = FloorDataSource.getThirdFloor();
        const firstCoordinatesProps = {
          x: 0,
          y: 3
        };
        const secondCoordinatesProps = {
          x: 0,
          y: 4
        };
        const firstCoordinates = Coordinates.create(firstCoordinatesProps).getValue();
        const secondCoordinates = Coordinates.create(secondCoordinatesProps).getValue();

        const passagePointProps = {
          floor: floor,
          firstCoordinates: firstCoordinates,
          lastCoordinates: secondCoordinates
        }

        const passageStartPoint = PassagePoint.create(passagePointProps);

        // Act
        const result = passageToUpdate.updateEndPoint(floor, 0, null, 0, 1);

        // Assert
        sinon.assert.match(result.errorMessage(), "Coordinates must be integer numbers.");
      });
      it('should not update the end point if the last coordinates are null', () => {
        // Arrange
        const passageToUpdate = PassageDataSource.getPassageA();
        const floor = FloorDataSource.getThirdFloor();
        const firstCoordinatesProps = {
          x: 0,
          y: 3
        };
        const secondCoordinatesProps = {
          x: 0,
          y: 4
        };
        const firstCoordinates = Coordinates.create(firstCoordinatesProps).getValue();
        const secondCoordinates = Coordinates.create(secondCoordinatesProps).getValue();

        const passagePointProps = {
          floor: floor,
          firstCoordinates: firstCoordinates,
          lastCoordinates: secondCoordinates
        }

        const passageEndPoint = PassagePoint.create(passagePointProps);

        // Act
        const result = passageToUpdate.updateEndPoint(floor, 0, 0, 0, null);

        // Assert
        sinon.assert.match(result.errorMessage(), "Coordinates must be integer numbers.");
      });
      it('should not update the start point if the floor is null', () => {
        // Arrange
        const passageToUpdate = PassageDataSource.getPassageA();
        const floor = FloorDataSource.getThirdFloor();
        const firstCoordinatesProps = {
          x: 0,
          y: 3
        };
        const secondCoordinatesProps = {
          x: 0,
          y: 4
        };
        const firstCoordinates = Coordinates.create(firstCoordinatesProps).getValue();
        const secondCoordinates = Coordinates.create(secondCoordinatesProps).getValue();

        const passagePointProps = {
          floor: floor,
          firstCoordinates: firstCoordinates,
          lastCoordinates: secondCoordinates
        }

        const passageStartPoint = PassagePoint.create(passagePointProps);

        // Act
        const result = passageToUpdate.updateStartPoint(null, 0, 0, 0, 1);

        // Assert
        sinon.assert.match(result.errorMessage(), "floor is null or undefined");
      });
      it('should not update the end point if the floor is null', () => {
        // Arrange
        const passageToUpdate = PassageDataSource.getPassageA();
        const floor = FloorDataSource.getThirdFloor();
        const firstCoordinatesProps = {
          x: 0,
          y: 3
        };
        const secondCoordinatesProps = {
          x: 0,
          y: 4
        };
        const firstCoordinates = Coordinates.create(firstCoordinatesProps).getValue();
        const secondCoordinates = Coordinates.create(secondCoordinatesProps).getValue();

        const passagePointProps = {
          floor: floor,
          firstCoordinates: firstCoordinates,
          lastCoordinates: secondCoordinates
        }

        const passageStartPoint = PassagePoint.create(passagePointProps);

        // Act
        const result = passageToUpdate.updateEndPoint(null, 0, 0, 0, 1);

        // Assert
        sinon.assert.match(result.errorMessage(), "floor is null or undefined");
      });
    });
  });
});