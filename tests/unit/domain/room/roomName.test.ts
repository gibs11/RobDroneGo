import * as sinon from 'sinon';
import {RoomName} from "../../../../src/domain/room/RoomName";


describe('RoomName', () => {
    it('should create a valid RoomName object', () => {

        // Arrange
        const nameResult = RoomName.create("Sample Name");

        // Assert
        sinon.assert.match(nameResult.isSuccess, true);
    });


    it('should not create a valid RoomName object - not alphanumeric', () => {

        // Arrange
        const nameResult = RoomName.create('Sample nickname_');

        // Assert
        sinon.assert.match(nameResult.isFailure, true);
    });


    it('should not create a valid RoomName object - too long', () => {

        // Arrange
        const nameResult = RoomName
            .create('Sample and big name so that it breaks the character limit of 50 characters');

        // Assert
        sinon.assert.match(nameResult.isFailure, true);
    });


    it('should not create a valid RoomName object - empty string/too short', () => {

        // Arrange
        const nameResult = RoomName.create('');

        // Assert
        sinon.assert.match(nameResult.isFailure, true);
    });


    it('should not create a valid RoomName object - contain only spaces/tabs', () => {

        // Arrange
        const nameResult = RoomName.create('   ');

        // Assert
        sinon.assert.match(nameResult.isFailure, true);
    });


    it('should not create a valid RoomName object - null', () => {

        // Arrange
        const nameResult = RoomName.create(null);

        // Assert
        sinon.assert.match(nameResult.isFailure, true);
    });


    it('should not create a valid RoomName object - undefined', () => {

        // Arrange
        const nameResult = RoomName.create(undefined);

        // Assert
        sinon.assert.match(nameResult.isFailure, true);
    });
});
