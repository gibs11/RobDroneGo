import * as sinon from 'sinon';
import 'reflect-metadata';

import { UniqueEntityID } from '../../../../../src/core/domain/UniqueEntityID';

import { TaskState } from '../../../../../src/domain/task/taskState';
import { RobisepType } from '../../../../../src/domain/robisepType/RobisepType';
import { PhoneNumber } from '../../../../../src/domain/common/phoneNumber';
import { Room } from '../../../../../src/domain/room/Room';
import RoomDataSource from '../../../../datasource/RoomDataSource';
import { PersonalName } from '../../../../../src/domain/common/personalName';
import { PickUpAndDeliveryTaskPersonContact } from '../../../../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskPersonContact';
import { PickUpAndDeliveryTask } from '../../../../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTask';
import { PickUpAndDeliveryTaskDescription } from '../../../../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskDescription';
import { PickUpAndDeliveryTaskConfirmationCode } from '../../../../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskConfirmationCode';
import { TaskCode } from '../../../../../src/domain/task/taskCode';
import RobisepTypeDataSource from '../../../../datasource/robisepTypeDataSource';
import RobisepDataSource from '../../../../datasource/RobisepDataSource';
import pickUpAndDeliveryTaskDataSource from '../../../../datasource/task/pickUpAndDeliveryTaskDataSource';
import { assert } from 'chai';

