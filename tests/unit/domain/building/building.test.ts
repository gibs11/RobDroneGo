import * as sinon from 'sinon';
import { Building } from '../../../../src/domain/building/building';
import { BuildingName } from '../../../../src/domain/building/buildingName';
import { BuildingDimensions } from '../../../../src/domain/building/buildingDimensions';
import { BuildingDescription } from '../../../../src/domain/building/buildingDescription';
import { BuildingCode } from '../../../../src/domain/building/buildingCode';
import { UniqueEntityID } from '../../../../src/core/domain/UniqueEntityID';
import BuildingDataSource from '../../../datasource/buildingDataSource';
import { Coordinates } from "../../../../src/domain/common/coordinates";

describe('Building', () => {

  describe('success when', () => {
    it('creating a valid Building object, passing a building id and name', () => {
      const validBuildingProps = {
        buildingName: BuildingName.create('Sample Building Name').getValue(),
        buildingDimensions: BuildingDimensions.create({ width: 5, length: 10 }).getValue(),
        buildingDescription: BuildingDescription.create('Sample Building Description').getValue(),
        buildingCode: BuildingCode.create('TEST').getValue(),
      };
      const buildingId = new UniqueEntityID();
      const buildingResult = Building.create(validBuildingProps, buildingId);

      // Use Sinon's assertions
      sinon.assert.match(buildingResult.isSuccess, true);

      const building = buildingResult.getValue();
      sinon.assert.match(building.id, buildingId);
      sinon.assert.match(building.name, validBuildingProps.buildingName);
      sinon.assert.match(building.dimensions, validBuildingProps.buildingDimensions);
      sinon.assert.match(building.description, validBuildingProps.buildingDescription);
      sinon.assert.match(building.code, validBuildingProps.buildingCode);
    });

    it('creating a valid Building object, with no name or id being passed', () => {
      const validBuildingProps = {
        buildingDimensions: BuildingDimensions.create({ width: 5, length: 10 }).getValue(),
        buildingDescription: BuildingDescription.create('Sample Building Description').getValue(),
        buildingCode: BuildingCode.create('TEST').getValue(),
      };
      const buildingResult = Building.create(validBuildingProps);

      // Use Sinon's assertions
      sinon.assert.match(buildingResult.isSuccess, true);
    });

    it('creating a Building without an ID being passed', () => {
      const validBuildingProps = {
        buildingName: BuildingName.create('Sample Building Name').getValue(),
        buildingDimensions: BuildingDimensions.create({ width: 5, length: 10 }).getValue(),
        buildingDescription: BuildingDescription.create('Sample Building Description').getValue(),
        buildingCode: BuildingCode.create('TEST').getValue(),
      };
      const buildingResult = Building.create(validBuildingProps);

      sinon.assert.match(buildingResult.isSuccess, true);
    });

    it('creating a Building without a name being passed', () => {
      const validBuildingProps = {
        buildingDimensions: BuildingDimensions.create({ width: 5, length: 10 }).getValue(),
        buildingDescription: BuildingDescription.create('Sample Building Description').getValue(),
        buildingCode: BuildingCode.create('TEST').getValue(),
      };
      const buildingId = new UniqueEntityID();
      const buildingResult = Building.create(validBuildingProps, buildingId);

      sinon.assert.match(buildingResult.isSuccess, true);
    });

    it('creating a Building without a description being passed', () => {
      // Arrange
      const validBuildingProps = {
        buildingName: BuildingName.create('Sample Building Name').getValue(),
        buildingDimensions: BuildingDimensions.create({ width: 5, length: 10 }).getValue(),
        buildingCode: BuildingCode.create('TEST').getValue(),
      };
      const buildingId = new UniqueEntityID();

      // Act
      const buildingResult = Building.create(validBuildingProps, buildingId);

      // Assert
      sinon.assert.match(buildingResult.isSuccess, true);
    });

    it('updating a Building name', () => {
      // Arrange
      const buildingToUpdate = BuildingDataSource.getBuildingA();
      const newName = 'New Building Name';

      // Act
      buildingToUpdate.updateName(newName);

      // Assert
      sinon.assert.match(buildingToUpdate.name.value, newName);
    });

    it('updating a Building description', () => {
      // Arrange
      const buildingToUpdate = BuildingDataSource.getBuildingA();
      const newDescription = 'New Building Description';

      // Act
      buildingToUpdate.updateDescription(newDescription);

      // Assert
      sinon.assert.match(buildingToUpdate.description.value, newDescription);
    });

    it('updating the dimensions of a Building', () => {
       // Arrange
       const buildingToUpdate = BuildingDataSource.getBuildingA();
       const newDimensions = BuildingDimensions.create({ width: 20, length: 25 }).getValue();

       // Act
       buildingToUpdate.dimensions = newDimensions;

       // Assert
       sinon.assert.match(buildingToUpdate.dimensions, newDimensions);
     });

    it('determining if the left bottom corner coordinate is in the border', () => {
      // Arrange
      const building = BuildingDataSource.getBuildingA();
      const props = {
        x: 0,
        y: 0
      }
      const coordinate = Coordinates.create(props).getValue();

      // Act
      const isBorderCoordinate = building.isCoordinateInBorder(coordinate).getValue();

      // Assert
      sinon.assert.match(isBorderCoordinate, true);
    });

    it('determining if the right top corner coordinate is in the border', () => {
      // Arrange
      const building = BuildingDataSource.getBuildingA();
      const buildingWidth = building.dimensions.width-1;
      const buildingLength = building.dimensions.length-1;
      const props = {
        x: buildingWidth,
        y: buildingLength
      }
      const coordinate = Coordinates.create(props).getValue();

      // Act
      const isBorderCoordinate = building.isCoordinateInBorder(coordinate).getValue();

      // Assert
      sinon.assert.match(isBorderCoordinate, true);
    });

    it('determining if the left top corner coordinate is in the border', () => {
      // Arrange
      const building = BuildingDataSource.getBuildingA();
      const buildingLength = building.dimensions.length-1;
      const props = {
        x: 0,
        y: buildingLength
      }
      const coordinate = Coordinates.create(props).getValue();

      // Act
      const isBorderCoordinate = building.isCoordinateInBorder(coordinate).getValue();

      // Assert
      sinon.assert.match(isBorderCoordinate, true);
    });

    it('determining if the right bottom corner coordinate is in the border', () => {
      // Arrange
      const building = BuildingDataSource.getBuildingA();
      const buildingWidth = building.dimensions.width-1;
      const props = {
        x: buildingWidth,
        y: 0
      }
      const coordinate = Coordinates.create(props).getValue();

      // Act
      const isBorderCoordinate = building.isCoordinateInBorder(coordinate).getValue();

      // Assert
      sinon.assert.match(isBorderCoordinate, true);
    });

    it('determining if a random border corner coordinate is in the border', () => {
      // Arrange
      const building = BuildingDataSource.getBuildingA();
      const props = {
        x: 0,
        y: 5
      }
      const coordinate = Coordinates.create(props).getValue();

      // Act
      const isBorderCoordinate = building.isCoordinateInBorder(coordinate).getValue();

      // Assert
      sinon.assert.match(isBorderCoordinate, true);
    });

    it('determining if an inside corner coordinate is in the border', () => {
      // Arrange
      const building = BuildingDataSource.getBuildingA();
      const props = {
        x: 3,
        y: 3
      }
      const coordinate = Coordinates.create(props).getValue();

      // Act
      const isBorderCoordinate = building.isCoordinateInBorder(coordinate).getValue();

      // Assert
      sinon.assert.match(isBorderCoordinate, false);
    });
    it('determining if the coordinate is outside the limits', () => {
      // Arrange
      const building = BuildingDataSource.getBuildingA();
      const props = {
        x: 100,
        y: 100
      }
      const coordinate = Coordinates.create(props).getValue();

      // Act
      const isBorderCoordinate = building.isCoordinateInBorder(coordinate).getValue();

      // Assert
      sinon.assert.match(isBorderCoordinate, false);
    });
  });

  describe('failure when', () => {
    it('creating Building with null or undefined dimensions', () => {
      const invalidBuildingProps = {
        buildingName: BuildingName.create('Sample Building Name').getValue(),
        buildingDimensions: null,
        buildingDescription: BuildingDescription.create('Sample Building Description').getValue(),
        buildingCode: BuildingCode.create('TEST').getValue(),
      };
      const buildingResult = Building.create(invalidBuildingProps);

      // Use Sinon's assertions
      sinon.assert.match(buildingResult.isFailure, true);
      sinon.assert.match(buildingResult.error, 'buildingDimensions is null or undefined');
    });

    it('creating Building with null or undefined code', () => {
      const invalidBuildingProps = {
        buildingName: BuildingName.create('Sample Building Name').getValue(),
        buildingDimensions: BuildingDimensions.create({ width: 5, length: 10 }).getValue(),
        buildingDescription: BuildingDescription.create('Sample Building Description').getValue(),
        buildingCode: null,
      };
      const buildingResult = Building.create(invalidBuildingProps);

      // Use Sinon's assertions
      sinon.assert.match(buildingResult.isFailure, true);
      sinon.assert.match(buildingResult.error, 'buildingCode is null or undefined');
    });

    it('updating a Building name with an invalid name', () => {
      // Arrange
      const buildingToUpdate = BuildingDataSource.getBuildingA();
      const newName = 'N@@';

      // Act & Assert
      sinon.assert.match(() => buildingToUpdate.updateName(newName), TypeError);
    });

    it('updating a Building description with an invalid description', () => {
      // Arrange
      const buildingToUpdate = BuildingDataSource.getBuildingA();
      const newDescription = 'N@@';

      // Act & Assert
      sinon.assert.match(() => buildingToUpdate.updateDescription(newDescription), TypeError);
    });
  });
});
