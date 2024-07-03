import {expect} from 'chai';
import * as sinon from 'sinon';
import TaskFactory from "../../../src/factories/taskFactory";
import {RobisepType} from "../../../src/domain/robisepType/RobisepType";
import RobisepTypeDataSource from "../../datasource/robisepTypeDataSource";
import {TaskState} from "../../../src/domain/task/taskState";
import {Room} from "../../../src/domain/room/Room";
import RoomDataSource from "../../datasource/RoomDataSource";

describe('TaskFactory', () => {
  describe('create surveillance task when', () => {
    // Create sinon sandbox for isolating tests
    const sandbox = sinon.createSandbox();

    // TaskFactory
    let taskFactory: TaskFactory;

    // Mocks
    let robisepTypeRepoMock: any;
    let roomRepoMock: any;
    let surveillanceTaskRepoMock: any;
    let pickUpAndDeliveryTaskRepoMock: any;

    // RobisepType
    let robisepType: RobisepType;

    // Rooms to watch
    let startingPointToWatch: Room;
    let endingPointToWatch: Room;

    beforeEach(() => {
      robisepType = RobisepTypeDataSource.getRobisepTypeB();

      startingPointToWatch = RoomDataSource.getFirstRoomT();

      endingPointToWatch = RoomDataSource.getSecondRoomT();

      robisepTypeRepoMock = {
        findByDomainId: sinon.stub(),
      }

      roomRepoMock = {
        findByDomainId: sinon.stub(),
      }

      surveillanceTaskRepoMock = {
        findAll: sinon.stub(),
      }

      pickUpAndDeliveryTaskRepoMock = {
        findAll: sinon.stub(),
      }

      taskFactory = new TaskFactory(robisepTypeRepoMock, roomRepoMock, surveillanceTaskRepoMock, pickUpAndDeliveryTaskRepoMock);
    });

    afterEach(() => {
      sandbox.restore();
      sinon.restore();
    });

    it('valid surveillance task dto is provided', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const surveillanceTaskDTO = {
        robisepType: robisepType.id.toString(),
        surveillanceTask: {
          emergencyPhoneNumber: "912345678",
          startingPointToWatch: startingPointToWatch.id.toString(),
          endingPointToWatch: endingPointToWatch.id.toString(),
        },
      };

      // Task state (default: REQUESTED)
      const taskState = TaskState.REQUESTED;

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(robisepType);

      // Mock roomRepo
      roomRepoMock.findByDomainId.onCall(0).resolves(startingPointToWatch);
      roomRepoMock.findByDomainId.onCall(1).resolves(endingPointToWatch);

      // Mock surveillanceTaskRepo
      surveillanceTaskRepoMock.findAll.resolves([]);

      // Mock pickUpAndDeliveryTaskRepo
      pickUpAndDeliveryTaskRepoMock.findAll.resolves([]);

      // Act
      const surveillanceTaskResult = await taskFactory.createSurveillanceTask(surveillanceTaskDTO, email);

      // Assert
      const surveillanceTask = surveillanceTaskResult.getValue();
      expect(surveillanceTask.taskState).to.equal(taskState);
      expect(surveillanceTask.robisepType).to.equal(robisepType);
      expect(surveillanceTask.emergencyPhoneNumber.value).to.equal(surveillanceTaskDTO.surveillanceTask.emergencyPhoneNumber);
    });
  });

  describe('fail to create surveillance task when', () => {
    // Create sinon sandbox for isolating tests
    const sandbox = sinon.createSandbox();

    // TaskFactory
    let taskFactory: TaskFactory;

    // Mocks
    let robisepTypeRepoMock: any;
    let roomRepoMock: any;
    let surveillanceTaskRepoMock: any;
    let pickUpAndDeliveryTaskRepoMock: any;

    // RobisepType
    let robisepType: RobisepType;

    // Rooms to watch
    let startingPointToWatch: Room;
    let endingPointToWatch: Room;

    beforeEach(() => {
      robisepType = RobisepTypeDataSource.getRobisepTypeA();

      startingPointToWatch = RoomDataSource.getFirstRoomT();

      endingPointToWatch = RoomDataSource.getSecondRoomT();

      robisepTypeRepoMock = {
        findByDomainId: sinon.stub(),
      }

      roomRepoMock = {
        findByDomainId: sinon.stub(),
      }

      surveillanceTaskRepoMock = {}

      pickUpAndDeliveryTaskRepoMock = {}

      taskFactory = new TaskFactory(robisepTypeRepoMock, roomRepoMock, surveillanceTaskRepoMock, pickUpAndDeliveryTaskRepoMock);
    });

    afterEach(() => {
      sandbox.restore();
      sinon.restore();
    });

    it('invalid surveillance task dto is provided, robisepType not found', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const robisepTypeNotFoundId = "RobisepTypeNotFound";

      const surveillanceTaskDTO = {
        robisepType: robisepTypeNotFoundId,
        surveillanceTask: {
          emergencyPhoneNumber: "912345678",
          startingPointToWatch: startingPointToWatch.id.toString(),
          endingPointToWatch: endingPointToWatch.id.toString(),
        },
      };

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(null);

      // Act
      let error = null;
      try {
        await taskFactory.createSurveillanceTask(surveillanceTaskDTO, email);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).to.be.an.instanceof(TypeError);
      expect(error.message).to.equal('RobisepType not found');
    });

    it('invalid surveillance task dto is provided, invalid emergency phone number', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const invalidEmergencyPhoneNumber = "invalidPhoneNumber";

      const surveillanceTaskDTO = {
        robisepType: robisepType.id.toString(),
        surveillanceTask: {
          emergencyPhoneNumber: invalidEmergencyPhoneNumber,
          startingPointToWatch: startingPointToWatch.id.toString(),
          endingPointToWatch: endingPointToWatch.id.toString(),
        },
      };

      const retrieveTaskCodeStub = sinon.stub(taskFactory, 'determineTaskCode');
      retrieveTaskCodeStub.returns(1);

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(robisepType);

      // Act
      let error = null;
      try {
        await taskFactory.createSurveillanceTask(surveillanceTaskDTO, email);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).to.be.an.instanceof(TypeError);
      expect(error.message).to.equal('Phone Number is not following a valid format.');
    });

    it('invalid surveillance task dto is provided, invalid task code', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const invalidTaskCode = -12;

      const surveillanceTaskDTO = {
        robisepType: robisepType.id.toString(),
        surveillanceTask: {
          emergencyPhoneNumber: "912345678",
          startingPointToWatch: startingPointToWatch.id.toString(),
          endingPointToWatch: endingPointToWatch.id.toString(),
        },
      };

      const retrieveTaskCodeStub = sinon.stub(taskFactory, 'determineTaskCode');
      retrieveTaskCodeStub.returns(invalidTaskCode);

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(robisepType);

      // Act
      let error = null;
      try {
        await taskFactory.createSurveillanceTask(surveillanceTaskDTO, email);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).to.be.an.instanceof(TypeError);
    });

    it('invalid surveillance task dto is provided, startingPointToWatch not found', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const roomNotFoundId = "RoomNotFound";

      const surveillanceTaskDTO = {
        robisepType: robisepType.id.toString(),
        surveillanceTask: {
          emergencyPhoneNumber: "912345678",
          startingPointToWatch: roomNotFoundId,
          endingPointToWatch: endingPointToWatch.id.toString(),
        },
      };

      const retrieveTaskCodeStub = sinon.stub(taskFactory, 'determineTaskCode');
      retrieveTaskCodeStub.returns(1);

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(robisepType);

      // Mock roomRepo
      roomRepoMock.findByDomainId.onCall(0).resolves(null);

      // Act
      let error = null;
      try {
        await taskFactory.createSurveillanceTask(surveillanceTaskDTO, email);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).to.be.an.instanceof(TypeError);
      expect(error.message).to.equal('Starting point to watch not found');
    });

    it('invalid surveillance task dto is provided, endingPointToWatch not found', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const roomNotFoundId = "RoomNotFound";

      const surveillanceTaskDTO = {
        robisepType: robisepType.id.toString(),
        surveillanceTask: {
          emergencyPhoneNumber: "912345678",
          startingPointToWatch: startingPointToWatch.id.toString(),
          endingPointToWatch: roomNotFoundId,
        },
      };

      const retrieveTaskCodeStub = sinon.stub(taskFactory, 'determineTaskCode');
      retrieveTaskCodeStub.returns(1);

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(robisepType);

      // Mock roomRepo
      roomRepoMock.findByDomainId.onCall(0).resolves(startingPointToWatch);
      roomRepoMock.findByDomainId.onCall(1).resolves(null);

      // Act
      let error = null;
      try {
        await taskFactory.createSurveillanceTask(surveillanceTaskDTO, email);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).to.be.an.instanceof(TypeError);
      expect(error.message).to.equal('Ending point to watch not found');
    });
  });

  describe('create pickup and delivery task when', () => {
    // Create sinon sandbox for isolating tests
    const sandbox = sinon.createSandbox();

    // TaskFactory
    let taskFactory: TaskFactory;

    // Mocks
    let robisepTypeRepoMock: any;
    let roomRepoMock: any;
    let surveillanceTaskRepoMock: any;
    let pickUpAndDeliveryTaskRepoMock: any;

    // RobisepType
    let robisepType: RobisepType;

    // Rooms
    let room1: Room;
    let room2: Room;

    beforeEach(() => {
      robisepType = RobisepTypeDataSource.getRobisepTypeA();

      room1 = RoomDataSource.getRoomA();
      room2 = RoomDataSource.getRoomProlog1();

      robisepTypeRepoMock = {
        findByDomainId: sinon.stub(),
      }

      roomRepoMock = {
        findByDomainId: sinon.stub(),
      }

      surveillanceTaskRepoMock = {}

      pickUpAndDeliveryTaskRepoMock = {}

      taskFactory = new TaskFactory(robisepTypeRepoMock, roomRepoMock, surveillanceTaskRepoMock, pickUpAndDeliveryTaskRepoMock);
    });

    afterEach(() => {
      sandbox.restore();
      sinon.restore();
    });

    it('valid surveillance task dto is provided', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const pickUpPersonContact = {
        "name": "John Doe",
        "phoneNumber": "912345678"
      }

      const deliveryPersonContact = {
        "name": "Jane Doe",
        "phoneNumber": "912543876"
      }

      const pickUpAndDeliveryTaskDTO = {
        robisepType: robisepType.id.toString(),
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: room1.id.toString(),
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: room2.id.toString(),
          description: "Pick up and delivery task description",
          confirmationCode: 123456,
        },
      };

      // Task state (default: REQUESTED)
      const taskState = TaskState.REQUESTED;

      const retrieveTaskCodeStub = sinon.stub(taskFactory, 'determineTaskCode');
      retrieveTaskCodeStub.returns(1);

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(robisepType);

      // Mock roomRepo
      roomRepoMock.findByDomainId.onCall(0).resolves(room1);
      roomRepoMock.findByDomainId.onCall(1).resolves(room2);

      // Act
      const pickUpAndDeliveryTaskResult =
        await taskFactory.createPickUpAndDeliveryTask(pickUpAndDeliveryTaskDTO, email);

      // Assert
      const pickUpAndDeliveryTask = pickUpAndDeliveryTaskResult.getValue();
      expect(pickUpAndDeliveryTask.taskState).to.equal(taskState);
      expect(pickUpAndDeliveryTask.robisepType).to.equal(robisepType);
      expect(pickUpAndDeliveryTask.pickUpPersonContact.personPersonalName.value).to.equal(pickUpPersonContact.name);
      expect(pickUpAndDeliveryTask.pickUpPersonContact.personPhoneNumber.value).to.equal(pickUpPersonContact.phoneNumber);
      expect(pickUpAndDeliveryTask.pickUpRoom).to.equal(room1);
      expect(pickUpAndDeliveryTask.deliveryPersonContact.personPersonalName.value).to.equal(deliveryPersonContact.name);
      expect(pickUpAndDeliveryTask.deliveryPersonContact.personPhoneNumber.value).to.equal(deliveryPersonContact.phoneNumber);
      expect(pickUpAndDeliveryTask.deliveryRoom).to.equal(room2);
      expect(pickUpAndDeliveryTask.description.value).to.equal(pickUpAndDeliveryTaskDTO.pickUpAndDeliveryTask.description);
      expect(pickUpAndDeliveryTask.confirmationCode.value).to.equal(pickUpAndDeliveryTaskDTO.pickUpAndDeliveryTask.confirmationCode);
    });
  });

  describe('fail to create pickup and delivery task when', () => {
    // Create sinon sandbox for isolating tests
    const sandbox = sinon.createSandbox();

    // TaskFactory
    let taskFactory: TaskFactory;

    // Mocks
    let robisepTypeRepoMock: any;
    let roomRepoMock: any;
    let surveillanceTaskRepoMock: any;
    let pickUpAndDeliveryTaskRepoMock: any;

    // RobisepType
    let robisepType: RobisepType;

    // Rooms
    let room1: Room;
    let room2: Room;

    beforeEach(() => {
      robisepType = RobisepTypeDataSource.getRobisepTypeA();

      room1 = RoomDataSource.getRoomA();
      room2 = RoomDataSource.getRoomProlog1();

      robisepTypeRepoMock = {
        findByDomainId: sinon.stub(),
      }

      roomRepoMock = {
        findByDomainId: sinon.stub(),
      }

      surveillanceTaskRepoMock = {}

      pickUpAndDeliveryTaskRepoMock = {}

      taskFactory = new TaskFactory(robisepTypeRepoMock, roomRepoMock, surveillanceTaskRepoMock, pickUpAndDeliveryTaskRepoMock);
    });

    afterEach(() => {
      sandbox.restore();
      sinon.restore();
    });

    it('invalid pickup and delivery task dto is provided, robisepType not found', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const robisepTypeNotFoundId = "RobisepTypeNotFound";

      const pickUpPersonContact = {
        "name": "John Doe",
        "phoneNumber": "912345678"
      }

      const deliveryPersonContact = {
        "name": "Jane Doe",
        "phoneNumber": "912543876"
      }

      const pickUpAndDeliveryTaskDTO = {
        robisepType: robisepTypeNotFoundId,
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: room1.id.toString(),
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: room2.id.toString(),
          description: "Pick up and delivery task description",
          confirmationCode: 123456,
        },
      };

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(null);

      // Act
      let error = null;
      try {
        await taskFactory.createPickUpAndDeliveryTask(pickUpAndDeliveryTaskDTO, email);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).to.be.an.instanceof(TypeError);
      expect(error.message).to.equal('RobisepType not found');
    });

    it('invalid pickup and delivery task dto is provided, invalid task code', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const invalidTaskCode = -12;

      const pickUpPersonContact = {
        "name": "John Doe",
        "phoneNumber": "912345678"
      }

      const deliveryPersonContact = {
        "name": "Jane Doe",
        "phoneNumber": "912543876"
      }

      const pickUpAndDeliveryTaskDTO = {
        robisepType: robisepType.id.toString(),
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: room1.id.toString(),
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: room2.id.toString(),
          description: "Pick up and delivery task description",
          confirmationCode: 123456,
        },
      };

      const retrieveTaskCodeStub = sinon.stub(taskFactory, 'determineTaskCode');
      retrieveTaskCodeStub.returns(invalidTaskCode);

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(robisepType);

      // Act
      let error = null;
      try {
        await taskFactory.createPickUpAndDeliveryTask(pickUpAndDeliveryTaskDTO, email);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).to.be.an.instanceof(TypeError);
    });

    it('invalid pickup and delivery task dto is provided, pickUpRoom not found', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const roomNotFoundId = "RoomNotFound";

      const pickUpPersonContact = {
        "name": "John Doe",
        "phoneNumber": "912345678"
      }

      const deliveryPersonContact = {
        "name": "Jane Doe",
        "phoneNumber": "912543876"
      }

      const pickUpAndDeliveryTaskDTO = {
        robisepType: robisepType.id.toString(),
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: roomNotFoundId,
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: room2.id.toString(),
          description: "Pick up and delivery task description",
          confirmationCode: 123456,
        },
      };

      const retrieveTaskCodeStub = sinon.stub(taskFactory, 'determineTaskCode');
      retrieveTaskCodeStub.returns(1);

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(robisepType);

      // Mock roomRepo
      roomRepoMock.findByDomainId.onCall(0).resolves(null);

      // Act
      let error = null;
      try {
        await taskFactory.createPickUpAndDeliveryTask(pickUpAndDeliveryTaskDTO, email);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).to.be.an.instanceof(TypeError);
      expect(error.message).to.equal('Pick Up Room not found');
    });

    it('invalid pickup and delivery task dto is provided, deliveryRoom not found', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const roomNotFoundId = "RoomNotFound";

      const pickUpPersonContact = {
        "name": "John Doe",
        "phoneNumber": "912345678"
      }

      const deliveryPersonContact = {
        "name": "Jane Doe",
        "phoneNumber": "912543876"
      }

      const pickUpAndDeliveryTaskDTO = {
        robisepType: robisepType.id.toString(),
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: room1.id.toString(),
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: roomNotFoundId,
          description: "Pick up and delivery task description",
          confirmationCode: 123456,
        },
      };

      const retrieveTaskCodeStub = sinon.stub(taskFactory, 'determineTaskCode');
      retrieveTaskCodeStub.returns(1);

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(robisepType);

      // Mock roomRepo
      roomRepoMock.findByDomainId.onCall(0).resolves(room1);
      roomRepoMock.findByDomainId.onCall(1).resolves(null);

      // Act
      let error = null;
      try {
        await taskFactory.createPickUpAndDeliveryTask(pickUpAndDeliveryTaskDTO, email);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).to.be.an.instanceof(TypeError);
      expect(error.message).to.equal('Delivery Room not found');
    });

    it('invalid pickup and delivery task dto is provided, pickUpPersonPersonalName invalid', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const invalidPickUpPersonPersonalName = "  ";

      const pickUpPersonContact = {
        "name": invalidPickUpPersonPersonalName,
        "phoneNumber": "912345678"
      }

      const deliveryPersonContact = {
        "name": "Jane Doe",
        "phoneNumber": "912543876"
      }

      const pickUpAndDeliveryTaskDTO = {
        robisepType: robisepType.id.toString(),
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: room1.id.toString(),
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: room2.id.toString(),
          description: "Pick up and delivery task description",
          confirmationCode: 123456,
        },
      };

      const retrieveTaskCodeStub = sinon.stub(taskFactory, 'determineTaskCode');
      retrieveTaskCodeStub.returns(1);

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(robisepType);

      // Mock roomRepo
      roomRepoMock.findByDomainId.onCall(0).resolves(room1);
      roomRepoMock.findByDomainId.onCall(1).resolves(room2);

      // Act
      let error = null;
      try {
        await taskFactory.createPickUpAndDeliveryTask(pickUpAndDeliveryTaskDTO, email);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).to.be.an.instanceof(TypeError);
      expect(error.message).to.equal('Personal Name only contains whitespace.');
    });

    it('invalid pickup and delivery task dto is provided, pickUpPersonPhoneNumber invalid', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const invalidPickUpPersonPhoneNumber = "invalidPhoneNumber";

      const pickUpPersonContact = {
        "name": "John Doe",
        "phoneNumber": invalidPickUpPersonPhoneNumber
      }

      const deliveryPersonContact = {
        "name": "Jane Doe",
        "phoneNumber": "912543876"
      }

      const pickUpAndDeliveryTaskDTO = {
        robisepType: robisepType.id.toString(),
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: room1.id.toString(),
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: room2.id.toString(),
          description: "Pick up and delivery task description",
          confirmationCode: 123456,
        },
      };

      const retrieveTaskCodeStub = sinon.stub(taskFactory, 'determineTaskCode');
      retrieveTaskCodeStub.returns(1);

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(robisepType);

      // Mock roomRepo
      roomRepoMock.findByDomainId.onCall(0).resolves(room1);
      roomRepoMock.findByDomainId.onCall(1).resolves(room2);

      // Act
      let error = null;
      try {
        await taskFactory.createPickUpAndDeliveryTask(pickUpAndDeliveryTaskDTO, email);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).to.be.an.instanceof(TypeError);
      expect(error.message).to.equal('Phone Number is not following a valid format.');
    });

    it('invalid pickup and delivery task dto is provided, deliveryPersonPersonalName invalid', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const invalidDeliveryPersonPersonalName = "  ";

      const pickUpPersonContact = {
        "name": "John Doe",
        "phoneNumber": "912345678"
      }

      const deliveryPersonContact = {
        "name": invalidDeliveryPersonPersonalName,
        "phoneNumber": "912543876"
      }

      const pickUpAndDeliveryTaskDTO = {
        robisepType: robisepType.id.toString(),
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: room1.id.toString(),
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: room2.id.toString(),
          description: "Pick up and delivery task description",
          confirmationCode: 123456,
        },
      };

      const retrieveTaskCodeStub = sinon.stub(taskFactory, 'determineTaskCode');
      retrieveTaskCodeStub.returns(1);

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(robisepType);

      // Mock roomRepo
      roomRepoMock.findByDomainId.onCall(0).resolves(room1);
      roomRepoMock.findByDomainId.onCall(1).resolves(room2);

      // Act
      let error = null;
      try {
        await taskFactory.createPickUpAndDeliveryTask(pickUpAndDeliveryTaskDTO, email);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).to.be.an.instanceof(TypeError);
      expect(error.message).to.equal('Personal Name only contains whitespace.');
    });

    it('invalid pickup and delivery task dto is provided, deliveryPersonPhoneNumber invalid', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const invalidDeliveryPersonPhoneNumber = "invalidPhoneNumber";

      const pickUpPersonContact = {
        "name": "John Doe",
        "phoneNumber": "912345678"
      }

      const deliveryPersonContact = {
        "name": "Jane Doe",
        "phoneNumber": invalidDeliveryPersonPhoneNumber
      }

      const pickUpAndDeliveryTaskDTO = {
        robisepType: robisepType.id.toString(),
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: room1.id.toString(),
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: room2.id.toString(),
          description: "Pick up and delivery task description",
          confirmationCode: 123456,
        },
      };

      const retrieveTaskCodeStub = sinon.stub(taskFactory, 'determineTaskCode');
      retrieveTaskCodeStub.returns(1);

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(robisepType);

      // Mock roomRepo
      roomRepoMock.findByDomainId.onCall(0).resolves(room1);
      roomRepoMock.findByDomainId.onCall(1).resolves(room2);

      // Act
      let error = null;
      try {
        await taskFactory.createPickUpAndDeliveryTask(pickUpAndDeliveryTaskDTO, email);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).to.be.an.instanceof(TypeError);
      expect(error.message).to.equal('Phone Number is not following a valid format.');
    });

    it('invalid pickup and delivery task dto is provided, description invalid', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const invalidDescription = "  ";

      const pickUpPersonContact = {
        "name": "John Doe",
        "phoneNumber": "912345678"
      }

      const deliveryPersonContact = {
        "name": "Jane Doe",
        "phoneNumber": "912543876"
      }

      const pickUpAndDeliveryTaskDTO = {
        robisepType: robisepType.id.toString(),
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: room1.id.toString(),
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: room2.id.toString(),
          description: invalidDescription,
          confirmationCode: 123456,
        },
      };

      const retrieveTaskCodeStub = sinon.stub(taskFactory, 'determineTaskCode');
      retrieveTaskCodeStub.returns(1);

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(robisepType);

      // Mock roomRepo
      roomRepoMock.findByDomainId.onCall(0).resolves(room1);
      roomRepoMock.findByDomainId.onCall(1).resolves(room2);

      // Act
      let error = null;
      try {
        await taskFactory.createPickUpAndDeliveryTask(pickUpAndDeliveryTaskDTO, email);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).to.be.an.instanceof(TypeError);
      expect(error.message).to.equal('Pick up and delivery task description only contains whitespace.');
    });

    it('invalid pickup and delivery task dto is provided, confirmation code invalid', async () => {
      // Arrange
      const email = "1211@isep.ipp.pt";

      const invalidConfirmationCode = "invalidConfirmationCode";

      const pickUpPersonContact = {
        "name": "John Doe",
        "phoneNumber": "912345678"
      }

      const deliveryPersonContact = {
        "name": "Jane Doe",
        "phoneNumber": "912543876"
      }

      const pickUpAndDeliveryTaskDTO = {
        robisepType: robisepType.id.toString(),
        pickUpAndDeliveryTask: {
          pickUpPersonContact: pickUpPersonContact,
          pickUpRoom: room1.id.toString(),
          deliveryPersonContact: deliveryPersonContact,
          deliveryRoom: room2.id.toString(),
          description: "Pick up and delivery task description",
          confirmationCode: invalidConfirmationCode,
        },
      };

      const retrieveTaskCodeStub = sinon.stub(taskFactory, 'determineTaskCode');
      retrieveTaskCodeStub.returns(1);

      // Mock robisepTypeRepo
      robisepTypeRepoMock.findByDomainId.resolves(robisepType);

      // Mock roomRepo
      roomRepoMock.findByDomainId.onCall(0).resolves(room1);
      roomRepoMock.findByDomainId.onCall(1).resolves(room2);

      // Act
      let error = null;
      try {
        await taskFactory.createPickUpAndDeliveryTask(pickUpAndDeliveryTaskDTO, email);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).to.be.an.instanceof(TypeError);
      expect(error.message).to.equal('Pick up and delivery task confirmation code is not a number.');
    });
  });
});