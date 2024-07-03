import * as sinon from 'sinon';
import { ElevatorPosition } from '../../../../src/domain/elevator/elevatorPosition';

describe('ElevatorPosition', () => {

    it('should create a valid ElevatorPosition object', () => {
        const validPosition = { xposition: 5, yposition: 10 };
        const elevatorPositionResult = ElevatorPosition.create(validPosition);

        // Use Sinon's assertions
        sinon.assert.match(elevatorPositionResult.isSuccess, true);

        const elevatorPosition = elevatorPositionResult.getValue();
        sinon.assert.match(elevatorPosition.xposition, validPosition.xposition);
        sinon.assert.match(elevatorPosition.yposition, validPosition.yposition);
    });

    it('should fail to create ElevatorPosition with null or undefined xposition', () => {
        const invalidPosition = { xposition: undefined as any, yposition: 3 };
        const elevatorPositionResult = ElevatorPosition.create(invalidPosition);

        // Use Sinon's assertions
        sinon.assert.match(elevatorPositionResult.isFailure, true);
        sinon.assert.match(elevatorPositionResult.error, 'xpos is null or undefined');
    });

    it('should fail to create ElevatorPosition with null or undefined yposition', () => {
        const invalidPosition = { xposition: 5, yposition: undefined as any };
        const elevatorPositionResult = ElevatorPosition.create(invalidPosition);

        // Use Sinon's assertions
        sinon.assert.match(elevatorPositionResult.isFailure, true);
        sinon.assert.match(elevatorPositionResult.error, 'ypos is null or undefined');
    });


    it('should fail to create ElevatorPosition with xposition less than 0', () => {
        const invalidPosition = { xposition: -1, yposition: 5 };
        const elevatorPositionResult = ElevatorPosition.create(invalidPosition);

        // Use Sinon's assertions
        sinon.assert.match(elevatorPositionResult.isFailure, true);
        sinon.assert.match(elevatorPositionResult.error, 'Elevator positions must be greater than 0');
    });


    it('should fail to create ElevatorPosition with yposition less than 0', () => {
        const invalidPosition = { xposition: 5, yposition: -5 };
        const elevatorPositionResult = ElevatorPosition.create(invalidPosition);

        // Use Sinon's assertions
        sinon.assert.match(elevatorPositionResult.isFailure, true);
        sinon.assert.match(elevatorPositionResult.error, 'Elevator positions must be greater than 0');
    });

});
