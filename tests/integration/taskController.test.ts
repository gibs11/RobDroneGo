import 'reflect-metadata';
import * as sinon from 'sinon';
import {Container} from 'typedi';
import config from '../../config';
import {Request, Response} from 'express';
import {FailureType, Result} from '../../src/core/logic/Result';
import {RobisepType} from "../../src/domain/robisepType/RobisepType";
import {Building} from "../../src/domain/building/building";
import ITaskOutDTO, {IPickUpAndDeliveryTaskOutDTO, ISurveillanceTaskOutDTO} from "../../src/dto/out/ITaskOutDTO";
import {TaskState} from "../../src/domain/task/taskState";
import {RobisepTypeMap} from "../../src/mappers/RobisepTypeMap";
import TaskController from "../../src/controllers/taskController";
import ITaskService from "../../src/services/IServices/ITaskService";
import RobisepTypeDataSource from "../datasource/robisepTypeDataSource";
import BuildingDataSource from "../datasource/buildingDataSource";
import {UniqueEntityID} from "../../src/core/domain/UniqueEntityID";
import {SurveillanceTask} from "../../src/domain/task/surveillanceTask/surveillanceTask";
import {PhoneNumber} from "../../src/domain/common/phoneNumber";
import {Room} from "../../src/domain/room/Room";
import RoomDataSource from "../datasource/RoomDataSource";
import {RoomMap} from "../../src/mappers/RoomMap";
import {PickUpAndDeliveryTask} from "../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTask";
import {PersonalName} from "../../src/domain/common/personalName";
import {
  PickUpAndDeliveryTaskPersonContact
} from "../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskPersonContact";
import {
  PickUpAndDeliveryTaskDescription
} from "../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskDescription";
import {
  PickUpAndDeliveryTaskConfirmationCode
} from "../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskConfirmationCode";
import SurveillanceTaskDataSource from "../datasource/task/surveillanceTaskDataSource";
import PickUpAndDeliveryTaskDataSource from "../datasource/task/pickUpAndDeliveryTaskDataSource";
import {TaskCode} from "../../src/domain/task/taskCode";
import RobisepDataSource from "../datasource/RobisepDataSource";
import ITaskSequenceDTO from "../../src/dto/out/ITaskSequenceDTO";

