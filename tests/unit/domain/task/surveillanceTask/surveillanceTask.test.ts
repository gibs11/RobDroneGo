import * as sinon from 'sinon';
import 'reflect-metadata';

import { UniqueEntityID } from '../../../../../src/core/domain/UniqueEntityID';

import { TaskState } from '../../../../../src/domain/task/taskState';
import { RobisepType } from '../../../../../src/domain/robisepType/RobisepType';
import { Floor } from '../../../../../src/domain/floor/floor';
import { PhoneNumber } from '../../../../../src/domain/common/phoneNumber';
import { SurveillanceTask } from '../../../../../src/domain/task/surveillanceTask/surveillanceTask';
import FloorDataSource from '../../../../datasource/floorDataSource';
import { Room } from '../../../../../src/domain/room/Room';
import RoomDataSource from '../../../../datasource/RoomDataSource';
import { TaskCode } from '../../../../../src/domain/task/taskCode';
import RobisepTypeDataSource from '../../../../datasource/robisepTypeDataSource';
import RobisepDataSource from '../../../../datasource/RobisepDataSource';
import surveillanceTaskDataSource from '../../../../datasource/task/surveillanceTaskDataSource';
import { assert } from 'chai';

describe('Surveillance Task Creation', () => {
  describe('Valid Surveillance Task Creation', () => {
    // Create sinon sandbox for isolating tests
    const sandbox = sinon.createSandbox();

    // RobisepType for the surveillance task
    let robisepTypeMock: RobisepType;

    // Rooms for the surveillance task
    let startingPointToWatchMock: Room;
    let endingPointToWatchMock: Room;

    beforeEach(() => {
      robisepTypeMock = RobisepTypeDataSource.getRobisepTypeB();
      startingPointToWatchMock = RoomDataSource.getFirstRoomT();
      endingPointToWatchMock = RoomDataSource.getSecondRoomT();
    });

    afterEach(() => {
      sandbox.restore();
      sinon.restore();
    });

    it('should create a surveillance task', () => {
      // Arrange
      const surveillanceTaskProps = {
        taskState: TaskState.REQUESTED,
        taskCode: TaskCode.create(123).getValue(),
        email: '1211@isep.ipp.pt',
        robisepType: robisepTypeMock,
        emergencyPhoneNumber: PhoneNumber.create('912345678').getValue(),
        startingPointToWatch: startingPointToWatchMock,
        endingPointToWatch: endingPointToWatchMock,
      };

      // Act
      const surveillanceTaskResult = SurveillanceTask.create(surveillanceTaskProps);

      // Assert
      sinon.assert.match(surveillanceTaskResult.isSuccess, true);

      const surveillanceTask = surveillanceTaskResult.getValue();
      sinon.assert.match(surveillanceTask.taskState, TaskState.REQUESTED);
      sinon.assert.match(surveillanceTask.taskCode, TaskCode.create(123).getValue());
      sinon.assert.match(surveillanceTask.email, '1211@isep.ipp.pt');
      sinon.assert.match(surveillanceTask.robisepType, robisepTypeMock);
      sinon.assert.match(surveillanceTask.emergencyPhoneNumber, PhoneNumber.create('912345678').getValue());
      sinon.assert.match(surveillanceTask.startingPointToWatch, startingPointToWatchMock);
      sinon.assert.match(surveillanceTask.endingPointToWatch, endingPointToWatchMock);
    });

    it('should create a surveillance task, with a domain id provided', () => {
      // Arrange
      const surveillanceTaskProps = {
          taskState: TaskState.REQUESTED,
          taskCode: TaskCode.create(123).getValue(),
          email: '1211@isep.ipp.pt',
          robisepType: robisepTypeMock,
          emergencyPhoneNumber: PhoneNumber.create('912345678').getValue(),
          startingPointToWatch: startingPointToWatchMock,
          endingPointToWatch: endingPointToWatchMock,
        },
        surveillanceTaskId = new UniqueEntityID('123');

      // Act
      const surveillanceTaskResult = SurveillanceTask.create(surveillanceTaskProps, surveillanceTaskId);

      // Assert
      sinon.assert.match(surveillanceTaskResult.isSuccess, true);

      const surveillanceTask = surveillanceTaskResult.getValue();
      sinon.assert.match(surveillanceTask.id, surveillanceTaskId);
    });

    it('should create a surveillance task, with a robisep provided', () => {
      // Arrange
      const surveillanceTaskProps = {
          taskState: TaskState.REQUESTED,
          taskCode: TaskCode.create(123).getValue(),
          email: '1211@isep.ipp.pt',
          robisepType: robisepTypeMock,
          emergencyPhoneNumber: PhoneNumber.create('912345678').getValue(),
          startingPointToWatch: startingPointToWatchMock,
          endingPointToWatch: endingPointToWatchMock,
          robisep: RobisepDataSource.getRobisepB(),
        },
        surveillanceTaskId = new UniqueEntityID('123');

      // Act
      const surveillanceTaskResult = SurveillanceTask.create(surveillanceTaskProps, surveillanceTaskId);

      // Assert
      sinon.assert.match(surveillanceTaskResult.isSuccess, true);

      const surveillanceTask = surveillanceTaskResult.getValue();
      sinon.assert.match(surveillanceTask.id, surveillanceTaskId);
    });
  });

  describe('Invalid Surveillance Task Creation', () => {
    // Create sinon sandbox for isolating tests
    const sandbox = sinon.createSandbox();

    // RobisepType for the surveillance task
    let robisepTypeMock: RobisepType;

    // Floors for the surveillance task
    let floorToWatch1Mock: Floor;

    // Rooms for the surveillance task
    let startingPointToWatchMock: Room;
    let endingPointToWatchMock: Room;

    beforeEach(() => {
      robisepTypeMock = RobisepTypeDataSource.getRobisepTypeB();
      floorToWatch1Mock = FloorDataSource.getFirstFloor();
      startingPointToWatchMock = RoomDataSource.getRoomProlog1();
      endingPointToWatchMock = RoomDataSource.getRoomA();
    });

    afterEach(() => {
      sandbox.restore();
      sinon.restore();
    });

    it('should fail to create a surveillance task, when one of the fields is null or undefined', () => {
      // Arrange
      const surveillanceTaskProps = {
        taskState: TaskState.REQUESTED,
        taskCode: TaskCode.create(123).getValue(),
        email: '1211@isep.ipp.pt',
        robisepType: null,
        floorToWatch: floorToWatch1Mock,
        emergencyPhoneNumber: PhoneNumber.create('912345678').getValue(),
        startingPointToWatch: startingPointToWatchMock,
        endingPointToWatch: endingPointToWatchMock,
      };

      // Act
      const surveillanceTaskResult = SurveillanceTask.create(surveillanceTaskProps);

      // Assert
      sinon.assert.match(surveillanceTaskResult.isFailure, true);
      sinon.assert.match(surveillanceTaskResult.error, 'robisepType is null or undefined');
    });

    it('should fail to create a surveillance task, when starting and ending points are not in the same building', () => {
      // Arrange
      const surveillanceTaskProps = {
        taskState: TaskState.REQUESTED,
        taskCode: TaskCode.create(123).getValue(),
        email: '1211@isep.ipp.pt',
        robisepType: robisepTypeMock,
        floorToWatch: floorToWatch1Mock,
        emergencyPhoneNumber: PhoneNumber.create('912345678').getValue(),
        startingPointToWatch: startingPointToWatchMock,
        endingPointToWatch: endingPointToWatchMock,
      };

      // Act
      const surveillanceTaskResult = SurveillanceTask.create(surveillanceTaskProps);

      // Assert
      sinon.assert.match(surveillanceTaskResult.isFailure, true);
      sinon.assert.match(
        surveillanceTaskResult.error,
        'The starting point and ending point to watch must be in the same floor.',
      );
    });

    it('should fail to create a surveillance task, when starting and ending points are the same', () => {
      // Arrange
      const surveillanceTaskProps = {
        taskState: TaskState.REQUESTED,
        taskCode: TaskCode.create(123).getValue(),
        email: '1211@isep.ipp.pt',
        robisepType: robisepTypeMock,
        floorToWatch: floorToWatch1Mock,
        emergencyPhoneNumber: PhoneNumber.create('912345678').getValue(),
        startingPointToWatch: startingPointToWatchMock,
        endingPointToWatch: startingPointToWatchMock,
      };

      // Act
      const surveillanceTaskResult = SurveillanceTask.create(surveillanceTaskProps);

      // Assert
      sinon.assert.match(surveillanceTaskResult.isFailure, true);
      sinon.assert.match(
        surveillanceTaskResult.error,
        'The starting point and ending point to watch cannot be the same.',
      );
    });

    it('should fail to create a surveillance task, when robisep type is not capable of executing surveillance task', () => {
      // Arrange
      const surveillanceTaskProps = {
        taskState: TaskState.REQUESTED,
        taskCode: TaskCode.create(123).getValue(),
        email: '1211@isep.ipp.pt',
        robisepType: RobisepTypeDataSource.getRobisepTypeA(),
        floorToWatch: floorToWatch1Mock,
        emergencyPhoneNumber: PhoneNumber.create('912345678').getValue(),
        startingPointToWatch: RoomDataSource.getFirstRoomT(),
        endingPointToWatch: RoomDataSource.getSecondRoomT(),
      };

      // Act
      const surveillanceTaskResult = SurveillanceTask.create(surveillanceTaskProps);

      // Assert
      sinon.assert.match(surveillanceTaskResult.isFailure, true);
      sinon.assert.match(surveillanceTaskResult.error, 'The robot type RobisepType A is not capable of surveillance.');
    });
  });
});