describe('Pickup and delivery Task Creation', () => {
  describe('Valid Pickup and delivery Task Creation', () => {
    // Create sinon sandbox for isolating tests
    const sandbox = sinon.createSandbox();

    // RobisepType for the pickup and delivery task
    let robisepTypeMock: RobisepType;

    // Rooms for the pickup and delivery task
    let room1Mock: Room;
    let room2Mock: Room;

    beforeEach(() => {
      robisepTypeMock = RobisepTypeDataSource.getRobisepTypeA();
      room1Mock = RoomDataSource.getRoomA();
      room2Mock = RoomDataSource.getRoomProlog1();
    });

    afterEach(() => {
      sandbox.restore();
      sinon.restore();
    });

    it('should create a pickup and delivery task', () => {
      // Arrange
      const pickUpPersonContact = {
        personPhoneNumber: PhoneNumber.create('912345678').getValue(),
        personPersonalName: PersonalName.create('John').getValue(),
      };

      const deliveryPersonContact = {
        personPhoneNumber: PhoneNumber.create('919876543').getValue(),
        personPersonalName: PersonalName.create('Jane').getValue(),
      };

      const pickUpAndDeliveryTaskProps = {
        taskState: TaskState.REQUESTED,
        taskCode: TaskCode.create(123).getValue(),
        email: '1211@isep.ipp.pt',
        robisepType: robisepTypeMock,
        pickUpPersonContact: PickUpAndDeliveryTaskPersonContact.create(pickUpPersonContact).getValue(),
        pickUpRoom: room1Mock,
        deliveryPersonContact: PickUpAndDeliveryTaskPersonContact.create(deliveryPersonContact).getValue(),
        deliveryRoom: room2Mock,
        description: PickUpAndDeliveryTaskDescription.create('description').getValue(),
        confirmationCode: PickUpAndDeliveryTaskConfirmationCode.create(12345).getValue(),
      };

      // Act
      const pickUpAndDeliveryTaskResult = PickUpAndDeliveryTask.create(pickUpAndDeliveryTaskProps);

      // Assert
      sinon.assert.match(pickUpAndDeliveryTaskResult.isSuccess, true);

      const pickUpAndDeliveryTask = pickUpAndDeliveryTaskResult.getValue();
      sinon.assert.match(pickUpAndDeliveryTask.taskState, TaskState.REQUESTED);
      sinon.assert.match(pickUpAndDeliveryTask.robisepType, robisepTypeMock);
      sinon.assert.match(pickUpAndDeliveryTask.pickUpPersonContact, pickUpPersonContact);
      sinon.assert.match(pickUpAndDeliveryTask.pickUpRoom, room1Mock);
      sinon.assert.match(pickUpAndDeliveryTask.deliveryPersonContact, deliveryPersonContact);
      sinon.assert.match(pickUpAndDeliveryTask.deliveryRoom, room2Mock);
      sinon.assert.match(pickUpAndDeliveryTask.description.value, 'description');
      sinon.assert.match(pickUpAndDeliveryTask.confirmationCode.value, 12345);
    });

    it('should create a pickup and delivery task, when domain id is provided', () => {
      // Arrange
      const pickUpPersonContact = {
        personPhoneNumber: PhoneNumber.create('912345678').getValue(),
        personPersonalName: PersonalName.create('John').getValue(),
      };

      const deliveryPersonContact = {
        personPhoneNumber: PhoneNumber.create('919876543').getValue(),
        personPersonalName: PersonalName.create('Jane').getValue(),
      };

      const pickUpAndDeliveryTaskProps = {
          taskState: TaskState.REQUESTED,
          taskCode: TaskCode.create(123).getValue(),
          email: '1211@isep.ipp.pt',
          robisepType: robisepTypeMock,
          pickUpPersonContact: PickUpAndDeliveryTaskPersonContact.create(pickUpPersonContact).getValue(),
          pickUpRoom: room1Mock,
          deliveryPersonContact: PickUpAndDeliveryTaskPersonContact.create(deliveryPersonContact).getValue(),
          deliveryRoom: room2Mock,
          description: PickUpAndDeliveryTaskDescription.create('description').getValue(),
          confirmationCode: PickUpAndDeliveryTaskConfirmationCode.create(12345).getValue(),
        },
        pickUpAndDeliveryTaskId = new UniqueEntityID('123');

      // Act
      const pickUpAndDeliveryTaskResult = PickUpAndDeliveryTask.create(
        pickUpAndDeliveryTaskProps,
        pickUpAndDeliveryTaskId,
      );

      // Assert
      sinon.assert.match(pickUpAndDeliveryTaskResult.isSuccess, true);

      const pickUpAndDeliveryTask = pickUpAndDeliveryTaskResult.getValue();
      sinon.assert.match(pickUpAndDeliveryTask.id, pickUpAndDeliveryTaskId);
    });

    it('should create a pickup and delivery task, when robisep is provided', () => {
      // Arrange
      const pickUpPersonContact = {
        personPhoneNumber: PhoneNumber.create('912345678').getValue(),
        personPersonalName: PersonalName.create('John').getValue(),
      };

      const deliveryPersonContact = {
        personPhoneNumber: PhoneNumber.create('919876543').getValue(),
        personPersonalName: PersonalName.create('Jane').getValue(),
      };

      const pickUpAndDeliveryTaskProps = {
        taskState: TaskState.REQUESTED,
        taskCode: TaskCode.create(123).getValue(),
        email: '1211@isep.ipp.pt',
        robisepType: robisepTypeMock,
        pickUpPersonContact: PickUpAndDeliveryTaskPersonContact.create(pickUpPersonContact).getValue(),
        pickUpRoom: room1Mock,
        deliveryPersonContact: PickUpAndDeliveryTaskPersonContact.create(deliveryPersonContact).getValue(),
        deliveryRoom: room2Mock,
        description: PickUpAndDeliveryTaskDescription.create('description').getValue(),
        confirmationCode: PickUpAndDeliveryTaskConfirmationCode.create(12345).getValue(),
        robisep: RobisepDataSource.getRobisepA(),
      };

      // Act
      const pickUpAndDeliveryTaskResult = PickUpAndDeliveryTask.create(pickUpAndDeliveryTaskProps);

      // Assert
      sinon.assert.match(pickUpAndDeliveryTaskResult.isSuccess, true);
    });

    describe('Invalid Pickup and Delivery Task Creation', () => {
      // Create sinon sandbox for isolating tests
      const sandbox = sinon.createSandbox();

      // RobisepType for the Pickup and delivery task
      let robisepTypeMock: RobisepType;

      // Rooms for the pickup and delivery task
      let room1Mock: Room;
      let room2Mock: Room;

      beforeEach(() => {
        robisepTypeMock = RobisepTypeDataSource.getRobisepTypeA();
        room1Mock = RoomDataSource.getRoomA();
        room2Mock = RoomDataSource.getRoomProlog1();
      });

      afterEach(() => {
        sandbox.restore();
        sinon.restore();
      });

      it('should fail to create a pickup and delivery task with null or undefined field', () => {
        // Arrange
        const deliveryPersonContact = {
          personPhoneNumber: PhoneNumber.create('919876543').getValue(),
          personPersonalName: PersonalName.create('Jane').getValue(),
        };

        const pickUpAndDeliveryTaskProps = {
          taskState: TaskState.REQUESTED,
          taskCode: TaskCode.create(123).getValue(),
          email: '1211@isep.ipp.pt',
          robisepType: robisepTypeMock,
          pickUpPersonContact: null,
          pickUpRoom: room1Mock,
          deliveryPersonContact: PickUpAndDeliveryTaskPersonContact.create(deliveryPersonContact).getValue(),
          deliveryRoom: room2Mock,
          description: PickUpAndDeliveryTaskDescription.create('description').getValue(),
          confirmationCode: PickUpAndDeliveryTaskConfirmationCode.create(12345).getValue(),
        };

        // Act
        const pickUpAndDeliveryTaskResult = PickUpAndDeliveryTask.create(pickUpAndDeliveryTaskProps);

        // Assert
        sinon.assert.match(pickUpAndDeliveryTaskResult.isFailure, true);
        sinon.assert.match(pickUpAndDeliveryTaskResult.errorValue(), 'pickUpPersonContact is null or undefined');
      });

      it('should fail to create a pickup and delivery task when pickup and delivery room are the same', () => {
        // Arrange
        const pickUpPersonContact = {
          personPhoneNumber: PhoneNumber.create('912345678').getValue(),
          personPersonalName: PersonalName.create('John').getValue(),
        };

        const deliveryPersonContact = {
          personPhoneNumber: PhoneNumber.create('919876543').getValue(),
          personPersonalName: PersonalName.create('Jane').getValue(),
        };

        const pickUpAndDeliveryTaskProps = {
          taskState: TaskState.REQUESTED,
          taskCode: TaskCode.create(123).getValue(),
          email: '1211@isep.ipp.pt',
          robisepType: robisepTypeMock,
          pickUpPersonContact: PickUpAndDeliveryTaskPersonContact.create(pickUpPersonContact).getValue(),
          pickUpRoom: room1Mock,
          deliveryPersonContact: PickUpAndDeliveryTaskPersonContact.create(deliveryPersonContact).getValue(),
          deliveryRoom: room1Mock,
          description: PickUpAndDeliveryTaskDescription.create('description').getValue(),
          confirmationCode: PickUpAndDeliveryTaskConfirmationCode.create(12345).getValue(),
        };

        // Act
        const pickUpAndDeliveryTaskResult = PickUpAndDeliveryTask.create(pickUpAndDeliveryTaskProps);

        // Assert
        sinon.assert.match(pickUpAndDeliveryTaskResult.isFailure, true);
        sinon.assert.match(pickUpAndDeliveryTaskResult.errorValue(), 'The pick up and delivery rooms are the same.');
      });

      it('should fail to create a pickup and delivery task, when robisep type is not capable of executing surveillance task', () => {
        // Arrange
        const pickUpPersonContact = {
          personPhoneNumber: PhoneNumber.create('912345678').getValue(),
          personPersonalName: PersonalName.create('John').getValue(),
        };

        const deliveryPersonContact = {
          personPhoneNumber: PhoneNumber.create('919876543').getValue(),
          personPersonalName: PersonalName.create('Jane').getValue(),
        };

        const pickUpAndDeliveryTaskProps = {
          taskState: TaskState.REQUESTED,
          taskCode: TaskCode.create(123).getValue(),
          email: '1211@isep.ipp.pt',
          robisepType: RobisepTypeDataSource.getRobisepTypeB(),
          pickUpPersonContact: PickUpAndDeliveryTaskPersonContact.create(pickUpPersonContact).getValue(),
          pickUpRoom: room1Mock,
          deliveryPersonContact: PickUpAndDeliveryTaskPersonContact.create(deliveryPersonContact).getValue(),
          deliveryRoom: room2Mock,
          description: PickUpAndDeliveryTaskDescription.create('description').getValue(),
          confirmationCode: PickUpAndDeliveryTaskConfirmationCode.create(12345).getValue(),
        };

        // Act
        const pickUpAndDeliveryTaskResult = PickUpAndDeliveryTask.create(pickUpAndDeliveryTaskProps);

        // Assert
        sinon.assert.match(pickUpAndDeliveryTaskResult.isFailure, true);
        sinon.assert.match(
          pickUpAndDeliveryTaskResult.errorValue(),
          'The robot type RobisepType B is not capable of surveillance.',
        );
      });
    });
  });
});

