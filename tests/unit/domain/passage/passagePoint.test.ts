import * as sinon from 'sinon';
import { PassagePoint } from '../../../../src/domain/passage/passagePoint';
import FloorDataSource from '../../../datasource/floorDataSource';
import { Coordinates } from "../../../../src/domain/common/coordinates";

describe('PassagePoint', () => {

  describe('create', () => {
    describe('succeeds when', () => {
      it('creating a passage point with valid values', ()=> {
        // Arrange
        const floor = FloorDataSource.getFirstFloor();
        const props1 = {
          x: 0,
          y: 3
        }
        const props2 = {
          x: 0,
          y: 4
        }
        const coordinates1 = Coordinates.create(props1).getValue()
        const coordinates2 = Coordinates.create(props2).getValue();
        const passagePointProps =
          {
            floor: floor,
            firstCoordinates: coordinates1,
            lastCoordinates: coordinates2
          };

        // Act
        const passagePointCreationResult = PassagePoint.create(passagePointProps);

        // Assert
        sinon.assert.match(passagePointCreationResult.isSuccess, true);
        sinon.assert.match(passagePointCreationResult.getValue().floor, floor);
        sinon.assert.match(passagePointCreationResult.getValue().firstCoordinates, coordinates1);
        sinon.assert.match(passagePointCreationResult.getValue().lastCoordinates, coordinates2);
      });

      it('creating a passage point in the bottom left corner vertically', ()=> {
        // Arrange
        const floor = FloorDataSource.getFirstFloor();
        const props1 = {
          x: 0,
          y: 0
        }
        const props2 = {
          x: 0,
          y: 1
        }
        const coordinates1 = Coordinates.create(props1).getValue();
        const coordinates2 = Coordinates.create(props2).getValue();

        const passagePointProps =
          {
            floor: floor,
            firstCoordinates: coordinates1,
            lastCoordinates: coordinates2
          };

        // Act
        const passagePointCreationResult = PassagePoint.create(passagePointProps);

        // Assert
        sinon.assert.match(passagePointCreationResult.isSuccess, true);
      });

      it('creating a passage point in the bottom left corner horizontally', ()=> {
        // Arrange
        const floor = FloorDataSource.getFirstFloor();
        const props1 = {
          x: 0,
          y: 0
        }
        const props2 = {
          x: 1,
          y: 0
        }
        const coordinates1 = Coordinates.create(props1).getValue();
        const coordinates2 = Coordinates.create(props2).getValue();

        const passagePointProps =
          {
            floor: floor,
            firstCoordinates: coordinates1,
            lastCoordinates: coordinates2
          };

        // Act
        const passagePointCreationResult = PassagePoint.create(passagePointProps);

        // Assert
        sinon.assert.match(passagePointCreationResult.isSuccess, true);
      });

      it('creating a passage point in the bottom right corner vertically', ()=> {
        // Arrange
        const floor = FloorDataSource.getFirstFloor();
        const floorWidth = floor.building.dimensions.width-1;
        const props1 = {
          x: floorWidth,
          y: 0
        };
        const props2 = {
          x: floorWidth,
          y: 1
        };
        const coordinates1 = Coordinates.create(props1).getValue();
        const coordinates2 = Coordinates.create(props2).getValue();
        const passagePointProps =
          {
            floor: floor,
            firstCoordinates: coordinates1,
            lastCoordinates: coordinates2
          };

        // Act
        const passagePointCreationResult = PassagePoint.create(passagePointProps);

        // Assert
        sinon.assert.match(passagePointCreationResult.isSuccess, true);
      });

      it('creating a passage point in the bottom right corner horizontally', ()=> {
        // Arrange
        const floor = FloorDataSource.getFirstFloor();
        const floorWidth = floor.building.dimensions.width-1;
        const props1 = {
          x: floorWidth,
          y: 0
        };
        const props2 = {
          x: floorWidth - 1,
          y: 0
        };
        const coordinates1 = Coordinates.create(props1).getValue();
        const coordinates2 = Coordinates.create(props2).getValue();

        const passagePointProps =
          {
            floor: floor,
            firstCoordinates: coordinates1,
            lastCoordinates: coordinates2
          };

        // Act
        const passagePointCreationResult = PassagePoint.create(passagePointProps);

        // Assert
        sinon.assert.match(passagePointCreationResult.isSuccess, true);
      });

      it('creating a passage point in the top right corner vertically', ()=> {
        // Arrange
        const floor = FloorDataSource.getFirstFloor();
        const floorWidth = floor.building.dimensions.width-1;
        const floorLength = floor.building.dimensions.length-1;
        const props1 = {
          x: floorWidth,
          y: floorLength
        };
        const props2 = {
          x: floorWidth,
          y: floorLength - 1
        };
        const coordinates1 = Coordinates.create(props1).getValue();
        const coordinates2 = Coordinates.create(props2).getValue();

        const passagePointProps =
          {
            floor: floor,
            firstCoordinates: coordinates1,
            lastCoordinates: coordinates2
          };

        // Act
        const passagePointCreationResult = PassagePoint.create(passagePointProps);

        // Assert
        sinon.assert.match(passagePointCreationResult.isSuccess, true);
      });

      it('creating a passage point in the top right corner vertically', ()=> {
        // Arrange
        const floor = FloorDataSource.getFirstFloor();
        const floorWidth = floor.building.dimensions.width-1;
        const floorLength = floor.building.dimensions.length-1;
        const props1 = {
          x: floorWidth,
          y: floorLength
        };
        const props2 = {
          x: floorWidth - 1,
          y: floorLength
        };
        const coordinates1 = Coordinates.create(props1).getValue();
        const coordinates2 = Coordinates.create(props2).getValue();
        const passagePointProps =
          {
            floor: floor,
            firstCoordinates: coordinates1,
            lastCoordinates: coordinates2
          };

        // Act
        const passagePointCreationResult = PassagePoint.create(passagePointProps);

        // Assert
        sinon.assert.match(passagePointCreationResult.isSuccess, true);
      });

      it('creating a passage point in the top left corner vertically', ()=> {
        // Arrange
        const floor = FloorDataSource.getFirstFloor();
        const floorLength = floor.building.dimensions.length-1;
        const props1 = {
          x: 0,
          y: floorLength
        };
        const props2 = {
          x: 0,
          y: floorLength - 1
        };
        const coordinates1 = Coordinates.create(props1).getValue();
        const coordinates2 = Coordinates.create(props2).getValue();
        const passagePointProps =
          {
            floor: floor,
            firstCoordinates: coordinates1,
            lastCoordinates: coordinates2
          };

        // Act
        const passagePointCreationResult = PassagePoint.create(passagePointProps);

        // Assert
        sinon.assert.match(passagePointCreationResult.isSuccess, true);
      });

      it('creating a passage point in the top left corner horizontally', ()=> {
        // Arrange
        const floor = FloorDataSource.getFirstFloor();
        const floorLength = floor.building.dimensions.length-1;
        const props1 = {
          x: 0,
          y: floorLength
        };
        const props2 = {
          x: 1,
          y: floorLength
        };
        const coordinates1 = Coordinates.create(props1).getValue();
        const coordinates2 = Coordinates.create(props2).getValue();
        const passagePointProps =
          {
            floor: floor,
            firstCoordinates: coordinates1,
            lastCoordinates: coordinates2
          };

        // Act
        const passagePointCreationResult = PassagePoint.create(passagePointProps);

        // Assert
        sinon.assert.match(passagePointCreationResult.isSuccess, true);
      });

    });

    describe('fails when', () => {
      it('creating a passage with a null floor', ()=> {
        // Arrange
        const props1 = {
          x: 2,
          y: 2
        };
        const props2 = {
          x: 2,
          y: 3
        };

        const coordinates1 = Coordinates.create(props1).getValue();
        const coordinates2 = Coordinates.create(props2).getValue();

        const passagePointProps =
          {
            floor: null,
            firstCoordinates: coordinates1,
            lastCoordinates: coordinates2
          };

        // Act
        const passagePointCreationResult = PassagePoint.create(passagePointProps);

        // Assert
        sinon.assert.match(passagePointCreationResult.isFailure, true);
        sinon.assert.match(passagePointCreationResult.errorValue(), 'floor is null or undefined');
      });

      it('creating a passage with a null coordinates (first)', ()=> {
        // Arrange
        const floor = FloorDataSource.getFirstFloor();
        const passagePointProps =
          {
            floor: floor,
            firstCoordinates: null,
            lastCoordinates: null
          };

        // Act
        const passagePointCreationResult = PassagePoint.create(passagePointProps);

        // Assert
        sinon.assert.match(passagePointCreationResult.isFailure, true);
        sinon.assert.match(passagePointCreationResult.errorValue(), 'firstCoordinates is null or undefined');
      });

      it('creating a passage with a null coordinates (last)', ()=> {
        // Arrange
        const floor = FloorDataSource.getFirstFloor();
        const props = {
          x: 2,
          y: 2
        };
        const coordinates = Coordinates.create(props).getValue();
        const passagePointProps =
          {
            floor: floor,
            firstCoordinates: coordinates,
            lastCoordinates: null
          };

        // Act
        const passagePointCreationResult = PassagePoint.create(passagePointProps);

        // Assert
        sinon.assert.match(passagePointCreationResult.isFailure, true);
        sinon.assert.match(passagePointCreationResult.errorValue(), 'lastCoordinates is null or undefined');
      });

      it('creating a passage with two identical coordinates', ()=> {
        // Arrange
        const floor = FloorDataSource.getFirstFloor();
        const props = {
          x: 2,
          y: 2,
        }
        const coordinates1 = Coordinates.create(props).getValue();
        const passagePointProps =
          {
            floor: floor,
            firstCoordinates: coordinates1,
            lastCoordinates: coordinates1
          };

        // Act
        const passagePointCreationResult = PassagePoint.create(passagePointProps);

        // Assert
        sinon.assert.match(passagePointCreationResult.isFailure, true);
        sinon.assert.match(passagePointCreationResult.errorValue(), 'Coordinates must be different.');
      });

      it('creating a passage with coordinates that are not next to each other horizontally', ()=> {
        // Arrange
        const floor = FloorDataSource.getFirstFloor();
        const props1 = {
          x: 2,
          y: 2
        }
        const props2 = {
          x: 4,
          y: 2
        }
        const coordinates1 = Coordinates.create(props1).getValue();
        const coordinates2 = Coordinates.create(props2).getValue();
        const passagePointProps =
          {
            floor: floor,
            firstCoordinates: coordinates1,
            lastCoordinates: coordinates2
          };

        // Act
        const passagePointCreationResult1 = PassagePoint.create(passagePointProps);

        // Assert
        sinon.assert.match(passagePointCreationResult1.isFailure, true);
        sinon.assert.match(passagePointCreationResult1.errorValue(), 'Coordinates must be next to each other.');
      });

      it('creating a passage with coordinates that are not next to each other vertically', ()=> {
        // Arrange
        const floor = FloorDataSource.getFirstFloor();
        const props1 = {
          x: 2,
          y: 2
        }
        const props2 = {
          x: 2,
          y: 4
        }
        const coordinates1 = Coordinates.create(props1).getValue();
        const coordinates2 = Coordinates.create(props2).getValue();
        const passagePointProps =
          {
            floor: floor,
            firstCoordinates: coordinates1,
            lastCoordinates: coordinates2
          };

        // Act
        const passagePointCreationResult1 = PassagePoint.create(passagePointProps);

        // Assert
        sinon.assert.match(passagePointCreationResult1.isFailure, true);
        sinon.assert.match(passagePointCreationResult1.errorValue(), 'Coordinates must be next to each other.');
      });

      it('creating a passage with coordinates one coordinate that is not in the building border', () => {
        // Arrange
        const floor = FloorDataSource.getFirstFloor();
        const floorWidth = floor.building.dimensions.width;
        const floorLength = floor.building.dimensions.length;
        const props1 = {
          x: floorWidth,
          y: floorLength
        }
        const props2 = {
          x: floorWidth - 1,
          y: floorLength - 1,
        }
        const coordinates1 = Coordinates.create(props1).getValue();
        const coordinates2 = Coordinates.create(props2).getValue();
        const passagePointProps =
          {
            floor: floor,
            firstCoordinates: coordinates1,
            lastCoordinates: coordinates2
          };

        // Act
        const passagePointCreationResult1 = PassagePoint.create(passagePointProps);

        // Assert
        sinon.assert.match(passagePointCreationResult1.isFailure, true);
        sinon.assert.match(passagePointCreationResult1.errorValue(), 'Coordinates must be in the border of the floor.');
      });
    });

  });
});