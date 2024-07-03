import * as sinon from 'sinon';
import {RoomDimensions} from "../../../../src/domain/room/RoomDimensions";
import {Position} from "../../../../src/domain/room/Position";


describe('RoomDimensions', () => {
    it('should create a valid RoomDimensions object', () => {

        // Arrange
        const nameResult = RoomDimensions.create(
            Position.create(10, 10).getValue(),
            Position.create(20, 20).getValue()
        );

        // Assert
        sinon.assert.match(nameResult.isSuccess, true);
    });


    it('should not create a valid RoomDimensions object - initial Position equal than final Position', () => {

        // Arrange
        const nameResult = RoomDimensions.create(
            Position.create(20, 20).getValue(),
            Position.create(20, 20).getValue()
        );

        // Assert
        sinon.assert.match(nameResult.isFailure, true);
    });


    it('should not create a valid RoomDimensions object - initial Position greater than final Position', () => {

        // Arrange
        const nameResult = RoomDimensions.create(
            Position.create(30, 30).getValue(),
            Position.create(20, 20).getValue()
        );

        // Assert
        sinon.assert.match(nameResult.isFailure, true);
    });


    it('should not create a valid RoomDimensions object - initialPosition null', () => {

        // Arrange
        const nameResult = RoomDimensions
            .create(null, Position.create(30, 30).getValue());

        // Assert
        sinon.assert.match(nameResult.isFailure, true);
    });


    it('should not create a valid RoomDimensions object - finalPosition null', () => {

        // Arrange
        const nameResult = RoomDimensions
            .create(Position.create(30, 30).getValue(), null);

        // Assert
        sinon.assert.match(nameResult.isFailure, true);
    });
});