describe('Pickup and delivery Task Acceptance', () => {
  describe('Valid Pickup and delivery Task Acceptance', () => {
    it('should accept a pickup and delivery task', () => {
      // Arrange
      const task = pickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTask();

      // Act
      task.accept();

      // Assert
      sinon.assert.match(task.taskState, TaskState.ACCEPTED);
    });
  });

  describe('Invalid Pickup and delivery Task Acceptance', () => {
    it('should fail to accept a pickup and delivery task when it is already accepted', () => {
      // Arrange
      const task = pickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTask();
      task.accept();

      // Act & Assert
      assert.throws(() => task.accept(), Error, 'Task already accepted.');
    });

    it('should fail to accept a pickup and delivery task when it is already refused', () => {
      // Arrange
      const task = pickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTask();
      task.refuse();

      // Act & Assert
      assert.throws(() => task.accept(), Error, "You can't accept a refused task.");
    });
  });
});

describe('Pickup and delivery Task Rejection', () => {
  describe('Valid Pickup and delivery Task Rejection', () => {
    it('should reject a pickup and delivery task', () => {
      // Arrange
      const task = pickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTask();

      // Act
      task.refuse();

      // Assert
      sinon.assert.match(task.taskState, TaskState.REFUSED);
    });
  });

  describe('Invalid Pickup and delivery Task Rejection', () => {
    it('should fail to reject a pickup and delivery task when it is already refused', () => {
      // Arrange
      const task = pickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTask();
      task.refuse();

      // Act & Assert
      assert.throws(() => task.refuse(), Error, 'Task already refused.');
    });
  });
});
