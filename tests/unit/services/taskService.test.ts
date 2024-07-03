import 'reflect-metadata';
import * as sinon from 'sinon';
import { expect } from 'chai';

import { UniqueEntityID } from '../../../src/core/domain/UniqueEntityID';
import TaskService from '../../../src/services/ServicesImpl/taskService';
import { RobisepType } from '../../../src/domain/robisepType/RobisepType';
import RobisepTypeDataSource from '../../datasource/robisepTypeDataSource';
import { SurveillanceTask } from '../../../src/domain/task/surveillanceTask/surveillanceTask';
import { PhoneNumber } from '../../../src/domain/common/phoneNumber';
import { TaskState } from '../../../src/domain/task/taskState';
import { Room } from '../../../src/domain/room/Room';
import RoomDataSource from '../../datasource/RoomDataSource';
import { PickUpAndDeliveryTask } from '../../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTask';
import { PersonalName } from '../../../src/domain/common/personalName';
import { PickUpAndDeliveryTaskPersonContact } from '../../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskPersonContact';
import { PickUpAndDeliveryTaskDescription } from '../../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskDescription';
import { PickUpAndDeliveryTaskConfirmationCode } from '../../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskConfirmationCode';
import SurveillanceTaskDataSource from '../../datasource/task/surveillanceTaskDataSource';
import PickUpAndDeliveryTaskDataSource from '../../datasource/task/pickUpAndDeliveryTaskDataSource';
import { TaskCode } from '../../../src/domain/task/taskCode';
import RobisepDataSource from '../../datasource/RobisepDataSource';
import { Result } from '../../../src/core/logic/Result';
import ITaskSequenceOutDTO from '../../../src/dto/out/ITaskSequenceOutDto';
import ITaskSequenceDTO from '../../../src/dto/out/ITaskSequenceDTO';
import { TaskType } from '../../../src/domain/common/TaskType';