describe('Surveillance Task Acceptance', () => {
  describe('Valid Surveillance Task Acceptance', () => {
    it('should change task state to Accepted', () => {
      // Arrange
      const surveillanceTask = surveillanceTaskDataSource.getBuildingASurveillanceTask();

      // Act
      surveillanceTask.accept();

      // Assert
      sinon.assert.match(surveillanceTask.taskState, TaskState.ACCEPTED);
    });
  });

  describe('Invalid Surveillance Task Acceptance', () => {
    it('should fail to change task state to Accepted, when task is already Accepted', () => {
      // Arrange
      const surveillanceTask = surveillanceTaskDataSource.getBuildingASurveillanceTask();
      surveillanceTask.accept();

      // Act & Assert Error was thrown
      assert.throws(() => surveillanceTask.accept(), Error);
    });

    it('should fail to change task state to Accepted, when task is already Refused', () => {
      // Arrange
      const surveillanceTask = surveillanceTaskDataSource.getBuildingASurveillanceTask();
      surveillanceTask.refuse();

      // Act & Assert Error was thrown
      assert.throws(() => surveillanceTask.accept(), Error);
    });
  });
});

describe('Surveillance Task Rejection', () => {
  describe('Valid Surveillance Task Rejection', () => {
    it('should change task state to Refused', () => {
      // Arrange
      const surveillanceTask = surveillanceTaskDataSource.getBuildingASurveillanceTask();

      // Act
      surveillanceTask.refuse();

      // Assert
      sinon.assert.match(surveillanceTask.taskState, TaskState.REFUSED);
    });
  });

  describe('Invalid Surveillance Task Rejection', () => {
    it('should fail to change task state to Refused, when task is already Refused', () => {
      // Arrange
      const surveillanceTask = surveillanceTaskDataSource.getBuildingASurveillanceTask();
      surveillanceTask.refuse();

      // Act & Assert Error was thrown
      assert.throws(() => surveillanceTask.refuse(), Error);
    });
  });
});
