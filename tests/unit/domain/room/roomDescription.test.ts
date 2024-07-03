import * as sinon from 'sinon';
import {RoomDescription} from "../../../../src/domain/room/RoomDescription";


describe('RoomDescription', () => {
    it('should create a valid RoomDescription object', () => {

        // Arrange
        const nameResult = RoomDescription.create("Sample Description");

        // Assert
        sinon.assert.match(nameResult.isSuccess, true);
    });


    it('should not create a valid RoomDescription object - not alphanumeric', () => {

        // Arrange
        const nameResult = RoomDescription.create('Sample Description_');

        // Assert
        sinon.assert.match(nameResult.isFailure, true);
    });


    it('should not create a valid RoomDescription object - too long', () => {

        // Arrange
        const nameResult = RoomDescription
            .create('Sample and big Description so that it breaks the character limit of 250 characters' +
            'As is a huge limit I will keep writing and writing and writing and writing and writing and writing' +
                'and writing and writing and writing and writing and writing and writing and writing and writing and');

        // Assert
        sinon.assert.match(nameResult.isFailure, true);
    });


    it('should not create a valid RoomDescription object - empty string/too short', () => {

        // Arrange
        const nameResult = RoomDescription.create('');

        // Assert
        sinon.assert.match(nameResult.isFailure, true);
    });


    it('should not create a valid RoomDescription object - contain only spaces/tabs', () => {

        // Arrange
        const nameResult = RoomDescription.create('   ');

        // Assert
        sinon.assert.match(nameResult.isFailure, true);
    });


    it('should not create a valid RoomDescription object - null', () => {

        // Arrange
        const nameResult = RoomDescription.create(null);

        // Assert
        sinon.assert.match(nameResult.isFailure, true);
    });


    it('should not create a valid RoomDescription object - undefined', () => {

        // Arrange
        const nameResult = RoomDescription.create(undefined);

        // Assert
        sinon.assert.match(nameResult.isFailure, true);
    });
});