describe('TaskController', () => {
  const sandbox = sinon.createSandbox();

  let loggerMock: any;
  let taskFactoryMock: any;
  let surveillanceTaskRepoMock: any;
  let pickUpAndDeliveryTaskRepoMock: any;
  let robisepRepoMock: any;
  let userGatewayMock: any;
  let taskGatewayMock: any;

  describe('requestTask -> surveillanceTask', () => {
    // RobisepType
    let robisepType: RobisepType;

    // Building to watch
    let buildingToWatch: Building;

    // Rooms to watch
    let startingPointToWatch: Room;
    let endingPointToWatch: Room;

    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };

      Container.set('logger', loggerMock);

      taskFactoryMock = {
        createSurveillanceTask: sinon.stub(),
      };

      Container.set(config.factories.task.name, taskFactoryMock);

      surveillanceTaskRepoMock = {
        save: sinon.stub(),
      };

      Container.set(config.repos.surveillanceTask.name, surveillanceTaskRepoMock);

      pickUpAndDeliveryTaskRepoMock = {};

      Container.set(config.repos.pickUpAndDeliveryTask.name, pickUpAndDeliveryTaskRepoMock);

      robisepRepoMock = {
        findByDomainId: sinon.stub(),
      }

      Container.set(config.repos.robisep.name, robisepRepoMock);

      userGatewayMock = {
        getEmailByIamId: sinon.stub(),
      }

      Container.set(config.gateways.user.name, userGatewayMock);

      taskGatewayMock = {
        getTaskSequeceByRobisepId: sinon.stub(),
      }

      Container.set(config.gateways.task.name, taskGatewayMock);

      // Create the RobisepType
      robisepType = RobisepTypeDataSource.getRobisepTypeB();

      // Create the building
      buildingToWatch = BuildingDataSource.getBuildingA();

      // Create the rooms
      startingPointToWatch = RoomDataSource.getFirstRoomT();
      endingPointToWatch = RoomDataSource.getSecondRoomT();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const taskServiceClass = require('../../src/services/ServicesImpl/taskService').default;
      const taskServiceInstance = Container.get(taskServiceClass);
      Container.set(config.services.task.name, taskServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('TaskController unit test using TaskService stub results in valid surveillance task creation', async () => {
      // Arrange
      const requestBody = {
        domainId: '123',
        robisepType: robisepType.id.toString(),
        iamId: '123456789',
        surveillanceTask: {
          buildingToWatch: buildingToWatch.id.toString(),
          emergencyContact: '912345678',
          startingPointToWatch: startingPointToWatch.id.toString(),
          endingPointToWatch: endingPointToWatch.id.toString(),
        }
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const taskServiceInstance = Container.get(config.services.task.name);

      // Stub
      sinon.stub(taskServiceInstance, 'requestTask').returns(
        Result.ok<ITaskOutDTO>({
          state: TaskState.REQUESTED,
          taskCode: 1,
          email: 'email@isep.ipp.pt',
          domainId: '123',
          robisepType: RobisepTypeMap.toDTO(robisepType),
          surveillanceTask: {
            emergencyPhoneNumber: '912345678',
            startingPointToWatch: RoomMap.toDTO(startingPointToWatch),
            endingPointToWatch: RoomMap.toDTO(endingPointToWatch),
          }
        }),
      );

      const controller = new TaskController(taskServiceInstance as ITaskService);

      // Act
      await controller.requestTask(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match({
          state: TaskState.REQUESTED,
          domainId: '123',
          robisepType: RobisepTypeMap.toDTO(robisepType),
          email: 'email@isep.ipp.pt',
          surveillanceTask: {
            emergencyPhoneNumber: '912345678',
            startingPointToWatch: RoomMap.toDTO(startingPointToWatch),
            endingPointToWatch: RoomMap.toDTO(endingPointToWatch),
          }
        }),
      );
    });

    it('TaskController + TaskService integration test valid surveillance task created with domainId', async () => {
      // Arrange
      const requestBody = {
        domainId: '123',
        robisepType: robisepType.id.toString(),
        iamId: '123456789',
        surveillanceTask: {
          buildingToWatch: buildingToWatch.id.toString(),
          emergencyContact: '912345678',
          startingPointToWatch: startingPointToWatch.id.toString(),
          endingPointToWatch: endingPointToWatch.id.toString(),
        }
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const surveillanceTaskInstance = SurveillanceTask.create(
        {
          taskState: TaskState.REQUESTED,
          taskCode: TaskCode.create(1).getValue(),
          email: 'email@isep.ipp.pt',
          robisepType: robisepType,
          emergencyPhoneNumber: PhoneNumber.create('912345678').getValue(),
          startingPointToWatch: startingPointToWatch,
          endingPointToWatch: endingPointToWatch,
        },
        new UniqueEntityID(requestBody.domainId),
      ).getValue();

      const surveillanceTaskOrErrorMock = {
        getValue: sinon.stub().returns(surveillanceTaskInstance),
        isFailure: false,
      };

      // User gateway returns result with email
      const emailOrError = {
        getValue: sinon.stub().returns("email@isep.ipp.pt"),
        isFailure: false,
      };

      // Stub the userGateway getEmailByIamId method
      userGatewayMock.getEmailByIamId.resolves(emailOrError);

      // Stub the taskFactory createSurveillanceTask method
      taskFactoryMock.createSurveillanceTask.resolves(surveillanceTaskOrErrorMock);

      // Stub the surveillanceTaskRepo save method
      surveillanceTaskRepoMock.save.resolves(surveillanceTaskInstance);

      const taskService = Container.get(config.services.task.name);

      const taskServiceSpy = sinon.spy(taskService, 'requestTask');

      const controller = new TaskController(taskService as ITaskService);

      // Act
      await controller.requestTask(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match({
          state: TaskState.REQUESTED,
          domainId: '123',
          robisepType: RobisepTypeMap.toDTO(robisepType),
          email: 'email@isep.ipp.pt',
          surveillanceTask: {
            emergencyPhoneNumber: '912345678',
            startingPointToWatch: RoomMap.toDTO(startingPointToWatch),
            endingPointToWatch: RoomMap.toDTO(endingPointToWatch),
          }
        }),
      );

      sinon.assert.calledOnce(taskServiceSpy);
      sinon.assert.calledWith(
        taskServiceSpy,
        sinon.match({
          domainId: '123',
          robisepType: robisepType.id.toString(),
          iamId: '123456789',
          surveillanceTask: {
            buildingToWatch: buildingToWatch.id.toString(),
            emergencyContact: '912345678',
            startingPointToWatch: startingPointToWatch.id.toString(),
            endingPointToWatch: endingPointToWatch.id.toString(),
          }
        }),
      );
    });

    it('TaskController should return 400 when emergency phone number is invalid', async () => {
      // Arrange
      const requestBody = {
        domainId: '123',
        robisepType: robisepType.id.toString(),
        iamId: '123456789',
        surveillanceTask: {
          buildingToWatch: buildingToWatch.id.toString(),
          emergencyContact: 'Invalid',
          startingPointToWatch: startingPointToWatch.id.toString(),
          endingPointToWatch: endingPointToWatch.id.toString(),
        }
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // User gateway returns result with email
      const emailOrError = {
        getValue: sinon.stub().returns("email@isep.ipp.pt"),
        isFailure: false,
      };

      // Stub the userGateway getEmailByIamId method
      userGatewayMock.getEmailByIamId.resolves(emailOrError);

      // Stub floorFactory createFloor method
      taskFactoryMock.createSurveillanceTask.throws(new TypeError('Phone Number is not following a valid format.'));

      const controller = new TaskController(Container.get(config.services.task.name) as ITaskService);

      // Act
      await controller.requestTask(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'Phone Number is not following a valid format.'}));

    });

    it('TaskController should return 401 when user is not authorized', async () => {
      // Arrange
      const requestBody = {
        domainId: '123',
        robisepType: robisepType.id.toString(),
        iamId: '123456789',
        surveillanceTask: {
          buildingToWatch: buildingToWatch.id.toString(),
          emergencyContact: '912345678',
          startingPointToWatch: startingPointToWatch.id.toString(),
          endingPointToWatch: endingPointToWatch.id.toString(),
        }
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const taskServiceInstance = Container.get('TaskService');

      // Force the service to throw an error
      sinon
        .stub(taskServiceInstance, 'requestTask')
        .throws(new Error('You are not authorized to perform this action'));

      const controller = new TaskController(Container.get(config.services.task.name) as ITaskService);

      // Act
      await controller.requestTask(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
    });

    it('TaskController should return 409 when database error occurs', async () => {
      // Arrange
      const requestBody = {
        domainId: '123',
        robisepType: robisepType.id.toString(),
        iamId: '123456789',
        surveillanceTask: {
          buildingToWatch: buildingToWatch.id.toString(),
          emergencyContact: '912345678',
          startingPointToWatch: startingPointToWatch.id.toString(),
          endingPointToWatch: endingPointToWatch.id.toString(),
        }
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const surveillanceTaskInstance = SurveillanceTask.create(
        {
          taskState: TaskState.REQUESTED,
          taskCode: TaskCode.create(1).getValue(),
          email: 'email@isep.ipp.pt',
          robisepType: robisepType,
          emergencyPhoneNumber: PhoneNumber.create('912345678').getValue(),
          startingPointToWatch: startingPointToWatch,
          endingPointToWatch: endingPointToWatch,
        },
        new UniqueEntityID(requestBody.domainId),
      ).getValue();

      const surveillanceTaskOrErrorMock = {
        getValue: sinon.stub().returns(surveillanceTaskInstance),
        isFailure: false,
      };

      // User gateway returns result with email
      const emailOrError = {
        getValue: sinon.stub().returns("email@isep.ipp.pt"),
        isFailure: false,
      };

      // Stub the userGateway getEmailByIamId method
      userGatewayMock.getEmailByIamId.resolves(emailOrError);

      // Stub the taskFactory createSurveillanceTask method
      taskFactoryMock.createSurveillanceTask.resolves(surveillanceTaskOrErrorMock);

      // Stub surveillanceTaskRepo save method
      surveillanceTaskRepoMock.save.resolves(null);

      const controller = new TaskController(Container.get(config.services.task.name) as ITaskService);

      // Act
      await controller.requestTask(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 409);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(
        res.send,
        sinon.match({
          message: `Task with ${surveillanceTaskOrErrorMock.getValue().id.toString()} already exists.`,
        }),
      );

    });

    it('TaskController should return 503 when database error occurs', async () => {
      // Arrange
      const requestBody = {
        domainId: '123',
        robisepType: robisepType.id.toString(),
        iamId: '123456789',
        surveillanceTask: {
          buildingToWatch: buildingToWatch.id.toString(),
          emergencyContact: '912345678',
        }
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const surveillanceTaskInstance = SurveillanceTask.create(
        {
          taskState: TaskState.REQUESTED,
          taskCode: TaskCode.create(1).getValue(),
          email: 'email@isep.ipp.pt',
          robisepType: robisepType,
          emergencyPhoneNumber: PhoneNumber.create('912345678').getValue(),
          startingPointToWatch: startingPointToWatch,
          endingPointToWatch: endingPointToWatch,
        },
        new UniqueEntityID(requestBody.domainId),
      ).getValue();

      const surveillanceTaskOrErrorMock = {
        getValue: sinon.stub().returns(surveillanceTaskInstance),
        isFailure: false,
      };

      // User gateway returns result with email
      const emailOrError = {
        getValue: sinon.stub().returns("email@isep.ipp.pt"),
        isFailure: false,
      };

      // Stub the userGateway getEmailByIamId method
      userGatewayMock.getEmailByIamId.resolves(emailOrError);

      // Stub the taskFactory createSurveillanceTask method
      taskFactoryMock.createSurveillanceTask.resolves(surveillanceTaskOrErrorMock);

      // Stub surveillanceTaskRepo save method
      surveillanceTaskRepoMock.save.rejects(new Error('Database error'));

      const controller = new TaskController(Container.get(config.services.task.name) as ITaskService);

      // Act
      await controller.requestTask(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 503);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'Database error'}));

    });
  });

  describe('requestTask -> pickUpAndDeliveryTask', () => {
    // RobisepType
    let robisepType: RobisepType;

    // Rooms
    let room1: Room;
    let room2: Room;

    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };

      Container.set('logger', loggerMock);

      taskFactoryMock = {
        createPickUpAndDeliveryTask: sinon.stub(),
      };

      Container.set(config.factories.task.name, taskFactoryMock);

      surveillanceTaskRepoMock = {};

      Container.set(config.repos.surveillanceTask.name, surveillanceTaskRepoMock);

      pickUpAndDeliveryTaskRepoMock = {
        save: sinon.stub(),
      };

      Container.set(config.repos.pickUpAndDeliveryTask.name, pickUpAndDeliveryTaskRepoMock);

      robisepRepoMock = {
        findByDomainId: sinon.stub(),
      }

      userGatewayMock = {
        getEmailByIamId: sinon.stub(),
      }

      Container.set(config.gateways.user.name, userGatewayMock);

      taskGatewayMock = {
        getTaskSequeceByRobisepId: sinon.stub(),
      }

      Container.set(config.gateways.task.name, taskGatewayMock);

      // Create the RobisepType
      robisepType = RobisepTypeDataSource.getRobisepTypeA();

      // Create the rooms
      room1 = RoomDataSource.getRoomA();
      room2 = RoomDataSource.getRoomProlog1();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const taskServiceClass = require('../../src/services/ServicesImpl/taskService').default;
      const taskServiceInstance = Container.get(taskServiceClass);
      Container.set(config.services.task.name, taskServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('TaskController unit test using TaskService stub results in valid pickup and delivery task creation', async () => {
      // Arrange
      const pickUpPersonContact = {
        "name": "John Doe",
        "phoneNumber": "912345678"
      }

      const deliveryPersonContact = {
        "name": "Jane Doe",
        "phoneNumber": "912543876"
      }

      const requestBody = {
        domainId: '123',
        robisepType: robisepType.id.toString(),
        iamId: '123456789',
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: room1.id.toString(),
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: room2.id.toString(),
          description: 'Pick up and delivery task description',
          confirmationCode: 123456
        }
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const taskServiceInstance = Container.get(config.services.task.name);

      // Stub
      sinon.stub(taskServiceInstance, 'requestTask').returns(
        Result.ok<ITaskOutDTO>({
          state: TaskState.REQUESTED,
          taskCode: 2,
          domainId: '123',
          email: 'email@isep.ipp.pt',
          robisepType: RobisepTypeMap.toDTO(robisepType),
          pickUpAndDeliveryTask: {
            pickUpPersonContact: pickUpPersonContact,
            pickUpRoom: RoomMap.toDTO(room1),
            deliveryPersonContact: deliveryPersonContact,
            deliveryRoom: RoomMap.toDTO(room2),
            description: 'Pick up and delivery task description',
            confirmationCode: 123456
          }
        }),
      );

      const controller = new TaskController(taskServiceInstance as ITaskService);

      // Act
      await controller.requestTask(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match({
          state: TaskState.REQUESTED,
          domainId: '123',
          robisepType: RobisepTypeMap.toDTO(robisepType),
          email: 'email@isep.ipp.pt',
          pickUpAndDeliveryTask: {
            pickUpPersonContact: pickUpPersonContact,
            pickUpRoom: RoomMap.toDTO(room1),
            deliveryPersonContact: deliveryPersonContact,
            deliveryRoom: RoomMap.toDTO(room2),
            description: 'Pick up and delivery task description',
            confirmationCode: 123456
          }
        }),
      );
    });

    it('TaskController + TaskService integration test valid pickup and delivery task created with domainId', async () => {
      // Arrange
      const pickUpPersonContact = {
        "name": "John Doe",
        "phoneNumber": "912345678"
      }

      const deliveryPersonContact = {
        "name": "Jane Doe",
        "phoneNumber": "912543876"
      }

      const requestBody = {
        domainId: '123',
        robisepType: robisepType.id.toString(),
        iamId: '123456789',
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: room1.id.toString(),
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: room2.id.toString(),
          description: 'Pick up and delivery task description',
          confirmationCode: 123456
        }
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const pickUpPersonPhoneNumber = PhoneNumber.create(pickUpPersonContact.phoneNumber).getValue();
      const deliveryPersonPhoneNumber = PhoneNumber.create(deliveryPersonContact.phoneNumber).getValue();

      const pickUpPersonName = PersonalName.create(pickUpPersonContact.name).getValue();
      const deliveryPersonName = PersonalName.create(deliveryPersonContact.name).getValue();

      const pickUpAndDeliveryTaskInstance = PickUpAndDeliveryTask.create(
        {
          taskState: TaskState.REQUESTED,
          taskCode: TaskCode.create(2).getValue(),
          email: 'email@isep.ipp.pt',
          robisepType: robisepType,
          pickUpPersonContact: PickUpAndDeliveryTaskPersonContact.create({
            personPersonalName: pickUpPersonName,
            personPhoneNumber: pickUpPersonPhoneNumber,
          }).getValue(),
          pickUpRoom: room1,
          deliveryPersonContact: PickUpAndDeliveryTaskPersonContact.create({
            personPersonalName: deliveryPersonName,
            personPhoneNumber: deliveryPersonPhoneNumber,
          }).getValue(),
          deliveryRoom: room2,
          description: PickUpAndDeliveryTaskDescription.create('Pick up and delivery task description').getValue(),
          confirmationCode: PickUpAndDeliveryTaskConfirmationCode.create(123456).getValue(),
        },
        new UniqueEntityID(requestBody.domainId),
      ).getValue();


      const pickUpAndDeliveryTaskOrErrorMock = {
        getValue: sinon.stub().returns(pickUpAndDeliveryTaskInstance),
        isFailure: false,
      };

      // User gateway returns result with email
      const emailOrError = {
        getValue: sinon.stub().returns("email@isep.ipp.pt"),
        isFailure: false,
      };

      // Stub the userGateway getEmailByIamId method
      userGatewayMock.getEmailByIamId.resolves(emailOrError);

      // Stub the taskFactory createPickUpAndDeliveryTask method
      taskFactoryMock.createPickUpAndDeliveryTask.resolves(pickUpAndDeliveryTaskOrErrorMock);

      // Stub the surveillanceTaskRepo save method
      pickUpAndDeliveryTaskRepoMock.save.resolves(pickUpAndDeliveryTaskInstance);

      const taskService = Container.get(config.services.task.name);

      const taskServiceSpy = sinon.spy(taskService, 'requestTask');

      const controller = new TaskController(taskService as ITaskService);

      // Act
      await controller.requestTask(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match({
          state: TaskState.REQUESTED,
          domainId: '123',
          robisepType: RobisepTypeMap.toDTO(robisepType),
          email: 'email@isep.ipp.pt',
          pickUpAndDeliveryTask: {
            pickUpPersonContact: pickUpPersonContact,
            pickUpRoom: RoomMap.toDTO(room1),
            deliveryPersonContact: deliveryPersonContact,
            deliveryRoom: RoomMap.toDTO(room2),
            description: 'Pick up and delivery task description',
            confirmationCode: 123456
          }
        }),
      );

      sinon.assert.calledOnce(taskServiceSpy);
      sinon.assert.calledWith(
        taskServiceSpy,
        sinon.match({
          domainId: '123',
          robisepType: robisepType.id.toString(),
          iamId: '123456789',
          pickUpAndDeliveryTask: {
            pickUpPersonContact: pickUpPersonContact,
            pickUpRoom: room1.id.toString(),
            deliveryPersonContact: deliveryPersonContact,
            deliveryRoom: room2.id.toString(),
            description: 'Pick up and delivery task description',
            confirmationCode: 123456
          }
        }),
      );
    });

    it('TaskController should return 400 when description is invalid', async () => {
      // Arrange
      const pickUpPersonContact = {
        "name": "John Doe",
        "phoneNumber": "912345678"
      }

      const deliveryPersonContact = {
        "name": "Jane Doe",
        "phoneNumber": "912543876"
      }

      const requestBody = {
        domainId: '123',
        robisepType: robisepType.id.toString(),
        iamId: '123456789',
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: room1.id.toString(),
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: room2.id.toString(),
          description: '   ',
          confirmationCode: 123456
        }
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // User gateway returns result with email
      const emailOrError = {
        getValue: sinon.stub().returns("email@isep.ipp.pt"),
        isFailure: false,
      };

      // Stub the userGateway getEmailByIamId method
      userGatewayMock.getEmailByIamId.resolves(emailOrError);

      // Stub floorFactory createFloor method
      taskFactoryMock.createPickUpAndDeliveryTask.throws(new TypeError('Pick up and delivery task description only contains whitespace.'));

      const controller = new TaskController(Container.get(config.services.task.name) as ITaskService);

      // Act
      await controller.requestTask(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'Pick up and delivery task description only contains whitespace.'}));

    });

    it('TaskController should return 401 when user is not authorized', async () => {
      // Arrange
      const pickUpPersonContact = {
        "name": "John Doe",
        "phoneNumber": "912345678"
      }

      const deliveryPersonContact = {
        "name": "Jane Doe",
        "phoneNumber": "912543876"
      }

      const requestBody = {
        domainId: '123',
        robisepType: robisepType.id.toString(),
        iamId: '123456789',
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: room1.id.toString(),
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: room2.id.toString(),
          description: 'Pick up and delivery task description',
          confirmationCode: 123456
        }
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const taskServiceInstance = Container.get('TaskService');

      // Force the service to throw an error
      sinon
        .stub(taskServiceInstance, 'requestTask')
        .throws(new Error('You are not authorized to perform this action'));

      const controller = new TaskController(Container.get(config.services.task.name) as ITaskService);

      // Act
      await controller.requestTask(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
    });

    it('TaskController should return 409 when database error occurs', async () => {
      // Arrange
      const pickUpPersonContact = {
        "name": "John Doe",
        "phoneNumber": "912345678"
      }

      const deliveryPersonContact = {
        "name": "Jane Doe",
        "phoneNumber": "912543876"
      }

      const requestBody = {
        domainId: '123',
        robisepType: robisepType.id.toString(),
        iamId: '123456789',
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: room1.id.toString(),
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: room2.id.toString(),
          description: 'Pick up and delivery task description',
          confirmationCode: 123456
        }
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const pickUpPersonPhoneNumber = PhoneNumber.create(pickUpPersonContact.phoneNumber).getValue();
      const deliveryPersonPhoneNumber = PhoneNumber.create(deliveryPersonContact.phoneNumber).getValue();

      const pickUpPersonName = PersonalName.create(pickUpPersonContact.name).getValue();
      const deliveryPersonName = PersonalName.create(deliveryPersonContact.name).getValue();

      const pickUpAndDeliveryTaskInstance = PickUpAndDeliveryTask.create(
        {
          taskState: TaskState.REQUESTED,
          taskCode: TaskCode.create(2).getValue(),
          email: 'email@isep.ipp.pt',
          robisepType: robisepType,
          pickUpPersonContact: PickUpAndDeliveryTaskPersonContact.create({
            personPersonalName: pickUpPersonName,
            personPhoneNumber: pickUpPersonPhoneNumber,
          }).getValue(),
          pickUpRoom: room1,
          deliveryPersonContact: PickUpAndDeliveryTaskPersonContact.create({
            personPersonalName: deliveryPersonName,
            personPhoneNumber: deliveryPersonPhoneNumber,
          }).getValue(),
          deliveryRoom: room2,
          description: PickUpAndDeliveryTaskDescription.create('Pick up and delivery task description').getValue(),
          confirmationCode: PickUpAndDeliveryTaskConfirmationCode.create(123456).getValue(),
        },
        new UniqueEntityID(requestBody.domainId),
      ).getValue();

      const pickUpAndDeliveryTaskOrErrorMock = {
        getValue: sinon.stub().returns(pickUpAndDeliveryTaskInstance),
        isFailure: false,
      };

      // User gateway returns result with email
      const emailOrError = {
        getValue: sinon.stub().returns("email@isep.ipp.pt"),
        isFailure: false,
      };

      // Stub the userGateway getEmailByIamId method
      userGatewayMock.getEmailByIamId.resolves(emailOrError);

      // Stub the taskFactory createPickUpAndDeliveryTask method
      taskFactoryMock.createPickUpAndDeliveryTask.resolves(pickUpAndDeliveryTaskOrErrorMock);

      // Stub pickUpAndDeliveryTaskRepo save method
      pickUpAndDeliveryTaskRepoMock.save.resolves(null);

      const controller = new TaskController(Container.get(config.services.task.name) as ITaskService);

      // Act
      await controller.requestTask(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 409);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(
        res.send,
        sinon.match({
          message: `Task with ${pickUpAndDeliveryTaskOrErrorMock.getValue().id.toString()} already exists.`,
        }),
      );
    });

    it('TaskController should return 503 when database error occurs', async () => {
      // Arrange
      const pickUpPersonContact = {
        "name": "John Doe",
        "phoneNumber": "912345678"
      }

      const deliveryPersonContact = {
        "name": "Jane Doe",
        "phoneNumber": "912543876"
      }

      const requestBody = {
        domainId: '123',
        robisepType: robisepType.id.toString(),
        iamId: '123456789',
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: room1.id.toString(),
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: room2.id.toString(),
          description: 'Pick up and delivery task description',
          confirmationCode: 123456
        }
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const pickUpPersonPhoneNumber = PhoneNumber.create(pickUpPersonContact.phoneNumber).getValue();
      const deliveryPersonPhoneNumber = PhoneNumber.create(deliveryPersonContact.phoneNumber).getValue();

      const pickUpPersonName = PersonalName.create(pickUpPersonContact.name).getValue();
      const deliveryPersonName = PersonalName.create(deliveryPersonContact.name).getValue();

      const pickUpAndDeliveryTaskInstance = PickUpAndDeliveryTask.create(
        {
          taskState: TaskState.REQUESTED,
          taskCode: TaskCode.create(2).getValue(),
          email: 'email@isep.ipp.pt',
          robisepType: robisepType,
          pickUpPersonContact: PickUpAndDeliveryTaskPersonContact.create({
            personPersonalName: pickUpPersonName,
            personPhoneNumber: pickUpPersonPhoneNumber,
          }).getValue(),
          pickUpRoom: room1,
          deliveryPersonContact: PickUpAndDeliveryTaskPersonContact.create({
            personPersonalName: deliveryPersonName,
            personPhoneNumber: deliveryPersonPhoneNumber,
          }).getValue(),
          deliveryRoom: room2,
          description: PickUpAndDeliveryTaskDescription.create('Pick up and delivery task description').getValue(),
          confirmationCode: PickUpAndDeliveryTaskConfirmationCode.create(123456).getValue(),
        },
        new UniqueEntityID(requestBody.domainId),
      ).getValue();

      const pickUpAndDeliveryTaskOrErrorMock = {
        getValue: sinon.stub().returns(pickUpAndDeliveryTaskInstance),
        isFailure: false,
      };

      // User gateway returns result with email
      const emailOrError = {
        getValue: sinon.stub().returns("email@isep.ipp.pt"),
        isFailure: false,
      };

      // Stub the userGateway getEmailByIamId method
      userGatewayMock.getEmailByIamId.resolves(emailOrError);

      // Stub the taskFactory createPickUpAndDeliveryTask method
      taskFactoryMock.createPickUpAndDeliveryTask.resolves(pickUpAndDeliveryTaskOrErrorMock);

      // Stub pickUpAndDeliveryTaskRepo save method
      pickUpAndDeliveryTaskRepoMock.save.rejects(new Error('Database error'));

      const controller = new TaskController(Container.get(config.services.task.name) as ITaskService);

      // Act
      await controller.requestTask(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 503);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'Database error'}));
    });
  });

  describe('listAllTasks', () => {
    // Surveillance tasks
    let surveillanceTaskBuildingA: SurveillanceTask;
    let surveillanceTaskBuildingB: SurveillanceTask;

    // Pick up and delivery tasks
    let pickUpAndDeliveryTaskRoomAToRoomProlog1: PickUpAndDeliveryTask;
    let pickUpAndDeliveryTaskRoomBToRoomProlog1: PickUpAndDeliveryTask;

    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };

      Container.set('logger', loggerMock);

      taskFactoryMock = {};

      Container.set(config.factories.task.name, taskFactoryMock);

      surveillanceTaskRepoMock = {
        findAll: sinon.stub(),
      };

      Container.set(config.repos.surveillanceTask.name, surveillanceTaskRepoMock);

      pickUpAndDeliveryTaskRepoMock = {
        findAll: sinon.stub(),
      };

      Container.set(config.repos.pickUpAndDeliveryTask.name, pickUpAndDeliveryTaskRepoMock);



      // Create the surveillance tasks
      surveillanceTaskBuildingA = SurveillanceTaskDataSource.getBuildingASurveillanceTask();
      surveillanceTaskBuildingB = SurveillanceTaskDataSource.getBuildingBSurveillanceTask();

      // Create the pickup and delivery tasks
      pickUpAndDeliveryTaskRoomAToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTask();
      pickUpAndDeliveryTaskRoomBToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTask();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const taskServiceClass = require('../../src/services/ServicesImpl/taskService').default;
      const taskServiceInstance = Container.get(taskServiceClass);
      Container.set(config.services.task.name, taskServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('TaskController unit test using TaskService stub results in valid list of tasks', async () => {
      // Arrange
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const taskServiceInstance = Container.get(config.services.task.name);

      // Stub
      sinon.stub(taskServiceInstance, 'listAllTasks').returns(
        [
          SurveillanceTaskDataSource.getBuildingASurveillanceTaskOutDTO(),
          SurveillanceTaskDataSource.getBuildingBSurveillanceTaskOutDTO(),
          PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
          PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
        ],
      );

      const controller = new TaskController(taskServiceInstance as ITaskService);

      // Act
      await controller.listAllTasks(<Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match([
          SurveillanceTaskDataSource.getBuildingASurveillanceTaskOutDTO(),
          SurveillanceTaskDataSource.getBuildingBSurveillanceTaskOutDTO(),
          PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
          PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
        ]),
      );
    });

    it('TaskController + TaskService integration test valid list of tasks', async () => {
      // Arrange
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the surveillanceTaskRepo findAll method
      surveillanceTaskRepoMock.findAll.resolves([
        surveillanceTaskBuildingA,
        surveillanceTaskBuildingB,
      ]);

      // Stub the pickUpAndDeliveryTaskRepo findAll method
      pickUpAndDeliveryTaskRepoMock.findAll.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);

      const taskService = Container.get(config.services.task.name);

      const taskServiceSpy = sinon.spy(taskService, 'listAllTasks');

      const controller = new TaskController(taskService as ITaskService);

      // Act
      await controller.listAllTasks(<Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);

      sinon.assert.calledOnce(taskServiceSpy);
    });

    it('TaskController should return 401 when user is not authorized', async () => {
      // Arrange
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Force the surveillanceTaskRepo to throw an error
      surveillanceTaskRepoMock.findAll.throws(new Error('You are not authorized to perform this action'));

      const controller = new TaskController(Container.get(config.services.task.name) as ITaskService);

      // Act
      await controller.listAllTasks(<Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
    });

  });

  describe('listTasksByState', () => {
    // Surveillance tasks
    let surveillanceTaskBuildingA: SurveillanceTask;
    let surveillanceTaskBuildingB: SurveillanceTask;

    // Pick up and delivery tasks
    let pickUpAndDeliveryTaskRoomAToRoomProlog1: PickUpAndDeliveryTask;
    let pickUpAndDeliveryTaskRoomBToRoomProlog1: PickUpAndDeliveryTask;

    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };

      Container.set('logger', loggerMock);

      taskFactoryMock = {};

      Container.set(config.factories.task.name, taskFactoryMock);

      surveillanceTaskRepoMock = {
        findByState: sinon.stub(),
      };

      Container.set(config.repos.surveillanceTask.name, surveillanceTaskRepoMock);

      pickUpAndDeliveryTaskRepoMock = {
        findByState: sinon.stub(),
      };

      Container.set(config.repos.pickUpAndDeliveryTask.name, pickUpAndDeliveryTaskRepoMock);

      // Create the surveillance tasks
      surveillanceTaskBuildingA = SurveillanceTaskDataSource.getBuildingASurveillanceTask();
      surveillanceTaskBuildingB = SurveillanceTaskDataSource.getBuildingBSurveillanceTask();

      // Create the pickup and delivery tasks
      pickUpAndDeliveryTaskRoomAToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTask();
      pickUpAndDeliveryTaskRoomBToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTask();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const taskServiceClass = require('../../src/services/ServicesImpl/taskService').default;
      const taskServiceInstance = Container.get(taskServiceClass);
      Container.set(config.services.task.name, taskServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('TaskController unit test using TaskService stub results in valid list of tasks', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          state: 'REQUESTED'
        }
      }
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const taskServiceInstance = Container.get(config.services.task.name);

      // Stub
      sinon.stub(taskServiceInstance, 'listTasksByState').returns(
        Result.ok<ITaskOutDTO[]>(
          [
            SurveillanceTaskDataSource.getBuildingASurveillanceTaskOutDTO(),
            SurveillanceTaskDataSource.getBuildingBSurveillanceTaskOutDTO(),
            PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
            PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
          ],
        ));

      const controller = new TaskController(taskServiceInstance as ITaskService);

      // Act
      await controller.listTasksByState(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match([
          SurveillanceTaskDataSource.getBuildingASurveillanceTaskOutDTO(),
          SurveillanceTaskDataSource.getBuildingBSurveillanceTaskOutDTO(),
          PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
          PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
        ]),
      );
    });

    it('TaskController unit test using TaskService stub - Unauthorized', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          state: 'REQUESTED'
        }
      }
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const taskServiceInstance = Container.get(config.services.task.name);

      // Stub
      sinon.stub(taskServiceInstance, 'listTasksByState').throws(new Error('You are not authorized to perform this action'));

      const controller = new TaskController(taskServiceInstance as ITaskService);

      // Act
      await controller.listTasksByState(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
    });

    it('TaskController + TaskService integration test valid list of tasks', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          state: 'REQUESTED'
        }
      }
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the surveillanceTaskRepo findAll method
      surveillanceTaskRepoMock.findByState.resolves([
        surveillanceTaskBuildingA,
        surveillanceTaskBuildingB,
      ]);

      // Stub the pickUpAndDeliveryTaskRepo findAll method
      pickUpAndDeliveryTaskRepoMock.findByState.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);

      const taskService = Container.get(config.services.task.name);

      const taskServiceSpy = sinon.spy(taskService, 'listTasksByState');

      const controller = new TaskController(taskService as ITaskService);

      // Act
      await controller.listTasksByState(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);

      sinon.assert.calledOnce(taskServiceSpy);
    });

    it('TaskController should fail when service method fails (empty input)', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          state: ''
        }
      }
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const controller = new TaskController(Container.get(config.services.task.name) as ITaskService);

      // Act
      await controller.listTasksByState(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, {message: 'At least one state must be chosen.'});
    });

    it('TaskController should fail when service method fails (invalid states)', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          state: 'INVALID'
        }
      }
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const controller = new TaskController(Container.get(config.services.task.name) as ITaskService);

      // Act
      await controller.listTasksByState(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, {message: 'The following states do not exist: INVALID. Valid states are: REQUESTED, ACCEPTED, REFUSED, PLANNED.'});
    });

  });

  describe('ListTasksByUser', () => {
    // Surveillance tasks
    let surveillanceTaskBuildingA: SurveillanceTask;
    let surveillanceTaskBuildingB: SurveillanceTask;

    // Pick up and delivery tasks
    let pickUpAndDeliveryTaskRoomAToRoomProlog1: PickUpAndDeliveryTask;
    let pickUpAndDeliveryTaskRoomBToRoomProlog1: PickUpAndDeliveryTask;

    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };

      Container.set('logger', loggerMock);

      taskFactoryMock = {
        createPickUpAndDeliveryTask: sinon.stub(),
      };

      Container.set(config.factories.task.name, taskFactoryMock);

      surveillanceTaskRepoMock = {
        findByUser: sinon.stub(),
      };

      Container.set(config.repos.surveillanceTask.name, surveillanceTaskRepoMock);

      pickUpAndDeliveryTaskRepoMock = {
        findByUser: sinon.stub(),
      };

      Container.set(config.repos.pickUpAndDeliveryTask.name, pickUpAndDeliveryTaskRepoMock);

      userGatewayMock = {
        getEmailByIamId: sinon.stub(),
      }

      Container.set(config.gateways.user.name, userGatewayMock);

      // Create the surveillance tasks
      surveillanceTaskBuildingA = SurveillanceTaskDataSource.getBuildingASurveillanceTask();
      surveillanceTaskBuildingB = SurveillanceTaskDataSource.getBuildingBSurveillanceTask();

      // Create the pickup and delivery tasks
      pickUpAndDeliveryTaskRoomAToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTask();
      pickUpAndDeliveryTaskRoomBToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTask();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const taskServiceClass = require('../../src/services/ServicesImpl/taskService').default;
      const taskServiceInstance = Container.get(taskServiceClass);
      Container.set(config.services.task.name, taskServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('TaskController unit test using TaskService stub results in valid list of tasks', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          iamId: '123456789'
        }
      }

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const taskServiceInstance = Container.get(config.services.task.name);

      // Tasks
      const tasks = [
        SurveillanceTaskDataSource.getBuildingASurveillanceTaskOutDTO(),
        SurveillanceTaskDataSource.getBuildingBSurveillanceTaskOutDTO(),
        PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
        PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
      ];

      // Service returns list as result
      const tasksOrError = {
        getValue: sinon.stub().returns(tasks),
        isFailure: false,
      };

      // Stub
      sinon.stub(taskServiceInstance, 'listTasksByUser').returns(tasksOrError);

      const controller = new TaskController(taskServiceInstance as ITaskService);

      // Act
      await controller.listTasksByUser(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match([
          SurveillanceTaskDataSource.getBuildingASurveillanceTaskOutDTO(),
          SurveillanceTaskDataSource.getBuildingBSurveillanceTaskOutDTO(),
          PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
          PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
        ]),
      );
    });

    it('TaskController unit test using TaskService stub - Unauthorized', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          iamId: '123456789'
        }
      }

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const taskServiceInstance = Container.get(config.services.task.name);

      // Stub
      sinon.stub(taskServiceInstance, 'listTasksByUser').throws(new Error('You are not authorized to perform this action'));

      const controller = new TaskController(taskServiceInstance as ITaskService);

      // Act
      await controller.listTasksByUser(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
    });

    it('TaskController + TaskService integration test valid list of tasks', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          iamId: '123456789'
        }
      }

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the userGateway getEmailByIamId method
      userGatewayMock.getEmailByIamId.resolves({
        getValue: sinon.stub().returns("email@isep.ipp.pt"),
        isFailure: false,
      });

      // Stub the surveillanceTaskRepo findByUser method
      surveillanceTaskRepoMock.findByUser.resolves([
        surveillanceTaskBuildingA,
        surveillanceTaskBuildingB,
      ]);

      // Stub the pickUpAndDeliveryTaskRepo findByUser method
      pickUpAndDeliveryTaskRepoMock.findByUser.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);

      const taskService = Container.get(config.services.task.name);

      const taskServiceSpy = sinon.spy(taskService, 'listTasksByUser');

      const controller = new TaskController(taskService as ITaskService);

      // Act
      await controller.listTasksByUser(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);

      sinon.assert.calledOnce(taskServiceSpy);
    });

    it('TaskController should fail when service method fails, iamId does not correspond to email', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          iamId: '123456789'
        }
      }

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the userGateway getEmailByIamId method
      userGatewayMock.getEmailByIamId.resolves({
        getValue: sinon.stub().returns(null),
        isFailure: true,
        error: 'User not found',
        failureType: FailureType.EntityDoesNotExist,
      });

      const controller = new TaskController(Container.get(config.services.task.name) as ITaskService);

      // Act
      await controller.listTasksByUser(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, {message: 'User not found'});
    });

    it('TaskController should fail when service method fails, request is not authorized', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          iamId: '123456789'
        }
      }

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the userGateway getEmailByIamId method
      userGatewayMock.getEmailByIamId.resolves({
        getValue: sinon.stub().returns(null),
        isFailure: true,
        error: 'Unauthorized.',
        failureType: FailureType.Unauthorized,
      });

      const controller = new TaskController(Container.get(config.services.task.name) as ITaskService);

      // Act
      await controller.listTasksByUser(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, {message: 'Unauthorized.'});
    });
  });

  describe('ListTasksByUserStateAndType', () => {
    // Surveillance tasks
    let surveillanceTaskBuildingA: SurveillanceTask;
    let surveillanceTaskBuildingB: SurveillanceTask;

    // Pick up and delivery tasks
    let pickUpAndDeliveryTaskRoomAToRoomProlog1: PickUpAndDeliveryTask;
    let pickUpAndDeliveryTaskRoomBToRoomProlog1: PickUpAndDeliveryTask;

    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };

      Container.set('logger', loggerMock);

      taskFactoryMock = {
        createPickUpAndDeliveryTask: sinon.stub(),
      };

      Container.set(config.factories.task.name, taskFactoryMock);

      surveillanceTaskRepoMock = {
        findByStateTypeAndEmail: sinon.stub(),
      };

      Container.set(config.repos.surveillanceTask.name, surveillanceTaskRepoMock);

      pickUpAndDeliveryTaskRepoMock = {
        findByStateTypeAndEmail: sinon.stub(),
      };

      Container.set(config.repos.pickUpAndDeliveryTask.name, pickUpAndDeliveryTaskRepoMock);

      userGatewayMock = {
        getEmailByIamId: sinon.stub(),
      }

      Container.set(config.gateways.user.name, userGatewayMock);

      // Create the surveillance tasks
      surveillanceTaskBuildingA = SurveillanceTaskDataSource.getBuildingASurveillanceTask();
      surveillanceTaskBuildingB = SurveillanceTaskDataSource.getBuildingBSurveillanceTask();

      // Create the pickup and delivery tasks
      pickUpAndDeliveryTaskRoomAToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTask();
      pickUpAndDeliveryTaskRoomBToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTask();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const taskServiceClass = require('../../src/services/ServicesImpl/taskService').default;
      const taskServiceInstance = Container.get(taskServiceClass);
      Container.set(config.services.task.name, taskServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('TaskController unit test using TaskService stub results in valid list of tasks', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          personId: '123456789',
          state: 'REQUESTED',
          type: 'SURVEILLANCE'
        }
      }

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const taskServiceInstance = Container.get(config.services.task.name);

      // Tasks
      const tasks = [
        SurveillanceTaskDataSource.getBuildingASurveillanceTaskOutDTO(),
        SurveillanceTaskDataSource.getBuildingBSurveillanceTaskOutDTO(),
        PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
        PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
      ];

      // Service returns list as result
      const tasksOrError = {
        getValue: sinon.stub().returns(tasks),
        isFailure: false,
      };

      // Stub
      sinon.stub(taskServiceInstance, 'listTasksByMultipleParameters').returns(tasksOrError);

      const controller = new TaskController(taskServiceInstance as ITaskService);

      // Act
      await controller.listTasksByMultipleParameters(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match([
          SurveillanceTaskDataSource.getBuildingASurveillanceTaskOutDTO(),
          SurveillanceTaskDataSource.getBuildingBSurveillanceTaskOutDTO(),
          PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
          PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
        ]),
      );
    });

    it('TaskController unit test using TaskService stub results in valid list of tasks with empty parameters', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          
        }
      }

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const taskServiceInstance = Container.get(config.services.task.name);

      // Tasks
      const tasks = [
        SurveillanceTaskDataSource.getBuildingASurveillanceTaskOutDTO(),
        SurveillanceTaskDataSource.getBuildingBSurveillanceTaskOutDTO(),
        PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
        PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
      ];

      // Service returns list as result
      const tasksOrError = {
        getValue: sinon.stub().returns(tasks),
        isFailure: false,
      };

      // Stub
      sinon.stub(taskServiceInstance, 'listTasksByMultipleParameters').returns(tasksOrError);

      const controller = new TaskController(taskServiceInstance as ITaskService);

      // Act
      await controller.listTasksByMultipleParameters(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match([
          SurveillanceTaskDataSource.getBuildingASurveillanceTaskOutDTO(),
          SurveillanceTaskDataSource.getBuildingBSurveillanceTaskOutDTO(),
          PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
          PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTaskOutDTO(),
        ]),
      );
    });


    it('TaskController + TaskService integration test valid list of tasks', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          personId: '123456789',
          state: 'REQUESTED',
          type: 'SURVEILLANCE'
        }
      }

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the userGateway getEmailByIamId method
      userGatewayMock.getEmailByIamId.resolves({
        getValue: sinon.stub().returns("email@isep.ipp.pt"),
        isFailure: false,
      });

      // Stub the surveillanceTaskRepo findByUser method
      surveillanceTaskRepoMock.findByStateTypeAndEmail.resolves([
        surveillanceTaskBuildingA,
        surveillanceTaskBuildingB,
      ]);

      // Stub the pickUpAndDeliveryTaskRepo findByUser method
      pickUpAndDeliveryTaskRepoMock.findByStateTypeAndEmail.resolves([
        pickUpAndDeliveryTaskRoomAToRoomProlog1,
        pickUpAndDeliveryTaskRoomBToRoomProlog1,
      ]);

      const taskService = Container.get(config.services.task.name);

      const taskServiceSpy = sinon.spy(taskService, 'listTasksByMultipleParameters');

      const controller = new TaskController(taskService as ITaskService);

      // Act
      await controller.listTasksByMultipleParameters(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);

      sinon.assert.calledOnce(taskServiceSpy);
    });

    it('TaskController should fail when service method fails, iamId does not correspond to email', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          personId: '123456789'
        }
      }

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the userGateway getEmailByIamId method
      userGatewayMock.getEmailByIamId.resolves({
        getValue: sinon.stub().returns(null),
        isFailure: true,
        error: 'User not found',
        failureType: FailureType.EntityDoesNotExist,
      });

      const controller = new TaskController(Container.get(config.services.task.name) as ITaskService);

      // Act
      await controller.listTasksByMultipleParameters(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, {message: 'User not found'});
    });

    it('TaskController should fail when service method fails, request is not authorized', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          personId: '123456789'
        }
      }

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the userGateway getEmailByIamId method
      userGatewayMock.getEmailByIamId.resolves({
        getValue: sinon.stub().returns(null),
        isFailure: true,
        error: 'Unauthorized.',
        failureType: FailureType.Unauthorized,
      });

      const controller = new TaskController(Container.get(config.services.task.name) as ITaskService);

      // Act
      await controller.listTasksByMultipleParameters(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, {message: 'Unauthorized.'});
    });
    

  });

  describe('getTaskSequence', () => {// Surveillance tasks
    let surveillanceTaskBuildingA: SurveillanceTask;
    let surveillanceTaskBuildingB: SurveillanceTask;

    // Pick up and delivery tasks
    let pickUpAndDeliveryTaskRoomAToRoomProlog1: PickUpAndDeliveryTask;
    let pickUpAndDeliveryTaskRoomBToRoomProlog1: PickUpAndDeliveryTask;

    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };

      Container.set('logger', loggerMock);

      taskFactoryMock = {};

      Container.set(config.factories.task.name, taskFactoryMock);

      surveillanceTaskRepoMock = {
        findByCode: sinon.stub(),
        findByState: sinon.stub(),
        update: sinon.stub(),
      };

      Container.set(config.repos.surveillanceTask.name, surveillanceTaskRepoMock);

      pickUpAndDeliveryTaskRepoMock = {
        findByCode: sinon.stub(),
        findByState: sinon.stub(),
        update: sinon.stub(),
      };

      Container.set(config.repos.pickUpAndDeliveryTask.name, pickUpAndDeliveryTaskRepoMock);

      robisepRepoMock = {
        findByDomainId: sinon.stub(),
      }

      Container.set(config.repos.robisep.name, robisepRepoMock);

      userGatewayMock = {}

      Container.set(config.gateways.user.name, userGatewayMock);

      taskGatewayMock = {
        getTaskSequeceByRobisepId: sinon.stub(),
      }

      Container.set(config.gateways.task.name, taskGatewayMock);

      // Create the surveillance tasks
      surveillanceTaskBuildingA = SurveillanceTaskDataSource.getBuildingASurveillanceAcceptedTask();
      surveillanceTaskBuildingB = SurveillanceTaskDataSource.getBuildingBSurveillanceAcceptedTask();

      // Create the pickup and delivery tasks
      pickUpAndDeliveryTaskRoomAToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryAcceptedTask();
      pickUpAndDeliveryTaskRoomBToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryAcceptedTask();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const taskServiceClass = require('../../src/services/ServicesImpl/taskService').default;
      const taskServiceInstance = Container.get(taskServiceClass);
      Container.set(config.services.task.name, taskServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });


    it('TaskController unit test using TaskService stub results in valid task sequence', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          algorithm: 'PERMUTATION'
        }
      }

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const taskServiceInstance = Container.get(config.services.task.name);

      // Tasks
      const tasks = [
        SurveillanceTaskDataSource.getBuildingASurveillanceAcceptedTaskOutDTO(),
        SurveillanceTaskDataSource.getBuildingBSurveillanceAcceptedTaskOutDTO(),
        PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryAcceptedTaskOutDTO(),
        PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryAcceptedTaskOutDTO(),
      ];

      // Service returns list as result
      const tasksOrError = {
        getValue: sinon.stub().returns(tasks),
        isFailure: false,
      };

      // Stub
      sinon.stub(taskServiceInstance, 'getTaskSequence').returns(tasksOrError);

      const controller = new TaskController(taskServiceInstance as ITaskService);

      // Act
      await controller.getTaskSequence(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match([
          SurveillanceTaskDataSource.getBuildingASurveillanceAcceptedTaskOutDTO(),
          SurveillanceTaskDataSource.getBuildingBSurveillanceAcceptedTaskOutDTO(),
          PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryAcceptedTaskOutDTO(),
          PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryAcceptedTaskOutDTO(),
        ]),
      );
    });


    it('TaskController + TaskService integration test valid list of tasks', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          algorithm: 'PERMUTATION',
        }
      }

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };


      const robisep = RobisepDataSource.getRobisepB();
      const taskGatewayResult = Result.ok<ITaskSequenceDTO>
      ({
        Sequence: [
          "1", "2", "1", "2"
        ],
        cost: 0,
      });

      // Mocks
      surveillanceTaskRepoMock.findByState.resolves([surveillanceTaskBuildingA, surveillanceTaskBuildingB]);
      pickUpAndDeliveryTaskRepoMock.findByState.resolves([pickUpAndDeliveryTaskRoomAToRoomProlog1, pickUpAndDeliveryTaskRoomBToRoomProlog1]);
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

      const taskService = Container.get(config.services.task.name);

      const taskServiceSpy = sinon.spy(taskService, 'getTaskSequence');

      const controller = new TaskController(taskService as ITaskService);

      // Act
      await controller.getTaskSequence(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);

      sinon.assert.calledOnce(taskServiceSpy);
    });

  });

  describe('UpdateTaskState', () => {// Surveillance tasks
    let surveillanceTaskBuildingA: SurveillanceTask;
    let surveillanceTaskBuildingB: SurveillanceTask;

    // Pick up and delivery tasks
    let pickUpAndDeliveryTaskRoomAToRoomProlog1: PickUpAndDeliveryTask;
    let pickUpAndDeliveryTaskRoomBToRoomProlog1: PickUpAndDeliveryTask;

    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };

      Container.set('logger', loggerMock);

      taskFactoryMock = {};

      Container.set(config.factories.task.name, taskFactoryMock);

      surveillanceTaskRepoMock = {
        findByCode: sinon.stub(),
        update: sinon.stub(),
      };

      Container.set(config.repos.surveillanceTask.name, surveillanceTaskRepoMock);

      pickUpAndDeliveryTaskRepoMock = {
        findByCode: sinon.stub(),
        update: sinon.stub(),
      };

      Container.set(config.repos.pickUpAndDeliveryTask.name, pickUpAndDeliveryTaskRepoMock);

      robisepRepoMock = {
        findByCode: sinon.stub(),
      }

      Container.set(config.repos.robisep.name, robisepRepoMock);

      userGatewayMock = {}

      Container.set(config.gateways.user.name, userGatewayMock);

      taskGatewayMock = {}

      Container.set(config.gateways.task.name, taskGatewayMock);

      // Create the surveillance tasks
      surveillanceTaskBuildingA = SurveillanceTaskDataSource.getBuildingASurveillanceTask();
      surveillanceTaskBuildingB = SurveillanceTaskDataSource.getBuildingBSurveillanceTask();

      // Create the pickup and delivery tasks
      pickUpAndDeliveryTaskRoomAToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomAToRoomProlog1PickUpAndDeliveryTask();
      pickUpAndDeliveryTaskRoomBToRoomProlog1 = PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTask();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const taskServiceClass = require('../../src/services/ServicesImpl/taskService').default;
      const taskServiceInstance = Container.get(taskServiceClass);
      Container.set(config.services.task.name, taskServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });


    it('TaskController unit test using TaskService stub results in valid task sequence', async () => {
      // Arrange
      const req: Partial<Request> = {
        params: {
          taskCode: '1'
        },
        body: {
          robisep: RobisepDataSource.getRobisepA(),
          newTaskState: 'ACCEPTED',
          taskType: 'SURVEILLANCE',
        }
      }

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const taskServiceInstance = Container.get(config.services.task.name);

      const pickUpAndDeliveryTask: IPickUpAndDeliveryTaskOutDTO = {
        pickUpPersonContact: {
          name: 'João',
          phoneNumber: '912345678',
        },
        deliveryPersonContact: {
          name: 'João',
          phoneNumber: '912345678',
        },
        description: 'Entregar encomenda',
        confirmationCode: 123456,
        pickUpRoom: RoomDataSource.getRoomAdto(),
        deliveryRoom: RoomDataSource.getRoomBdto(),
      }

      const surveillanceTask: ISurveillanceTaskOutDTO = {
        emergencyPhoneNumber: '912345678',
        startingPointToWatch: RoomDataSource.getRoomAdto(),
        endingPointToWatch: RoomDataSource.getRoomBdto(),
      }

      const taskOut: ITaskOutDTO = {
        domainId: '1',
        robisepType: RobisepTypeDataSource.getRobisepTypeAdto(),
        taskCode: 1,
        email: '1211061@isep.ipp.pt',
        robisep: RobisepDataSource.getRobisepADTO(),
        state: 'ACCEPTED',
        pickUpAndDeliveryTask: pickUpAndDeliveryTask,
        surveillanceTask: surveillanceTask,
      }

      const result = Result.ok<ITaskOutDTO>(taskOut);

      // Stub
      sinon.stub(taskServiceInstance, 'updateTaskState').returns(result);

      const controller = new TaskController(taskServiceInstance as ITaskService);

      // Act
      await controller.updateTaskState(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match(taskOut),
      );
    });


    it('TaskController + TaskService integration test accept task', async () => {
      // Arrange
      const req: Partial<Request> = {
        params: {
          taskCode: '1'
        },
        body: {
          robisep: RobisepDataSource.getRobisepA(),
          newTaskState: 'ACCEPTED',
          taskType: 'SURVEILLANCE',
        }
      }

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Mocks
      surveillanceTaskRepoMock.findByCode.resolves(surveillanceTaskBuildingA);
      robisepRepoMock.findByCode.resolves(RobisepDataSource.getRobisepB());
      surveillanceTaskRepoMock.update.resolves(surveillanceTaskBuildingA);

      const taskService = Container.get(config.services.task.name);

      const taskServiceSpy = sinon.spy(taskService, 'updateTaskState');

      const controller = new TaskController(taskService as ITaskService);

      // Act
      await controller.updateTaskState(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);

      sinon.assert.calledOnce(taskServiceSpy);
    });


    it('TaskController + TaskService integration test refuse task', async () => {
      // Arrange
      const req: Partial<Request> = {
        params: {
          taskCode: '1'
        },
        body: {
          robisep: RobisepDataSource.getRobisepA(),
          newTaskState: 'REFUSED',
          taskType: 'SURVEILLANCE',
        }
      }

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Mocks
      surveillanceTaskRepoMock.findByCode.resolves(surveillanceTaskBuildingA);
      surveillanceTaskRepoMock.update.resolves(surveillanceTaskBuildingA);

      const taskService = Container.get(config.services.task.name);

      const taskServiceSpy = sinon.spy(taskService, 'updateTaskState');

      const controller = new TaskController(taskService as ITaskService);

      // Act
      await controller.updateTaskState(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);

      sinon.assert.calledOnce(taskServiceSpy);
    });

  });

});