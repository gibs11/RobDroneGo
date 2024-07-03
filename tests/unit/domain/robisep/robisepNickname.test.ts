import * as sinon from 'sinon';
import {RobisepNickname} from "../../../../src/domain/robisep/RobisepNickname";


describe('RobisepNickname', () => {
    it('should create a valid RobisepNickname object', () => {

        // Arrange
        const nickname = RobisepNickname.create('Sample Nickname 1');

        // Act
        const robisepResult = RobisepNickname.create(nickname.getValue().value);

        // Assert
        sinon.assert.match(robisepResult.isSuccess, true);
    });


    it('should not create a valid RobisepNickname object - not alphanumeric', () => {

        // Arrange
        const robisepResult = RobisepNickname.create('Sample nickname_');

        // Assert
        sinon.assert.match(robisepResult.isFailure, true);
    });


    it('should not create a valid RobisepNickname object - too long', () => {

        // Arrange
        const robisepResult = RobisepNickname.create('Sample nickname Sample nickname Sample');

        // Assert
        sinon.assert.match(robisepResult.isFailure, true);
    });


    it('should not create a valid RobisepNickname object - empty string/too short', () => {

        // Arrange
        const robisepResult = RobisepNickname.create('');

        // Assert
        sinon.assert.match(robisepResult.isFailure, true);
    });


    it('should not create a valid RobisepNickname object - contain only spaces/tabs', () => {

        // Arrange
        const robisepResult = RobisepNickname.create('   ');

        // Assert
        sinon.assert.match(robisepResult.isFailure, true);
    });


    it('should not create a valid RobisepNickname object - null', () => {

        // Arrange
        const robisepResult = RobisepNickname.create(null);

        // Assert
        sinon.assert.match(robisepResult.isFailure, true);
    });


    it('should not create a valid RobisepNickname object - undefined', () => {

        // Arrange
        const robisepResult = RobisepNickname.create(undefined);

        // Assert
        sinon.assert.match(robisepResult.isFailure, true);
    });
});