describe('TaskService', () => {
  const sandbox = sinon.createSandbox();

  describe('requestTask', () => {
    describe('invalid input', () => {
      // service
      let taskService: TaskService;

      // Mocks
      let loggerMock: any;
      let taskFactoryMock: any;
      let surveillanceTaskRepoMock: any;
      let pickUpAndDeliveryTaskRepoMock: any;
      let robisepRepoMock: any;
      let userGatewayMock: any;
      let taskGatewayMock: any;

      // RobisepType
      let robisepType: RobisepType;

      // Rooms
      let room1: Room;
      let room2: Room;

      // Rooms
      let startingPointToWatch: Room;
      let endingPointToWatch: Room;

      beforeEach(() => {
        loggerMock = {
          error: sinon.stub(),
        };

        taskFactoryMock = {
          createSurveillanceTask: sinon.stub(),
        };

        surveillanceTaskRepoMock = {
          save: sinon.stub(),
        };

        robisepRepoMock = {
          findByDomainId: sinon.stub(),
        };

        pickUpAndDeliveryTaskRepoMock = {};

        userGatewayMock = {
          getEmailByIamId: sinon.stub(),
        };

        taskGatewayMock = {
          getTaskSequeceByRobisepId: sinon.stub(),
        };

        robisepType = RobisepTypeDataSource.getRobisepTypeA();

        room1 = RoomDataSource.getRoomA();
        room2 = RoomDataSource.getRoomProlog1();

        startingPointToWatch = RoomDataSource.getFirstRoomT();
        endingPointToWatch = RoomDataSource.getSecondRoomT();

        taskService = new TaskService(
          taskFactoryMock,
          surveillanceTaskRepoMock,
          pickUpAndDeliveryTaskRepoMock,
          robisepRepoMock,
          userGatewayMock,
          taskGatewayMock,
          loggerMock,
        );
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should fail to request a task, no task type introduced', async () => {
        // Arrange
        const iamId = 'iamId';

        const taskDto = {
          domainId: 'domainId',
          robisepType: robisepType.id.toString(),
          iamId: iamId,
          taskCode: 123456,
        };

        // Act
        const result = await taskService.requestTask(taskDto);

        // Assert
        expect(result.isFailure).to.be.true;
        expect(result.error).to.equal('The requesting task must have a task type.');
      });

      it('should fail to request a task, task type not recognized', async () => {
        // Arrange
        const iamId = 'iamId';

        const taskDto = {
          domainId: 'domainId',
          robisepType: robisepType.id.toString(),
          iamId: iamId,
          taskCode: 123456,
          taskType: 'Invalid',
        };

        const taskTypeOrError = {
          getValue: sinon.stub().returns(null),
          isFailure: false,
        };

        const retrieveTaskTypeStub = sinon.stub(taskService, 'retrieveTaskType');
        retrieveTaskTypeStub.returns(taskTypeOrError);

        // Mock the userGateway return value
        userGatewayMock.getEmailByIamId.resolves('email@isep.ipp.pt');

        // Act
        const result = await taskService.requestTask(taskDto);

        retrieveTaskTypeStub.restore();

        // Assert
        expect(result.isFailure).to.be.true;
        expect(result.error).to.equal('Task type not found.');
      });

      it('should fail to request a task, multiple task type introduced', async () => {
        // Arrange
        const iamId = 'iamId';

        const taskDto = {
          domainId: 'domainId',
          robisepType: robisepType.id.toString(),
          taskCode: 123456,
          iamId: iamId,
          surveillanceTask: {
            emergencyPhoneNumber: '912345678',
            startingPointToWatch: startingPointToWatch.id.toString(),
            endingPointToWatch: endingPointToWatch.id.toString(),
          },
          pickUpAndDeliveryTask: {
            pickUpPersonContact: {
              name: 'John Doe',
              phoneNumber: '912345678',
            },
            pickUpRoom: room1.id.toString(),
            deliveryPersonContact: {
              name: 'Jane Doe',
              phoneNumber: '912543876',
            },
            deliveryRoom: room2.id.toString(),
            description: 'Pick up and delivery task description',
            confirmationCode: 123456,
          },
        };

        // Act
        const result = await taskService.requestTask(taskDto);

        // Assert
        expect(result.isFailure).to.be.true;
        expect(result.error).to.equal('The requesting task must have only one task type.');
      });

      it('should fail to request a task, iamId not known', async () => {
        // Arrange
        const iamId = 'iamId';

        const taskDto = {
          domainId: 'domainId',
          robisepType: robisepType.id.toString(),
          taskCode: 123456,
          iamId: iamId,
          surveillanceTask: {
            emergencyPhoneNumber: '912345678',
            startingPointToWatch: startingPointToWatch.id.toString(),
            endingPointToWatch: endingPointToWatch.id.toString(),
          },
        };

        const taskTypeOrError = {
          getValue: sinon.stub().returns(null),
          isFailure: true,
          error: 'User not found.',
        };

        // Mock the userGateway return value
        userGatewayMock.getEmailByIamId.resolves(taskTypeOrError);

        // Act
        const result = await taskService.requestTask(taskDto);

        // Assert
        expect(result.isFailure).to.be.true;
        expect(result.error).to.equal('User not found.');
      });
    });
  });

  describe('requestTask -> requestSurveillanceTask', () => {
    describe('valid input', () => {
      // service
      let taskService: TaskService;

      // Mocks
      let loggerMock: any;
      let taskFactoryMock: any;
      let surveillanceTaskRepoMock: any;
      let pickUpAndDeliveryTaskRepoMock: any;
      let robisepRepoMock: any;
      let userGatewayMock: any;
      let taskGatewayMock: any;

      // RobisepType
      let robisepType: RobisepType;

      // Rooms
      let startingPointToWatch: Room;
      let endingPointToWatch: Room;

      beforeEach(() => {
        loggerMock = {
          error: sinon.stub(),
        };

        taskFactoryMock = {
          createSurveillanceTask: sinon.stub(),
        };

        surveillanceTaskRepoMock = {
          save: sinon.stub(),
        };

        pickUpAndDeliveryTaskRepoMock = {};

        robisepRepoMock = {
          findByDomainId: sinon.stub(),
        };

        userGatewayMock = {
          getEmailByIamId: sinon.stub(),
        };

        taskGatewayMock = {
          getTaskSequeceByRobisepId: sinon.stub(),
        };

        robisepType = RobisepTypeDataSource.getRobisepTypeB();

        startingPointToWatch = RoomDataSource.getFirstRoomT();
        endingPointToWatch = RoomDataSource.getSecondRoomT();

        taskService = new TaskService(
          taskFactoryMock,
          surveillanceTaskRepoMock,
          pickUpAndDeliveryTaskRepoMock,
          robisepRepoMock,
          userGatewayMock,
          taskGatewayMock,
          loggerMock,
        );
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should request a surveillance task successfully', async () => {
        // Arrange
        const iamId = 'iamId';

        const taskDto = {
          domainId: 'domainId',
          robisepType: robisepType.id.toString(),
          taskCode: 123,
          iamId: iamId,
          surveillanceTask: {
            emergencyPhoneNumber: '912345678',
            startingPointToWatch: startingPointToWatch.id.toString(),
            endingPointToWatch: endingPointToWatch.id.toString(),
          },
        };

        const taskState = TaskState.REQUESTED;

        const surveillanceTask = SurveillanceTask.create(
          {
            taskState,
            taskCode: TaskCode.create(123).getValue(),
            email: 'email@isep.ipp.pt',
            robisepType,
            emergencyPhoneNumber: PhoneNumber.create(taskDto.surveillanceTask.emergencyPhoneNumber).getValue(),
            startingPointToWatch: startingPointToWatch,
            endingPointToWatch: endingPointToWatch,
          },
          new UniqueEntityID(taskDto.domainId),
        ).getValue();

        const surveillanceTaskOrErrorMock = {
          getValue: sinon.stub().returns(surveillanceTask),
          isFailure: false,
        };

        // Mock the taskFactory return value
        taskFactoryMock.createSurveillanceTask.resolves(surveillanceTaskOrErrorMock);

        // Mock the surveillanceTaskRepo return value
        surveillanceTaskRepoMock.save.resolves(surveillanceTask);

        // User gateway returns result with email
        const emailOrError = {
          getValue: sinon.stub().returns('email@isep.ipp.pt'),
          isFailure: false,
        };

        // Mock the userGateway return value
        userGatewayMock.getEmailByIamId.resolves(emailOrError);

        // Act
        const result = await taskService.requestTask(taskDto);

        // Assert
        expect(result.isSuccess).to.be.true;
        expect(result.getValue().domainId).to.equal(taskDto.domainId);
        expect(result.getValue().state).to.equal(taskState);
        expect(result.getValue().robisepType.domainId.toString()).to.equal(robisepType.id.toString());
        expect(result.getValue().surveillanceTask.emergencyPhoneNumber).to.equal(
          taskDto.surveillanceTask.emergencyPhoneNumber,
        );
        expect(result.getValue().surveillanceTask.startingPointToWatch.domainId.toString()).to.equal(
          startingPointToWatch.id.toString(),
        );
        expect(result.getValue().surveillanceTask.endingPointToWatch.domainId.toString()).to.equal(
          endingPointToWatch.id.toString(),
        );
      });
    });

    describe('invalid input', () => {
      // service
      let taskService: TaskService;

      // Mocks
      let loggerMock: any;
      let taskFactoryMock: any;
      let surveillanceTaskRepoMock: any;
      let pickUpAndDeliveryTaskRepoMock: any;
      let robisepRepoMock: any;
      let userGatewayMock: any;
      let taskGatewayMock: any;

      // RobisepType
      let robisepType: RobisepType;

      // Rooms
      let startingPointToWatch: Room;
      let endingPointToWatch: Room;

      beforeEach(() => {
        loggerMock = {
          error: sinon.stub(),
        };

        taskFactoryMock = {
          createSurveillanceTask: sinon.stub(),
        };

        surveillanceTaskRepoMock = {
          save: sinon.stub(),
        };

        pickUpAndDeliveryTaskRepoMock = {};

        robisepRepoMock = {
          findByDomainId: sinon.stub(),
        };

        userGatewayMock = {
          getEmailByIamId: sinon.stub(),
        };

        taskGatewayMock = {
          getTaskSequeceByRobisepId: sinon.stub(),
        };

        robisepType = RobisepTypeDataSource.getRobisepTypeB();

        startingPointToWatch = RoomDataSource.getFirstRoomT();
        endingPointToWatch = RoomDataSource.getSecondRoomT();

        taskService = new TaskService(
          taskFactoryMock,
          surveillanceTaskRepoMock,
          pickUpAndDeliveryTaskRepoMock,
          robisepRepoMock,
          userGatewayMock,
          taskGatewayMock,
          loggerMock,
        );
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should fail to request a surveillance task, taskFactory fails', async () => {
        // Arrange
        const iamId = 'iamId';

        const taskDto = {
          domainId: 'domainId',
          robisepType: robisepType.id.toString(),
          taskCode: 123,
          iamId: iamId,
          surveillanceTask: {
            emergencyPhoneNumber: 'Invalid',
            startingPointToWatch: startingPointToWatch.id.toString(),
            endingPointToWatch: endingPointToWatch.id.toString(),
          },
        };

        const surveillanceTaskOrErrorMock = {
          getValue: sinon.stub().returns(null),
          isFailure: true,
          error: 'Phone Number is not following a valid format.',
        };

        // User gateway returns result with email
        const emailOrError = {
          getValue: sinon.stub().returns('email@isep.ipp.pt'),
          isFailure: false,
        };

        // Mock the userGateway return value
        userGatewayMock.getEmailByIamId.resolves(emailOrError);

        // Mock the taskFactory return value
        taskFactoryMock.createSurveillanceTask.resolves(surveillanceTaskOrErrorMock);

        // Act
        const result = await taskService.requestTask(taskDto);

        // Assert
        expect(result.isFailure).to.be.true;
        expect(result.error).to.equal('Phone Number is not following a valid format.');
      });

      it('should fail to request a surveillance task, surveillanceTaskRepo fails', async () => {
        // Arrange
        const iamId = 'iamId';

        const taskDto = {
          domainId: 'domainId',
          robisepType: robisepType.id.toString(),
          taskCode: 123,
          iamId: iamId,
          surveillanceTask: {
            emergencyPhoneNumber: '912345678',
            startingPointToWatch: startingPointToWatch.id.toString(),
            endingPointToWatch: endingPointToWatch.id.toString(),
          },
        };

        const taskState = TaskState.REQUESTED;

        const surveillanceTask = SurveillanceTask.create(
          {
            taskState,
            robisepType,
            taskCode: TaskCode.create(123).getValue(),
            email: 'email@isep.ipp.pt',
            emergencyPhoneNumber: PhoneNumber.create(taskDto.surveillanceTask.emergencyPhoneNumber).getValue(),
            startingPointToWatch: startingPointToWatch,
            endingPointToWatch: endingPointToWatch,
          },
          new UniqueEntityID(taskDto.domainId),
        ).getValue();

        const surveillanceTaskOrErrorMock = {
          getValue: sinon.stub().returns(surveillanceTask),
          isFailure: false,
        };

        // Mock the taskFactory return value
        taskFactoryMock.createSurveillanceTask.resolves(surveillanceTaskOrErrorMock);

        // User gateway returns result with email
        const emailOrError = {
          getValue: sinon.stub().returns('email@isep.ipp.pt'),
          isFailure: false,
        };

        // Mock the userGateway return value
        userGatewayMock.getEmailByIamId.resolves(emailOrError);

        // Mock the surveillanceTaskRepo return value
        surveillanceTaskRepoMock.save.resolves(null);

        // Act
        const result = await taskService.requestTask(taskDto);

        // Assert
        expect(result.isFailure).to.be.true;
        expect(result.error).to.equal('Task with domainId already exists.');
      });
    });
  });

  describe('requestTask -> requestPickUpAndDeliveryTask', () => {
    describe('valid input', () => {
      // service
      let taskService: TaskService;

      // Mocks
      let loggerMock: any;
      let taskFactoryMock: any;
      let surveillanceTaskRepoMock: any;
      let pickUpAndDeliveryTaskRepoMock: any;
      let robisepRepoMock: any;
      let userGatewayMock: any;
      let taskGatewayMock: any;

      // RobisepType
      let robisepType: RobisepType;

      // Rooms
      let room1: Room;
      let room2: Room;

      beforeEach(() => {
        loggerMock = {
          error: sinon.stub(),
        };

        taskFactoryMock = {
          createPickUpAndDeliveryTask: sinon.stub(),
        };

        surveillanceTaskRepoMock = {};

        pickUpAndDeliveryTaskRepoMock = {
          save: sinon.stub(),
        };

        robisepRepoMock = {
          findByDomainId: sinon.stub(),
        };

        userGatewayMock = {
          getEmailByIamId: sinon.stub(),
        };

        taskGatewayMock = {
          getTaskSequeceByRobisepId: sinon.stub(),
        };

        robisepType = RobisepTypeDataSource.getRobisepTypeA();

        room1 = RoomDataSource.getRoomA();
        room2 = RoomDataSource.getRoomProlog1();

        taskService = new TaskService(
          taskFactoryMock,
          surveillanceTaskRepoMock,
          pickUpAndDeliveryTaskRepoMock,
          robisepRepoMock,
          userGatewayMock,
          taskGatewayMock,
          loggerMock,
        );
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should request a pickup and delivery task successfully', async () => {
        // Arrange
        const iamId = 'iamId';

        const pickUpPersonContact = {
          name: 'John Doe',
          phoneNumber: '912345678',
        };

        const deliveryPersonContact = {
          name: 'Jane Doe',
          phoneNumber: '912543876',
        };

        const taskDto = {
          domainId: 'domainId',
          robisepType: robisepType.id.toString(),
          taskCode: 123456,
          iamId: iamId,
          pickUpAndDeliveryTask: {
            pickUpPersonContact: pickUpPersonContact,
            pickUpRoom: room1.id.toString(),
            deliveryPersonContact: deliveryPersonContact,
            deliveryRoom: room2.id.toString(),
            description: 'Pick up and delivery task description',
            confirmationCode: 123456,
          },
        };

        const taskState = TaskState.REQUESTED;

        const pickUpPersonPhoneNumber = PhoneNumber.create(pickUpPersonContact.phoneNumber).getValue();
        const deliveryPersonPhoneNumber = PhoneNumber.create(deliveryPersonContact.phoneNumber).getValue();

        const pickUpPersonName = PersonalName.create(pickUpPersonContact.name).getValue();
        const deliveryPersonName = PersonalName.create(deliveryPersonContact.name).getValue();

        const pickUpAndDeliveryTask = PickUpAndDeliveryTask.create(
          {
            taskState,
            taskCode: TaskCode.create(123456).getValue(),
            email: 'email@isep.ipp.pt',
            robisepType,
            pickUpPersonContact: PickUpAndDeliveryTaskPersonContact.create({
              personPhoneNumber: pickUpPersonPhoneNumber,
              personPersonalName: pickUpPersonName,
            }).getValue(),
            pickUpRoom: room1,
            deliveryPersonContact: PickUpAndDeliveryTaskPersonContact.create({
              personPhoneNumber: deliveryPersonPhoneNumber,
              personPersonalName: deliveryPersonName,
            }).getValue(),
            deliveryRoom: room2,
            description: PickUpAndDeliveryTaskDescription.create(taskDto.pickUpAndDeliveryTask.description).getValue(),
            confirmationCode: PickUpAndDeliveryTaskConfirmationCode.create(
              taskDto.pickUpAndDeliveryTask.confirmationCode,
            ).getValue(),
          },
          new UniqueEntityID(taskDto.domainId),
        ).getValue();

        const pickUpAndDeliveryTaskOrErrorMock = {
          getValue: sinon.stub().returns(pickUpAndDeliveryTask),
          isFailure: false,
        };

        // Mock the taskFactory return value
        taskFactoryMock.createPickUpAndDeliveryTask.resolves(pickUpAndDeliveryTaskOrErrorMock);

        // User gateway returns result with email
        const emailOrError = {
          getValue: sinon.stub().returns('email@isep.ipp.pt'),
          isFailure: false,
        };

        // Mock the userGateway return value
        userGatewayMock.getEmailByIamId.resolves(emailOrError);

        // Mock the pickUpAndDeliveryTaskRepo return value
        pickUpAndDeliveryTaskRepoMock.save.resolves(pickUpAndDeliveryTask);

        // Act
        const result = await taskService.requestTask(taskDto);

        // Assert
        expect(result.isSuccess).to.be.true;
        expect(result.getValue().domainId).to.equal(taskDto.domainId);
        expect(result.getValue().state).to.equal(taskState);
        expect(result.getValue().robisepType.domainId.toString()).to.equal(robisepType.id.toString());
        expect(result.getValue().pickUpAndDeliveryTask.pickUpPersonContact.phoneNumber).to.equal(
          pickUpPersonPhoneNumber.value,
        );
        expect(result.getValue().pickUpAndDeliveryTask.pickUpPersonContact.name).to.equal(pickUpPersonName.value);
        expect(result.getValue().pickUpAndDeliveryTask.pickUpRoom.domainId.toString()).to.equal(room1.id.toString());
        expect(result.getValue().pickUpAndDeliveryTask.deliveryPersonContact.phoneNumber).to.equal(
          deliveryPersonPhoneNumber.value,
        );
        expect(result.getValue().pickUpAndDeliveryTask.deliveryPersonContact.name).to.equal(deliveryPersonName.value);
        expect(result.getValue().pickUpAndDeliveryTask.deliveryRoom.domainId.toString()).to.equal(room2.id.toString());
        expect(result.getValue().pickUpAndDeliveryTask.description).to.equal(taskDto.pickUpAndDeliveryTask.description);
        expect(result.getValue().pickUpAndDeliveryTask.confirmationCode).to.equal(
          taskDto.pickUpAndDeliveryTask.confirmationCode,
        );
      });
    });

    describe('invalid input', () => {
      // service
      let taskService: TaskService;

      // Mocks
      let loggerMock: any;
      let taskFactoryMock: any;
      let surveillanceTaskRepoMock: any;
      let pickUpAndDeliveryTaskRepoMock: any;
      let robisepRepoMock: any;
      let userGatewayMock: any;
      let taskGatewayMock: any;

      // RobisepType
      let robisepType: RobisepType;

      // Rooms
      let room1: Room;
      let room2: Room;

      beforeEach(() => {
        loggerMock = {
          error: sinon.stub(),
        };

        taskFactoryMock = {
          createPickUpAndDeliveryTask: sinon.stub(),
        };

        surveillanceTaskRepoMock = {};

        pickUpAndDeliveryTaskRepoMock = {
          save: sinon.stub(),
        };

        robisepRepoMock = {
          findByDomainId: sinon.stub(),
        };

        userGatewayMock = {
          getEmailByIamId: sinon.stub(),
        };

        taskGatewayMock = {
          getTaskSequeceByRobisepId: sinon.stub(),
        };

        robisepType = RobisepTypeDataSource.getRobisepTypeA();

        room1 = RoomDataSource.getRoomA();
        room2 = RoomDataSource.getRoomProlog1();

        taskService = new TaskService(
          taskFactoryMock,
          surveillanceTaskRepoMock,
          pickUpAndDeliveryTaskRepoMock,
          robisepRepoMock,
          userGatewayMock,
          taskGatewayMock,
          loggerMock,
        );
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should fail to request a pickup and delivery, taskFactory fails', async () => {
        // Arrange
        const iamId = 'iamId';

        const pickUpPersonContact = {
          name: 'John Doe',
          phoneNumber: '912345678',
        };

        const deliveryPersonContact = {
          name: 'Jane Doe',
          phoneNumber: '912543876',
        };

        const taskDto = {
          domainId: 'domainId',
          robisepType: robisepType.id.toString(),
          taskCode: 123456,
          iamId: iamId,
          pickUpAndDeliveryTask: {
            pickUpPersonContact: pickUpPersonContact,
            pickUpRoom: room1.id.toString(),
            deliveryPersonContact: deliveryPersonContact,
            deliveryRoom: room2.id.toString(),
            description: 'Pick up and delivery task description',
            confirmationCode: 123456,
          },
        };

        const pickUpAndDeliveryTaskOrErrorMock = {
          getValue: sinon.stub().returns(null),
          isFailure: true,
          error: 'Phone Number is not following a valid format.',
        };

        // Mock the taskFactory return value
        taskFactoryMock.createPickUpAndDeliveryTask.resolves(pickUpAndDeliveryTaskOrErrorMock);

        // User gateway returns result with email
        const emailOrError = {
          getValue: sinon.stub().returns('email@isep.ipp.pt'),
          isFailure: false,
        };

        // Mock the userGateway return value
        userGatewayMock.getEmailByIamId.resolves(emailOrError);

        // Act
        const result = await taskService.requestTask(taskDto);

        // Assert
        expect(result.isFailure).to.be.true;
        expect(result.error).to.equal('Phone Number is not following a valid format.');
      });

      it('should fail to request a pickup and delivery, pickUpAndDeliveryTaskRepo fails', async () => {
        // Arrange
        const iamId = 'iamId';

        const pickUpPersonContact = {
          name: 'John Doe',
          phoneNumber: '912345678',
        };

        const deliveryPersonContact = {
          name: 'Jane Doe',
          phoneNumber: '912543876',
        };

        const taskDto = {
          domainId: 'domainId',
          robisepType: robisepType.id.toString(),
          taskCode: 123456,
          iamId: iamId,
          pickUpAndDeliveryTask: {
            pickUpPersonContact: pickUpPersonContact,
            pickUpRoom: room1.id.toString(),
            deliveryPersonContact: deliveryPersonContact,
            deliveryRoom: room2.id.toString(),
            description: 'Pick up and delivery task description',
            confirmationCode: 123456,
          },
        };

        const taskState = TaskState.REQUESTED;

        const pickUpPersonPhoneNumber = PhoneNumber.create(pickUpPersonContact.phoneNumber).getValue();
        const deliveryPersonPhoneNumber = PhoneNumber.create(deliveryPersonContact.phoneNumber).getValue();

        const pickUpPersonName = PersonalName.create(pickUpPersonContact.name).getValue();
        const deliveryPersonName = PersonalName.create(deliveryPersonContact.name).getValue();

        const pickUpAndDeliveryTask = PickUpAndDeliveryTask.create(
          {
            taskState,
            robisepType,
            taskCode: TaskCode.create(123456).getValue(),
            email: 'email@isep.ipp.pt',
            pickUpPersonContact: PickUpAndDeliveryTaskPersonContact.create({
              personPhoneNumber: pickUpPersonPhoneNumber,
              personPersonalName: pickUpPersonName,
            }).getValue(),
            pickUpRoom: room1,
            deliveryPersonContact: PickUpAndDeliveryTaskPersonContact.create({
              personPhoneNumber: deliveryPersonPhoneNumber,
              personPersonalName: deliveryPersonName,
            }).getValue(),
            deliveryRoom: room2,
            description: PickUpAndDeliveryTaskDescription.create(taskDto.pickUpAndDeliveryTask.description).getValue(),
            confirmationCode: PickUpAndDeliveryTaskConfirmationCode.create(
              taskDto.pickUpAndDeliveryTask.confirmationCode,
            ).getValue(),
          },
          new UniqueEntityID(taskDto.domainId),
        ).getValue();

        const pickUpAndDeliveryTaskOrErrorMock = {
          getValue: sinon.stub().returns(pickUpAndDeliveryTask),
          isFailure: false,
        };

        // Mock the taskFactory return value
        taskFactoryMock.createPickUpAndDeliveryTask.resolves(pickUpAndDeliveryTaskOrErrorMock);

        // User gateway returns result with email
        const emailOrError = {
          getValue: sinon.stub().returns('email@isep.ipp.pt'),
          isFailure: false,
        };

        // Mock the userGateway return value
        userGatewayMock.getEmailByIamId.resolves(emailOrError);

        // Mock the pickUpAndDeliveryTaskRepo return value
        pickUpAndDeliveryTaskRepoMock.save.resolves(null);

        // Act
        const result = await taskService.requestTask(taskDto);

        // Assert
        expect(result.isFailure).to.be.true;
        expect(result.error).to.equal('Task with domainId already exists.');
      });
    });
  });

  describe('listAllTasks', () => {
    // service
    let taskService: TaskService;

    // Mocks
    let loggerMock: any;
    let taskFactoryMock: any;
    let surveillanceTaskRepoMock: any;
    let pickUpAndDeliveryTaskRepoMock: any;
    let robisepRepoMock: any;
    let userGatewayMock: any;
    let taskGatewayMock: any;

    let surveillanceTaskBuildingA: SurveillanceTask;
    let surveillanceTaskBuildingB: SurveillanceTask;

    let pickUpAndDeliveryTaskRoomAToRoomProlog1: PickUpAndDeliveryTask;
    let pickUpAndDeliveryTaskRoomBToRoomProlog1: PickUpAndDeliveryTask;

    beforeEach(() => {
      loggerMock = {
        error: sinon.stub(),
      };

      taskFactoryMock = {};

      surveillanceTaskRepoMock = {
        findAll: sinon.stub(),
      };

      pickUpAndDeliveryTaskRepoMock = {
        findAll: sinon.stub(),
      };

      robisepRepoMock = {
        findByDomainId: sinon.stub(),
      };

      userGatewayMock = {
        getEmailByIamId: sinon.stub(),
      };

      taskGatewayMock = {
        getTaskSequeceByRobisepId: sinon.stub(),
      };

      surveillanceTaskBuildingA = SurveillanceTaskDataSource.getBuildingASurveillanceTask();
      surveillanceTaskBuildingB = SurveillanceTaskDataSource.getBuildingBSurveillanceTask();

      pickUpAndDeliveryTaskRoomAToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTask();
      pickUpAndDeliveryTaskRoomBToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTask();

      taskService = new TaskService(
        taskFactoryMock,
        surveillanceTaskRepoMock,
        pickUpAndDeliveryTaskRepoMock,
        robisepRepoMock,
        userGatewayMock,
        taskGatewayMock,
        loggerMock,
      );
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should list all tasks successfully, both surveillance & pickup and delivery', async () => {
      // Arrange
      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findAll.resolves([surveillanceTaskBuildingA, surveillanceTaskBuildingB]);

      // Mock the pickUpAndDeliveryTaskRepo return value
      pickUpAndDeliveryTaskRepoMock.findAll.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);

      // Act
      const result = await taskService.listAllTasks();

      // Assert
      expect(result).to.have.lengthOf(4);
      for (const task of result) {
        expect(task.domainId).to.be.oneOf([
          surveillanceTaskBuildingA.id.toString(),
          surveillanceTaskBuildingB.id.toString(),
          pickUpAndDeliveryTaskRoomAToRoomProlog1.id.toString(),
          pickUpAndDeliveryTaskRoomBToRoomProlog1.id.toString(),
        ]);
      }
    });

    it('should list all tasks successfully, only surveillance', async () => {
      // Arrange
      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findAll.resolves([surveillanceTaskBuildingA, surveillanceTaskBuildingB]);

      // Mock the pickUpAndDeliveryTaskRepo return value
      pickUpAndDeliveryTaskRepoMock.findAll.resolves([]);

      // Act
      const result = await taskService.listAllTasks();

      // Assert
      expect(result).to.have.lengthOf(2);
      for (const task of result) {
        expect(task.domainId).to.be.oneOf([
          surveillanceTaskBuildingA.id.toString(),
          surveillanceTaskBuildingB.id.toString(),
        ]);
      }
    });

    it('should list all tasks successfully, only pickup and delivery', async () => {
      // Arrange
      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findAll.resolves([]);

      // Mock the pickUpAndDeliveryTaskRepo return value
      pickUpAndDeliveryTaskRepoMock.findAll.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);

      // Act
      const result = await taskService.listAllTasks();

      // Assert
      expect(result).to.have.lengthOf(2);
      for (const task of result) {
        expect(task.domainId).to.be.oneOf([
          pickUpAndDeliveryTaskRoomAToRoomProlog1.id.toString(),
          pickUpAndDeliveryTaskRoomBToRoomProlog1.id.toString(),
        ]);
      }
    });

    it('should list all tasks successfully, when there is nor surveillance neither pickup and delivery', async () => {
      // Arrange
      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findAll.resolves([]);

      // Mock the pickUpAndDeliveryTaskRepo return value
      pickUpAndDeliveryTaskRepoMock.findAll.resolves([]);

      // Act
      const result = await taskService.listAllTasks();

      // Assert
      expect(result).to.have.lengthOf(0);
    });
  });

  describe('listTasksByState', () => {
    // service
    let taskService: TaskService;

    // Mocks
    let loggerMock: any;
    let taskFactoryMock: any;
    let surveillanceTaskRepoMock: any;
    let pickUpAndDeliveryTaskRepoMock: any;
    let robisepRepoMock: any;
    let userGatewayMock: any;
    let taskGatewayMock: any;

    let surveillanceTaskBuildingA: SurveillanceTask;
    let surveillanceTaskBuildingB: SurveillanceTask;

    let pickUpAndDeliveryTaskRoomAToRoomProlog1: PickUpAndDeliveryTask;
    let pickUpAndDeliveryTaskRoomBToRoomProlog1: PickUpAndDeliveryTask;

    beforeEach(() => {
      loggerMock = {
        error: sinon.stub(),
      };

      taskFactoryMock = {};

      surveillanceTaskRepoMock = {
        findByState: sinon.stub(),
      };

      pickUpAndDeliveryTaskRepoMock = {
        findByState: sinon.stub(),
      };

      robisepRepoMock = {
        findByDomainId: sinon.stub(),
      };

      userGatewayMock = {
        getEmailByIamId: sinon.stub(),
      };

      taskGatewayMock = {
        getTaskSequeceByRobisepId: sinon.stub(),
      };

      surveillanceTaskBuildingA = SurveillanceTaskDataSource.getBuildingASurveillanceTask();
      surveillanceTaskBuildingB = SurveillanceTaskDataSource.getBuildingBSurveillanceTask();

      pickUpAndDeliveryTaskRoomAToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTask();
      pickUpAndDeliveryTaskRoomBToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTask();

      taskService = new TaskService(
        taskFactoryMock,
        surveillanceTaskRepoMock,
        pickUpAndDeliveryTaskRepoMock,
        robisepRepoMock,
        userGatewayMock,
        taskGatewayMock,
        loggerMock,
      );
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should list all tasks successfully, both surveillance & pickup and delivery', async () => {
      // Arrange
      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findByState.resolves([surveillanceTaskBuildingA, surveillanceTaskBuildingB]);

      // Mock the pickUpAndDeliveryTaskRepo return value
      pickUpAndDeliveryTaskRepoMock.findByState.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);

      // Act
      const result = await taskService.listTasksByState([TaskState.REQUESTED]);

      // Assert
      expect(result.getValue()).to.have.lengthOf(4);
      for (const task of result.getValue()) {
        expect(task.domainId).to.be.oneOf([
          surveillanceTaskBuildingA.id.toString(),
          surveillanceTaskBuildingB.id.toString(),
          pickUpAndDeliveryTaskRoomAToRoomProlog1.id.toString(),
          pickUpAndDeliveryTaskRoomBToRoomProlog1.id.toString(),
        ]);
      }
    });

    it('should list all tasks successfully, only surveillance', async () => {
      // Arrange
      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findByState.resolves([surveillanceTaskBuildingA, surveillanceTaskBuildingB]);

      // Mock the pickUpAndDeliveryTaskRepo return value
      pickUpAndDeliveryTaskRepoMock.findByState.resolves([]);

      // Act
      const result = await taskService.listTasksByState([TaskState.REQUESTED]);

      // Assert
      expect(result.getValue()).to.have.lengthOf(2);
      for (const task of result.getValue()) {
        expect(task.domainId).to.be.oneOf([
          surveillanceTaskBuildingA.id.toString(),
          surveillanceTaskBuildingB.id.toString(),
        ]);
      }
    });

    it('should list all tasks successfully, only pickup and delivery', async () => {
      // Arrange
      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findByState.resolves([]);

      // Mock the pickUpAndDeliveryTaskRepo return value
      pickUpAndDeliveryTaskRepoMock.findByState.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);

      // Act
      const result = await taskService.listTasksByState([TaskState.REQUESTED]);

      // Assert
      expect(result.getValue()).to.have.lengthOf(2);
      for (const task of result.getValue()) {
        expect(task.domainId).to.be.oneOf([
          pickUpAndDeliveryTaskRoomAToRoomProlog1.id.toString(),
          pickUpAndDeliveryTaskRoomBToRoomProlog1.id.toString(),
        ]);
      }
    });

    it('should list all tasks successfully, when there is nor surveillance neither pickup and delivery', async () => {
      // Arrange
      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findByState.resolves([]);

      // Mock the pickUpAndDeliveryTaskRepo return value
      pickUpAndDeliveryTaskRepoMock.findByState.resolves([]);

      // Act
      const result = await taskService.listTasksByState([TaskState.REQUESTED]);

      // Assert
      expect(result.getValue()).to.have.lengthOf(0);
    });

    it('should list all tasks successfully, passing various task States', async () => {
      // Arrange
      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findByState.resolves([surveillanceTaskBuildingA, surveillanceTaskBuildingB]);

      // Mock the pickUpAndDeliveryTaskRepo return value
      pickUpAndDeliveryTaskRepoMock.findByState.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);

      // Act
      const result = await taskService.listTasksByState([TaskState.REQUESTED, TaskState.ACCEPTED, TaskState.REFUSED]);

      // Assert
      expect(result.getValue()).to.have.lengthOf(4);
      for (const task of result.getValue()) {
        expect(task.domainId).to.be.oneOf([
          surveillanceTaskBuildingA.id.toString(),
          surveillanceTaskBuildingB.id.toString(),
          pickUpAndDeliveryTaskRoomAToRoomProlog1.id.toString(),
          pickUpAndDeliveryTaskRoomBToRoomProlog1.id.toString(),
        ]);
      }
    });

    it('should fail, when passing an empty array', async () => {
      // Arrange
      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findByState.resolves([surveillanceTaskBuildingA, surveillanceTaskBuildingB]);

      // Mock the pickUpAndDeliveryTaskRepo return value
      pickUpAndDeliveryTaskRepoMock.findByState.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);

      // Act
      const result = await taskService.listTasksByState([]);

      // Assert
      expect(result.isFailure).to.be.true;
    });

    it('should fail, when passing invalid task States', async () => {
      // Arrange
      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findByState.resolves([surveillanceTaskBuildingA, surveillanceTaskBuildingB]);

      // Mock the pickUpAndDeliveryTaskRepo return value
      pickUpAndDeliveryTaskRepoMock.findByState.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);

      // Act
      const result = await taskService.listTasksByState(['INVALID', TaskState.ACCEPTED, TaskState.REFUSED]);

      // Assert
      expect(result.isFailure).to.be.true;
    });

    it('should fail, when DB call fails', async () => {
      // Arrange
      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findByState.throws(new Error('DB error'));

      // Act
      const result = await taskService.listTasksByState([TaskState.ACCEPTED, TaskState.REFUSED]);

      // Assert
      expect(result.isFailure).to.be.true;
    });
  });

  describe('listTasksByIamId', () => {
    // service
    let taskService: TaskService;

    // Mocks
    let loggerMock: any;
    let taskFactoryMock: any;
    let surveillanceTaskRepoMock: any;
    let pickUpAndDeliveryTaskRepoMock: any;
    let robisepRepoMock: any;
    let userGatewayMock: any;
    let taskGatewayMock: any;

    let surveillanceTaskBuildingA: SurveillanceTask;
    let surveillanceTaskBuildingB: SurveillanceTask;

    let pickUpAndDeliveryTaskRoomAToRoomProlog1: PickUpAndDeliveryTask;
    let pickUpAndDeliveryTaskRoomBToRoomProlog1: PickUpAndDeliveryTask;

    beforeEach(() => {
      loggerMock = {
        error: sinon.stub(),
      };

      taskFactoryMock = {};

      surveillanceTaskRepoMock = {
        findByUser: sinon.stub(),
      };

      pickUpAndDeliveryTaskRepoMock = {
        findByUser: sinon.stub(),
      };

      robisepRepoMock = {
        findByDomainId: sinon.stub(),
      };

      userGatewayMock = {
        getEmailByIamId: sinon.stub(),
      };

      taskGatewayMock = {
        getTaskSequeceByRobisepId: sinon.stub(),
      };

      surveillanceTaskBuildingA = SurveillanceTaskDataSource.getBuildingASurveillanceTask();
      surveillanceTaskBuildingB = SurveillanceTaskDataSource.getBuildingBSurveillanceTask();

      pickUpAndDeliveryTaskRoomAToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTask();
      pickUpAndDeliveryTaskRoomBToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTask();

      taskService = new TaskService(
        taskFactoryMock,
        surveillanceTaskRepoMock,
        pickUpAndDeliveryTaskRepoMock,
        robisepRepoMock,
        userGatewayMock,
        taskGatewayMock,
        loggerMock,
      );
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should list all tasks successfully, both surveillance & pickup and delivery', async () => {
      // Arrange
      // User gateway returns result with email
      const emailOrError = {
        getValue: sinon.stub().returns('email@isep.ipp.pt'),
        isFailure: false,
      };

      // Mock the userGateway return value
      userGatewayMock.getEmailByIamId.resolves(emailOrError);

      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findByUser.resolves([surveillanceTaskBuildingA, surveillanceTaskBuildingB]);

      // Mock the pickUpAndDeliveryTaskRepo return value
      pickUpAndDeliveryTaskRepoMock.findByUser.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);

      // Act
      const result = await taskService.listTasksByUser('iamId');

      // Assert
      expect(result.getValue()).to.have.lengthOf(4);
      for (const task of result.getValue()) {
        expect(task.domainId).to.be.oneOf([
          surveillanceTaskBuildingA.id.toString(),
          surveillanceTaskBuildingB.id.toString(),
          pickUpAndDeliveryTaskRoomAToRoomProlog1.id.toString(),
          pickUpAndDeliveryTaskRoomBToRoomProlog1.id.toString(),
        ]);
      }
    });

    it('should fail to list all tasks, when userGateway fails', async () => {
      // Arrange
      // User gateway returns result with email
      const emailOrError = {
        getValue: sinon.stub().returns('email@isep.ipp.pt'),
        isFailure: true,
        error: 'User not found',
      };

      // Mock the userGateway return value
      userGatewayMock.getEmailByIamId.resolves(emailOrError);

      // Act
      const result = await taskService.listTasksByUser('iamId');

      // Assert
      expect(result.isFailure).to.be.true;
      expect(result.error).to.equal('User not found');
    });

    it('should fail, when DB call fails', async () => {
      // Arrange
      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findByUser.throws(new Error('DB error'));

      // Act
      const result = await taskService.listTasksByUser('iamId');

      // Assert
      expect(result.isFailure).to.be.true;
    });
  });

  describe('listTasksByIamIdStateAndUser', () => {
    // service
    let taskService: TaskService;

    // Mocks
    let loggerMock: any;
    let taskFactoryMock: any;
    let surveillanceTaskRepoMock: any;
    let pickUpAndDeliveryTaskRepoMock: any;
    let robisepRepoMock: any;
    let userGatewayMock: any;
    let taskGatewayMock: any;

    let surveillanceTaskBuildingA: SurveillanceTask;
    let surveillanceTaskBuildingB: SurveillanceTask;

    let pickUpAndDeliveryTaskRoomAToRoomProlog1: PickUpAndDeliveryTask;
    let pickUpAndDeliveryTaskRoomBToRoomProlog1: PickUpAndDeliveryTask;

    beforeEach(() => {
      loggerMock = {
        error: sinon.stub(),
      };

      taskFactoryMock = {};

      surveillanceTaskRepoMock = {
        findByStateTypeAndEmail: sinon.stub(),
      };

      pickUpAndDeliveryTaskRepoMock = {
        findByStateTypeAndEmail: sinon.stub(),
      };

      robisepRepoMock = {
        findByDomainId: sinon.stub(),
      };

      userGatewayMock = {
        getEmailByIamId: sinon.stub(),
      };

      taskGatewayMock = {
        getTaskSequeceByRobisepId: sinon.stub(),
      };

      surveillanceTaskBuildingA = SurveillanceTaskDataSource.getBuildingASurveillanceTask();
      surveillanceTaskBuildingB = SurveillanceTaskDataSource.getBuildingBSurveillanceTask();

      pickUpAndDeliveryTaskRoomAToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTask();
      pickUpAndDeliveryTaskRoomBToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTask();

      taskService = new TaskService(
        taskFactoryMock,
        surveillanceTaskRepoMock,
        pickUpAndDeliveryTaskRepoMock,
        robisepRepoMock,
        userGatewayMock,
        taskGatewayMock,
        loggerMock,
      );
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should list all tasks successfully, both surveillance & pickup and delivery', async () => {
      // Arrange
      // User gateway returns result with email
      const emailOrError = {
        getValue: sinon.stub().returns('email@isep.ipp.pt'),
        isFailure: false,
      };

      // Mock the userGateway return value
      userGatewayMock.getEmailByIamId.resolves(emailOrError);

      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findByStateTypeAndEmail.resolves([surveillanceTaskBuildingA, surveillanceTaskBuildingB]);

      // Mock the pickUpAndDeliveryTaskRepo return value
      pickUpAndDeliveryTaskRepoMock.findByStateTypeAndEmail.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);

      // Act
      const result = await taskService.listTasksByMultipleParameters(
        [TaskState.REQUESTED],
        RobisepTypeDataSource.getRobisepTypeA().id.toString(),
        'iamId',
      );

      // Assert
      expect(result.getValue()).to.have.lengthOf(4);
      for (const task of result.getValue()) {
        expect(task.domainId).to.be.oneOf([
          surveillanceTaskBuildingA.id.toString(),
          surveillanceTaskBuildingB.id.toString(),
          pickUpAndDeliveryTaskRoomAToRoomProlog1.id.toString(),
          pickUpAndDeliveryTaskRoomBToRoomProlog1.id.toString(),
        ]);
      }
    });

    it('should list all tasks successfully, both surveillance & pickup and delivery without any parameter', async () => {
      // Arrange
      // User gateway returns result with email
      const emailOrError = {
        getValue: sinon.stub().returns('email@isep.ipp.pt'),
        isFailure: false,
      };

      // Mock the userGateway return value
      userGatewayMock.getEmailByIamId.resolves(emailOrError);

      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findByStateTypeAndEmail.resolves([surveillanceTaskBuildingA, surveillanceTaskBuildingB]);

      // Mock the pickUpAndDeliveryTaskRepo return value
      pickUpAndDeliveryTaskRepoMock.findByStateTypeAndEmail.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);

      // Act
      const result = await taskService.listTasksByMultipleParameters(null, null, null);

      // Assert
      expect(result.getValue()).to.have.lengthOf(4);
      for (const task of result.getValue()) {
        expect(task.domainId).to.be.oneOf([
          surveillanceTaskBuildingA.id.toString(),
          surveillanceTaskBuildingB.id.toString(),
          pickUpAndDeliveryTaskRoomAToRoomProlog1.id.toString(),
          pickUpAndDeliveryTaskRoomBToRoomProlog1.id.toString(),
        ]);
      }
    });

    it('should fail to list all tasks, when userGateway fails', async () => {
      // Arrange
      // User gateway returns result with email
      const emailOrError = {
        getValue: sinon.stub().returns('email@isep.ipp.pt'),
        isFailure: true,
        error: 'User not found',
      };

      // Mock the userGateway return value
      userGatewayMock.getEmailByIamId.resolves(emailOrError);

      // Act
      const result = await taskService.listTasksByMultipleParameters(
        [TaskState.REQUESTED],
        RobisepTypeDataSource.getRobisepTypeA().id.toString(),
        'iamId',
      );

      // Assert
      expect(result.isFailure).to.be.true;
      expect(result.error).to.equal('User not found');
    });

    it('should fail, when DB call fails', async () => {
      // Arrange
      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findByStateTypeAndEmail.throws(new Error('DB error'));

      // Act
      const result = await taskService.listTasksByMultipleParameters(
        [TaskState.REQUESTED],
        RobisepTypeDataSource.getRobisepTypeA().id.toString(),
        'iamId',
      );

      // Assert
      expect(result.isFailure).to.be.true;
    });

    it('should fail, when State does not exist', async () => {
      // Arrange
      // User gateway returns result with email
      const emailOrError = {
        getValue: sinon.stub().returns('email@isep.ipp.pt'),
        isFailure: false,
      };

      // Mock the userGateway return value
      userGatewayMock.getEmailByIamId.resolves(emailOrError);

      // Mock the surveillanceTaskRepo return value
      surveillanceTaskRepoMock.findByStateTypeAndEmail.resolves([surveillanceTaskBuildingA, surveillanceTaskBuildingB]);

      // Mock the pickUpAndDeliveryTaskRepo return value
      pickUpAndDeliveryTaskRepoMock.findByStateTypeAndEmail.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);

      // Act
      const result = await taskService.listTasksByMultipleParameters(
        ['ok'],
        RobisepTypeDataSource.getRobisepTypeA().id.toString(),
        'iamId',
      );

      // Assert
      expect(result.isFailure).to.be.true;
    });
  });

  describe('getTaskSequence', () => {
    // service
    let taskService: TaskService;

    // Mocks
    let loggerMock: any;
    let taskFactoryMock: any;
    let surveillanceTaskRepoMock: any;
    let pickUpAndDeliveryTaskRepoMock: any;
    let robisepRepoMock: any;
    let userGatewayMock: any;
    let taskGatewayMock: any;

    let surveillanceTaskBuildingA: SurveillanceTask;
    let surveillanceTaskBuildingB: SurveillanceTask;

    let pickUpAndDeliveryTaskRoomAToRoomProlog1: PickUpAndDeliveryTask;
    let pickUpAndDeliveryTaskRoomBToRoomProlog1: PickUpAndDeliveryTask;

    beforeEach(() => {
      taskFactoryMock = {};

      surveillanceTaskRepoMock = {
        findByState: sinon.stub(),
        findByCode: sinon.stub(),
        update: sinon.stub(),
      };

      pickUpAndDeliveryTaskRepoMock = {
        findByState: sinon.stub(),
        findByCode: sinon.stub(),
        update: sinon.stub(),
      };

      robisepRepoMock = {
        findByDomainId: sinon.stub(),
      };

      userGatewayMock = {};

      taskGatewayMock = {
        getTaskSequeceByRobisepId: sinon.stub(),
      };

      loggerMock = {
        error: sinon.stub(),
      };

      surveillanceTaskBuildingA = SurveillanceTaskDataSource.getBuildingASurveillanceAcceptedTask();
      surveillanceTaskBuildingB = SurveillanceTaskDataSource.getBuildingBSurveillanceAcceptedTask();

      pickUpAndDeliveryTaskRoomAToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryAcceptedTask();
      pickUpAndDeliveryTaskRoomBToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryAcceptedTask();

      taskService = new TaskService(
        taskFactoryMock,
        surveillanceTaskRepoMock,
        pickUpAndDeliveryTaskRepoMock,
        robisepRepoMock,
        userGatewayMock,
        taskGatewayMock,
        loggerMock,
      );
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return a valid task sequence', async () => {
      // Arrange
      const robisep = RobisepDataSource.getRobisepB();
      const taskGatewayResult = Result.ok<ITaskSequenceDTO>({
        Sequence: ['1', '2', '1', '2'],
        cost: 0,
      });

      // Mocks
      surveillanceTaskRepoMock.findByState.resolves([surveillanceTaskBuildingA, surveillanceTaskBuildingB]);
      pickUpAndDeliveryTaskRepoMock.findByState.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);
      taskGatewayMock.getTaskSequeceByRobisepId.resolves(taskGatewayResult);
      robisepRepoMock.findByDomainId.resolves(robisep);

      // Find By Code
      pickUpAndDeliveryTaskRepoMock.findByCode.onCall(1).returns(pickUpAndDeliveryTaskRoomAToRoomProlog1);
      pickUpAndDeliveryTaskRepoMock.findByCode.onCall(2).returns(pickUpAndDeliveryTaskRoomBToRoomProlog1);
      pickUpAndDeliveryTaskRepoMock.findByCode.onCall(3).returns(null);
      pickUpAndDeliveryTaskRepoMock.findByCode.onCall(4).returns(null);
      surveillanceTaskRepoMock.findByCode.onCall(1).returns(surveillanceTaskBuildingA);
      surveillanceTaskRepoMock.findByCode.onCall(2).returns(surveillanceTaskBuildingB);

      // Update
      surveillanceTaskRepoMock.update.onCall(1).returns(surveillanceTaskBuildingA);
      surveillanceTaskRepoMock.update.onCall(2).returns(surveillanceTaskBuildingB);
      pickUpAndDeliveryTaskRepoMock.update.onCall(1).returns(pickUpAndDeliveryTaskRoomAToRoomProlog1);
      pickUpAndDeliveryTaskRepoMock.update.onCall(2).returns(pickUpAndDeliveryTaskRoomBToRoomProlog1);

      // Act
      const actualResult = await taskService.getTaskSequence(robisep.id.toString());
      const expectedResult = Result.ok<ITaskSequenceOutDTO[]>([
        {
          robisepNickname: RobisepDataSource.getRobisepA().nickname.value,
          Sequence: [
            {
              taskCode: 1,
              taskType: TaskType.TRANSPORT,
              taskState: TaskState.PLANNED,
              robisepType: RobisepTypeDataSource.getRobisepTypeA().designation.value,
              goal: 'start: Room A - End: Room Prolog 1',
            },
          ],
          cost: 0,
        },
        {
          robisepNickname: RobisepDataSource.getRobisepB().nickname.value,
          Sequence: [
            {
              taskCode: 2,
              taskType: TaskType.TRANSPORT,
              taskState: TaskState.PLANNED,
              robisepType: RobisepTypeDataSource.getRobisepTypeA().designation.value,
              goal: 'start: Room B - End: Room Prolog 1',
            },
            {
              taskCode: 1,
              taskType: TaskType.SURVEILLANCE,
              taskState: TaskState.PLANNED,
              robisepType: RobisepTypeDataSource.getRobisepTypeB().designation.value,
              goal: 'start: Room T1 - End: Room T2',
            },
          ],
          cost: 0,
        },
      ]);

      // Assert
      expect(actualResult.isSuccess).to.be.true;
      expect(actualResult.getValue()).to.be.deep.equal(expectedResult.getValue());
    });

    it('should fail when no robisepId are found', async () => {
      // Arrange
      const robisep = RobisepDataSource.getRobisepB();

      // Mocks
      surveillanceTaskRepoMock.findByState.resolves([]);
      pickUpAndDeliveryTaskRepoMock.findByState.resolves([]);

      // Act
      const result = await taskService.getTaskSequence(robisep.id.toString());

      // Assert
      expect(result.isFailure).to.be.true;
    });

    it('should fail when a DB error occours when searching for robisepIds', async () => {
      // Arrange
      const robisep = RobisepDataSource.getRobisepB();

      // Mocks
      surveillanceTaskRepoMock.findByState.throws(new Error('No robisepId found'));

      // Act
      const result = await taskService.getTaskSequence(robisep.id.toString());

      // Assert
      expect(result.isFailure).to.be.true;
    });

    it('should fail when task sequence fails', async () => {
      // Arrange
      const robisep = RobisepDataSource.getRobisepB();

      // Mocks
      surveillanceTaskRepoMock.findByState.resolves([surveillanceTaskBuildingA, surveillanceTaskBuildingB]);
      pickUpAndDeliveryTaskRepoMock.findByState.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);
      taskGatewayMock.getTaskSequeceByRobisepId.throws(new Error('error'));

      // Act
      const result = await taskService.getTaskSequence(robisep.id.toString());

      // Assert
      expect(result.isFailure).to.be.true;
    });

    it('should not fail when task sequence cannot be calculated for a given robisep', async () => {
      // Arrange
      const robisep = RobisepDataSource.getRobisepB();

      // Mocks
      surveillanceTaskRepoMock.findByState.resolves([surveillanceTaskBuildingA]);
      pickUpAndDeliveryTaskRepoMock.findByState.resolves([]);
      taskGatewayMock.getTaskSequeceByRobisepId.returns(Result.fail<ITaskSequenceDTO>('error'));
      robisepRepoMock.findByDomainId.resolves(robisep);

      // Act
      const result = await taskService.getTaskSequence(robisep.id.toString());

      // Assert
      expect(result.isSuccess).to.be.true;
    });
  });

  describe('changeTaskState', () => {
    describe('successful change', () => {
      // service
      let taskService: TaskService;

      // Mocks
      let loggerMock: any;
      let taskFactoryMock: any;
      let surveillanceTaskRepoMock: any;
      let pickUpAndDeliveryTaskRepoMock: any;
      let robisepRepoMock: any;
      let userGatewayMock: any;
      let taskGatewayMock: any;

      beforeEach(() => {
        loggerMock = {
          error: sinon.stub(),
        };

        taskFactoryMock = {
          createSurveillanceTask: sinon.stub(),
        };

        surveillanceTaskRepoMock = {
          save: sinon.stub(),
          update: sinon.stub(),
          findByCode: sinon.stub(),
        };

        robisepRepoMock = {
          findByCode: sinon.stub(),
        };

        pickUpAndDeliveryTaskRepoMock = {};

        userGatewayMock = {
          getEmailByIamId: sinon.stub(),
        };
        taskGatewayMock = {
          getTaskSequeceByRobisepId: sinon.stub(),
        };

        taskService = new TaskService(
          taskFactoryMock,
          surveillanceTaskRepoMock,
          pickUpAndDeliveryTaskRepoMock,
          robisepRepoMock,
          userGatewayMock,
          taskGatewayMock,
          loggerMock,
        );
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('to accepted', async () => {
        // Arrange
        const task = SurveillanceTaskDataSource.getBuildingASurveillanceTask();
        const robIsep = RobisepDataSource.getRobisepB();
        const updateTaskDto = {
          robisepCode: robIsep.code.value.toString(),
          newTaskState: 'ACCEPTED',
          taskType: 'SURVEILLANCE',
        };
        surveillanceTaskRepoMock.update.resolves(task);
        surveillanceTaskRepoMock.findByCode.resolves(task);
        robisepRepoMock.findByCode.resolves(robIsep);

        // Act
        const result = await taskService.updateTaskState(task.taskCode.value.toString(), updateTaskDto);

        // Assert
        expect(result.isSuccess).to.be.true;
      });
    });
  });
});
