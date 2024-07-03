import * as sinon from 'sinon';
import {Position} from "../../../../src/domain/room/Position";


describe('Position', () => {
    it('should create a valid Position object', () => {

        // Arrange
        const positionResult = Position.create(10, 10);

        // Assert
        sinon.assert.match(positionResult.isSuccess, true);
    });


    it('should not create a valid Position object - not integer', () => {

        // Arrange
        const positionResult = Position.create(10.5, 15);

        // Assert
        sinon.assert.match(positionResult.isFailure, true);
    });


    it('should not create a valid Position object - not integer', () => {

        // Arrange
        const positionResult = Position.create(15, 10.5);

        // Assert
        sinon.assert.match(positionResult.isFailure, true);
    });


    it('should not create a valid Position object - negative', () => {

        // Arrange
        const positionResult = Position.create(-5, -10);

        // Assert
        sinon.assert.match(positionResult.isFailure, true);
    });


    it('should not create a valid Position object - null', () => {

        // Arrange
        const positionResult = Position.create(null, 2);

        // Assert
        sinon.assert.match(positionResult.isFailure, true);
    });

    it('should not create a valid Position object - null', () => {

        // Arrange
        const positionResult = Position.create(1, null);

        // Assert
        sinon.assert.match(positionResult.isFailure, true);
    });
});
