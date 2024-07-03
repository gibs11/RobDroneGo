import * as sinon from 'sinon';
import { Coordinates } from "../../../../src/domain/common/coordinates";

describe('Coordinates', () => {

  describe('create', () => {

    describe('succeeds when', () => {
      it('creating coordinates with valid values', ()=> {
        // Arrange
        const validX = 2;
        const validY = 2;
        const props = {
          x: validX,
          y: validY
        }

        // Act
        const coordinatesResult = Coordinates.create(props);

        // Assert
        sinon.assert.match(coordinatesResult.isSuccess, true);
        sinon.assert.match(coordinatesResult.getValue(), props);
      });

      it('creating coordinates with 0 in both components', ()=> {
        // Arrange
        const validX = 0;
        const validY = 0;
        const props = {
          x: validX,
          y: validY
        }

        // Act
        const coordinatesResult = Coordinates.create(props);

        // Assert
        sinon.assert.match(coordinatesResult.isSuccess, true);
        sinon.assert.match(coordinatesResult.getValue(), props);
      });

    });

    describe('fails when', () => {
      it('creating coordinates with non integer values', ()=> {
        // Arrange
        const validX = 2.2;
        const validY = 1.1;
        const props = {
          x: validX,
          y: validY
        }

        // Act
        const coordinatesResult = Coordinates.create(props);

        // Assert
        sinon.assert.match(coordinatesResult.isFailure, true);
      });

      it('creating coordinates with negative values', ()=> {
        // Arrange
        const validX = -2;
        const validY = -1;
        const props = {
          x: validX,
          y: validY
        }

        // Act
        const coordinatesResult = Coordinates.create(props);

        // Assert
        sinon.assert.match(coordinatesResult.isFailure, true);
      });

    });
  });

  describe("equals", () => {
    
    describe('succeeds when', () => {
      it('comparing coordinates with equal X\'s and equal Y\'s', ()=>{
        // Arrange
        const props = {
          x: 10,
          y: 10
        }
        const coordinates = Coordinates.create(props).getValue();
        const equalCoordinates = Coordinates.create(props).getValue();

        // Act
        const equalsResult = coordinates.equals(equalCoordinates);

        // Assert
        sinon.assert.match(equalsResult, true);
      });
    });

    describe('fails when', () => {
      it('comparing coordinates with different X\'s', ()=>{
        // Arrange
        const props1 = {
          x: 10,
          y: 10
        }
        const props2 = {
          x: 11,
          y: 10
        }
        const coordinates = Coordinates.create(props1).getValue();
        const differentXCoordinates = Coordinates.create(props2).getValue();

        // Act
        const equalsResult = coordinates.equals(differentXCoordinates);

        // Assert
        sinon.assert.match(equalsResult, false);
      });

      it('comparing coordinates with different Y\'s', ()=>{
        // Arrange
        const props1 = {
          x: 10,
          y: 10
        }
        const props2 = {
          x: 10,
          y: 11
        }
        const coordinates = Coordinates.create(props1).getValue();
        const differentYCoordinates = Coordinates.create(props2).getValue();

        // Act
        const equalsResult = coordinates.equals(differentYCoordinates);

        // Assert
        sinon.assert.match(equalsResult, false);
      });
    });

  });
});