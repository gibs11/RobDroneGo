import 'reflect-metadata';
import * as sinon from 'sinon';
import { Request, Response } from 'express';
import { Container } from 'typedi';
import { FailureType, Result } from '../../src/core/logic/Result';
import config from '../../config';
import RobisepController from '../../src/controllers/robisepController';
import IRobisepService from '../../src/services/IServices/IRobisepService';
import { Robisep } from '../../src/domain/robisep/Robisep';
import { RobisepNickname } from '../../src/domain/robisep/RobisepNickname';
import { RobisepSerialNumber } from '../../src/domain/robisep/RobisepSerialNumber';
import { RobisepCode } from '../../src/domain/robisep/RobisepCode';
import { RobisepDescription } from '../../src/domain/robisep/RobisepDescription';
import { RobisepType } from '../../src/domain/robisepType/RobisepType';
import { RobisepTypeDesignation } from '../../src/domain/robisepType/RobisepTypeDesignation';
import { RobisepTypeBrand } from '../../src/domain/robisepType/RobisepTypeBrand';
import { RobisepTypeModel } from '../../src/domain/robisepType/RobisepTypeModel';
import { TaskType } from '../../src/domain/common/TaskType';
import { UniqueEntityID } from '../../src/core/domain/UniqueEntityID';
import IRobisepOutDTO from '../../src/dto/out/IRobisepOutDTO';
import RobisepDataSource from '../datasource/RobisepDataSource';
import { RobisepState } from '../../src/domain/robisep/RobisepState';
import { RobisepTypeMap } from '../../src/mappers/RobisepTypeMap';
import { Room } from '../../src/domain/room/Room';
import RoomDataSource from '../datasource/RoomDataSource';
import { RoomMap } from '../../src/mappers/RoomMap';

describe('RobisepController', function() {
  const sandbox = sinon.createSandbox();
  let loggerMock;
  let robisepRepoMock;
  let robisepTypeRepoMock;
  let robisepTypeMock: RobisepType;
  let roomMock: Room;
  let robisepFactory;

  describe('createRobisep', function() {
    beforeEach(function() {
      robisepTypeMock = RobisepType.create(
        {
          designation: RobisepTypeDesignation.create('robot').getValue(),
          brand: RobisepTypeBrand.create('brand').getValue(),
          model: RobisepTypeModel.create('model').getValue(),
          tasksType: [TaskType.TRANSPORT],
        },
        new UniqueEntityID('123'),
      ).getValue();

      roomMock = RoomDataSource.getFirstRoomT();

      Container.reset();
      loggerMock = {
        error: sinon.stub(),
      };
      Container.set('logger', loggerMock);

      robisepRepoMock = {
        save: sinon.stub(),
        findByDomainId: sinon.stub(),
        findByNickname: sinon.stub(),
        findByCode: sinon.stub(),
        findARobisepTypeWithSameSerialNumber: sinon.stub(),
      };
      Container.set(config.repos.robisep.name, robisepRepoMock);

      robisepTypeRepoMock = {
        findByDomainId: sinon.stub(),
      };
      Container.set(config.repos.robisepType.name, robisepTypeRepoMock);

      const robisepTypeSchemaMock = require('../../src/persistence/schemas/robisepTypeSchema').default;
      Container.set('robisepTypeSchema', robisepTypeSchemaMock);

      robisepFactory = {
        createRobisep: sinon.stub(),
      };
      Container.set(config.factories.robisep.name, robisepFactory);

      const robisepServiceClass = require('../../src/services/ServicesImpl/robisepService').default;
      const robisepServiceInstance = Container.get(robisepServiceClass);
      Container.set(config.services.robisep.name, robisepServiceInstance);
    });

    afterEach(function() {
      sandbox.restore();
      sinon.restore();
    });

    it('RobisepController unit test using RobisepService stub', async function() {
      // Arrange
      const requestBody = {
        nickname: 'robot2',
        serialNumber: '123456789',
        code: '123',
        description: 'description',
        robisepTypeId: '123',
        roomId: '123',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const robisepServiceInstance = Container.get(config.services.robisep.name);

      // Stub the createRobisep method in the RobisepService
      robisepRepoMock.findByNickname.resolves(null);
      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      robisepRepoMock.findByCode.resolves(null);
      robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves(null);
      sinon.stub(robisepServiceInstance, 'createRobisep').returns(
        Result.ok<IRobisepOutDTO>({
          domainId: '123',
          nickname: 'robot2',
          serialNumber: '123456789',
          code: '123',
          description: 'something',
          robisepType: RobisepTypeMap.toDTO(robisepTypeMock),
          room: RoomMap.toDTO(roomMock),
        }),
      );

      const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

      // Act
      await ctrl.createRobisep(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match({
          domainId: '123',
          nickname: 'robot2',
          serialNumber: '123456789',
          code: '123',
          description: 'something',
          robisepType: RobisepTypeMap.toDTO(robisepTypeMock),
        }),
      );
    });

    it('RobisepController + RobisepService integration test', async function() {
      // Arrange
      const requestBody = {
        nickname: 'robot2',
        serialNumber: '123456',
        code: '123',
        description: 'description',
        robisepTypeId: '123',
        roomId: '123',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      robisepRepoMock.findByNickname.resolves(null);
      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      robisepRepoMock.findByCode.resolves(null);
      robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves(null);
      const robisepInstance = Robisep.create({
        nickname: RobisepNickname.create(requestBody.nickname).getValue(),
        serialNumber: RobisepSerialNumber.create(requestBody.serialNumber).getValue(),
        code: RobisepCode.create(requestBody.code).getValue(),
        description: RobisepDescription.create(requestBody.description).getValue(),
        robisepType: robisepTypeMock,
        state: RobisepState.ACTIVE,
        roomId: roomMock,
      }).getValue();
      robisepFactory.createRobisep.resolves(robisepInstance);
      robisepRepoMock.save.resolves(robisepInstance);

      const robisepServiceInstance = Container.get(config.services.robisep.name);

      const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

      // Act
      await ctrl.createRobisep(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match({
          nickname: requestBody.nickname,
          serialNumber: requestBody.serialNumber,
          code: requestBody.code,
          description: requestBody.description,
          robisepType: RobisepTypeMap.toDTO(robisepTypeMock),
        }),
      );
    });

    it('RobisepController should return 400 if nickname is not alphanumeric', async function() {
      // Arrange
      const requestBody = {
        nickname: 'robot2_',
        serialNumber: '123456789',
        code: '123',
        description: 'description',
        robisepTypeId: '123',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      robisepFactory.createRobisep.throws(new TypeError('Designation must be alphanumeric.'));
      robisepRepoMock.findByNickname.resolves(null);
      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      robisepRepoMock.findByCode.resolves(null);
      robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves(null);

      const robisepServiceInstance = Container.get(config.services.robisep.name);

      const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

      // Act
      await ctrl.createRobisep(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({ message: 'Designation must be alphanumeric.' }));
    });

    it('RobisepController should return 400 if nickname is too long', async function() {
      // Arrange
      const requestBody = {
        nickname: 'robiseplkjasdflkjasdflkjsdflkjadsflkjsadfkljsadfkljasdfkl',
        serialNumber: '123456789',
        code: '123',
        description: 'description',
        robisepTypeId: '123',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      robisepFactory.createRobisep.throws(new TypeError('Nickname is not within range 1 to 30.'));
      robisepRepoMock.findByNickname.resolves(null);
      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      robisepRepoMock.findByCode.resolves(null);
      robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves(null);

      const robisepServiceInstance = Container.get(config.services.robisep.name);

      const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

      // Act
      await ctrl.createRobisep(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({ message: 'Nickname is not within range 1 to 30.' }));
    });

    it('RobisepController should return 400 if serialNumber is not alphanumeric', async function() {
      // Arrange
      const requestBody = {
        nickname: 'robot2',
        serialNumber: 'serial_f',
        code: '123',
        description: 'description',
        robisepTypeId: '123',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      robisepFactory.createRobisep.throws(new TypeError('Serial Number must be alphanumeric.'));

      const robisepServiceInstance = Container.get(config.services.robisep.name);

      const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

      // Act
      await ctrl.createRobisep(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({ message: 'Serial Number must be alphanumeric.' }));
    });

    it('RobisepController should return 400 if serialNumber is too long', async function() {
      // Arrange
      const requestBody = {
        nickname: 'robot2',
        serialNumber: '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
        code: '123',
        description: 'description',
        robisepTypeId: '123',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      robisepFactory.createRobisep.throws(new TypeError('SerialNumber is not within range 1 to 50.'));

      const robisepServiceInstance = Container.get(config.services.robisep.name);

      const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

      // Act
      await ctrl.createRobisep(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({ message: 'SerialNumber is not within range 1 to 50.' }));
    });

    it('RobisepController should return 400 if code is not alphanumeric', async function() {
      // Arrange
      const requestBody = {
        nickname: 'robot2',
        serialNumber: '123456789',
        code: 'code_f',
        description: 'description',
        robisepTypeId: '123',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      robisepFactory.createRobisep.throws(new TypeError('Code must be alphanumeric.'));

      const robisepServiceInstance = Container.get(config.services.robisep.name);

      const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

      // Act
      await ctrl.createRobisep(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({ message: 'Code must be alphanumeric.' }));
    });

    it('RobisepController should return 400 if code is too long', async function() {
      // Arrange
      const requestBody = {
        nickname: 'robot2',
        serialNumber: '123456789',
        code: '123456789123456789123456789123456789123456789123456789123456789123456789123456789',
        description: 'description',
        robisepTypeId: '123',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      robisepFactory.createRobisep.throws(new TypeError('Code is not within range 1 to 30.'));

      const robisepServiceInstance = Container.get(config.services.robisep.name);

      const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

      // Act
      await ctrl.createRobisep(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({ message: 'Code is not within range 1 to 30.' }));
    });

    it('RobisepController should return 400 if description is not alphanumeric', async function() {
      // Arrange
      const requestBody = {
        nickname: 'robot2',
        serialNumber: '123456789',
        code: '123',
        description: 'description_f',
        robisepTypeId: '123',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      robisepFactory.createRobisep.throws(new TypeError('Designation must be alphanumeric.'));

      const robisepServiceInstance = Container.get(config.services.robisep.name);

      const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

      // Act
      await ctrl.createRobisep(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({ message: 'Designation must be alphanumeric.' }));
    });

    it('RobisepController should return 400 if description is too long', async function() {
      // Arrange
      const requestBody = {
        nickname: 'robot2',
        serialNumber: '123456789',
        code: '123',
        description:
          'way to long model name that is not valid, in order to be to long I will repeat this sentence until it is long enough' +
          'however, this is not enough, I will add some more words to make sure it is long enough, but I am not sure if it is enough, so I will if necessary add some more words',
        robisepTypeId: '123',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      robisepFactory.createRobisep.throws(new TypeError('Designation is not within range 1 to 250.'));

      const robisepServiceInstance = Container.get(config.services.robisep.name);

      const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

      // Act
      await ctrl.createRobisep(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({ message: 'Designation is not within range 1 to 250.' }));
    });

    it('RobisepController should return 404 if robisepTypeId is does not exist', async function() {
      // Arrange
      const requestBody = {
        nickname: 'robot2',
        serialNumber: '123456789',
        code: '123',
        description: 'description',
        robisepTypeId: '123',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      robisepTypeRepoMock.findByDomainId.resolves(null);
      robisepFactory.createRobisep.throws(new ReferenceError('RobisepType not found.'));

      const robisepServiceInstance = Container.get(config.services.robisep.name);

      const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

      // Act
      await ctrl.createRobisep(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({ message: 'RobisepType not found.' }));
    });

    it('RobisepController should return 409 if robisep with same domainId already exists', async function() {
      // Arrange
      const requestBody = {
        domainId: '123456789',
        nickname: 'robot2',
        serialNumber: '123456789',
        code: '123',
        description: 'description',
        robisepTypeId: '123',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      robisepRepoMock.findByDomainId.resolves({});
      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      robisepRepoMock.findByCode.resolves({});

      const robisepServiceInstance = Container.get(config.services.robisep.name);

      const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

      // Act
      await ctrl.createRobisep(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 409);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({ message: 'Robisep already exists - domainId must be unique.' }));
    });

    it('RobisepController should return 409 if robisep with same code already exists', async function() {
      // Arrange
      const requestBody = {
        nickname: 'robot2',
        serialNumber: '123456789',
        code: '123',
        description: 'description',
        robisepTypeId: '123',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      robisepRepoMock.findByCode.resolves({});

      const robisepServiceInstance = Container.get(config.services.robisep.name);

      const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

      // Act
      await ctrl.createRobisep(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 409);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({ message: 'Code already exists.' }));
    });

    it('RobisepController should return 409 if robisep with same serialNumber already exists within the same type', async function() {
      // Arrange
      const requestBody = {
        nickname: 'robot2',
        serialNumber: '123456789',
        code: '123',
        description: 'description',
        robisepTypeId: '123',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      robisepRepoMock.findByCode.resolves(null);
      robisepRepoMock.findByNickname.resolves(null);
      robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves({});

      robisepRepoMock.save.rejects(new Error('error'));

      const robisepServiceInstance = Container.get(config.services.robisep.name);

      const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

      // Act
      await ctrl.createRobisep(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 409);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(
        res.send,
        sinon.match({ message: 'Serial number already exists for this robisep type.' }),
      );
    });

    it('Save method should fail and throw an error', async function() {
      // Arrange
      const requestBody = {
        nickname: 'robot2',
        serialNumber: '123456789',
        code: '123',
        description: 'description',
        robisepTypeId: '123',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      robisepFactory.createRobisep.throws(new TypeError('error.'));
      robisepRepoMock.findByCode.resolves(null);
      robisepRepoMock.findByNickname.resolves(null);
      robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves(null);
      const robisepInstance = Robisep.create({
        nickname: RobisepNickname.create(requestBody.nickname).getValue(),
        serialNumber: RobisepSerialNumber.create(requestBody.serialNumber).getValue(),
        code: RobisepCode.create(requestBody.code).getValue(),
        description: RobisepDescription.create(requestBody.description).getValue(),
        robisepType: robisepTypeMock,
        state: RobisepState.ACTIVE,
        roomId: roomMock,
      }).getValue();
      robisepFactory.createRobisep.resolves(robisepInstance);

      robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);
      robisepRepoMock.save.rejects(new SyntaxError('error.'));

      const robisepServiceInstance = Container.get(config.services.robisep.name);

      const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

      // Act
      await ctrl.createRobisep(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 503);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({ message: 'error.' }));
    });

    it('Robisep Controller should return 401 when user is not authorized', async () => {
      // Arrange
      const requestBody = {
        nickname: 'robot2',
        serialNumber: '123456789',
        code: '123',
        description: 'description',
        robisepTypeId: '123',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      robisepFactory.createRobisep.throws(new Error('error.'));
      robisepRepoMock.findByCode.resolves(null);
      robisepRepoMock.findByNickname.resolves(null);

      const robisepServiceInstance = Container.get(config.services.robisep.name);

      // Force the service to throw an error
      sinon
        .stub(robisepServiceInstance, 'createRobisep')
        .throws(new Error('You are not authorized to perform this action'));

      const controller = new RobisepController(robisepServiceInstance as IRobisepService);

      // Act
      await controller.createRobisep(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
    });
  });

  describe('listRobiseps', function() {
    describe('List All Robiseps', function() {
      beforeEach(function() {
        Container.reset();
        loggerMock = {
          error: sinon.stub(),
        };
        Container.set('logger', loggerMock);

        robisepRepoMock = {
          findAll: sinon.stub(),
        };
        Container.set(config.repos.robisep.name, robisepRepoMock);

        robisepTypeRepoMock = {
          findByDomainId: sinon.stub(),
        };
        Container.set(config.repos.robisepType.name, robisepTypeRepoMock);

        robisepFactory = {
          createRobisep: sinon.stub(),
        };
        Container.set(config.factories.robisep.name, robisepFactory);

        const robisepServiceClass = require('../../src/services/ServicesImpl/robisepService').default;
        const robisepServiceInstance = Container.get(robisepServiceClass);
        Container.set(config.services.robisep.name, robisepServiceInstance);
      });

      afterEach(function() {
        sandbox.restore();
      });

      it('RobisepController unit test using RobisepService stub', async function() {
        // Arrange
        const res: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy(),
        };

        const robisepServiceInstance = Container.get(config.services.robisep.name);

        // Stub the createRobisep method in the RobisepService
        sinon
          .stub(robisepServiceInstance, 'listRobiseps')
          .returns([
            RobisepDataSource.getRobisepADTO(),
            RobisepDataSource.getRobisepBDTO(),
            RobisepDataSource.getRobisepCDTO(),
          ]);

        const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

        // Act
        await ctrl.listRobiseps(<Response>res);

        // Assert
        sinon.assert.calledOnce(res.json);
        sinon.assert.calledWith(
          res.json,
          sinon.match([
            RobisepDataSource.getRobisepADTO(),
            RobisepDataSource.getRobisepBDTO(),
            RobisepDataSource.getRobisepCDTO(),
          ]),
        );
      });

      it('RobisepController + RobisepService integration test', async function() {
        // Arrange
        const res: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy(),
        };

        // Stub repo methods
        robisepRepoMock.findAll.resolves([
          RobisepDataSource.getRobisepA(),
          RobisepDataSource.getRobisepB(),
          RobisepDataSource.getRobisepC(),
        ]);
        const robisepServiceInstance = Container.get(config.services.robisep.name);
        const robisepServiceSpy = sinon.spy(robisepServiceInstance, 'listRobiseps');

        const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

        // Act
        await ctrl.listRobiseps(<Response>res);

        // Assert
        sinon.assert.calledOnce(res.json);
        sinon.assert.calledWith(
          res.json,
          sinon.match([
            RobisepDataSource.getRobisepADTO(),
            RobisepDataSource.getRobisepBDTO(),
            RobisepDataSource.getRobisepCDTO(),
          ]),
        );
        sinon.assert.calledOnce(robisepServiceSpy);
      });

      it('RobisepController should return 200 if no robiseps are found', async function() {
        // Arrange
        const res: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy(),
        };

        // Stub repo methods
        robisepRepoMock.findAll.resolves([]);
        const robisepServiceInstance = Container.get(config.services.robisep.name);

        const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

        // Act
        await ctrl.listRobiseps(<Response>res);

        // Assert
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 200);
      });

      it('RobisepController should return 503 - save throws error', async function() {
        // Arrange
        const res: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy(),
        };

        // Stub repo methods
        robisepRepoMock.findAll.rejects(new Error('error.'));

        const robisepServiceInstance = Container.get(config.services.robisep.name);

        const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

        // Act
        await ctrl.listRobiseps(<Response>res);

        // Assert
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 503);
        sinon.assert.calledOnce(res.send);
        sinon.assert.calledWith(res.send, `error.`);
      });
    });

    describe('List Robiseps Nickname or by task type', function() {
      beforeEach(function() {
        Container.reset();
        loggerMock = {
          error: sinon.stub(),
        };
        Container.set('logger', loggerMock);

        robisepRepoMock = {
          findByNickname: sinon.stub(),
          findByTaskType: sinon.stub(),
          save: sinon.stub(),
        };
        Container.set(config.repos.robisep.name, robisepRepoMock);

        robisepTypeRepoMock = {
          findByDomainId: sinon.stub(),
        };
        Container.set(config.repos.robisepType.name, robisepTypeRepoMock);

        robisepFactory = {
          createRobisep: sinon.stub(),
        };
        Container.set(config.factories.robisep.name, robisepFactory);

        const robisepServiceClass = require('../../src/services/ServicesImpl/robisepService').default;
        const robisepServiceInstance = Container.get(robisepServiceClass);
        Container.set(config.services.robisep.name, robisepServiceInstance);
      });

      afterEach(function() {
        sandbox.restore();
      });

      it('RobisepController unit test using RobisepService stub', async function() {
        // Arrange
        const res: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy(),
        };
        const req: Partial<Request> = {
          query: {
            nickname: 'Robisep A',
            taskType: 'SURVEILLANCE,TRANSPORT',
          },
        };

        const robisepServiceInstance = Container.get(config.services.robisep.name);
        // Should return a Result<IRobisepOutDTO[]>
        sinon
          .stub(robisepServiceInstance, 'listRobisepsByNicknameOrTaskType')
          .returns(
            Result.ok([
              RobisepDataSource.getRobisepADTO(),
              RobisepDataSource.getRobisepBDTO(),
              RobisepDataSource.getRobisepCDTO(),
            ]),
          );

        const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

        // Act
        await ctrl.listRobisepsByNicknameOrTaskType(<Request>req, <Response>res);

        // Assert
        sinon.assert.calledOnce(res.json);
        sinon.assert.calledWith(
          res.json,
          sinon.match([
            RobisepDataSource.getRobisepADTO(),
            RobisepDataSource.getRobisepBDTO(),
            RobisepDataSource.getRobisepCDTO(),
          ]),
        );
      });

      it('RobisepController + RobisepService integration test - with nickname', async function() {
        // Arrange
        const res: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy(),
        };
        const req: Partial<Request> = {
          query: {
            nickname: 'Robisep A',
            taskType: null,
          },
        };

        // Stub repo methods
        robisepRepoMock.findByNickname.resolves([RobisepDataSource.getRobisepA()]);
        const robisepServiceInstance = Container.get(config.services.robisep.name);

        const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

        // Act
        await ctrl.listRobisepsByNicknameOrTaskType(<Request>req, <Response>res);

        // Assert
        sinon.assert.calledOnce(res.json);
        sinon.assert.calledWith(res.json, sinon.match([RobisepDataSource.getRobisepADTO()]));
      });

      it('RobisepController + RobisepService integration test - with taskType', async function() {
        // Arrange
        const res: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy(),
        };
        const req: Partial<Request> = {
          query: {
            nickname: null,
            taskType: 'SURVEILLANCE,TRANSPORT',
          },
        };

        // Stub repo methods
        robisepRepoMock.findByTaskType.resolves([
          RobisepDataSource.getRobisepA(),
          RobisepDataSource.getRobisepB(),
          RobisepDataSource.getRobisepC(),
        ]);
        const robisepServiceInstance = Container.get(config.services.robisep.name);

        const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

        // Act
        await ctrl.listRobisepsByNicknameOrTaskType(<Request>req, <Response>res);

        // Assert
        sinon.assert.calledOnce(res.json);
        sinon.assert.calledWith(
          res.json,
          sinon.match([
            RobisepDataSource.getRobisepADTO(),
            RobisepDataSource.getRobisepBDTO(),
            RobisepDataSource.getRobisepCDTO(),
          ]),
        );
      });

      it('RobisepController should return 400 - non existing taskType', async function() {
        // Arrange
        const res: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy(),
        };
        const req: Partial<Request> = {
          query: {
            nickname: null,
            taskType: 'non existing taskType',
          },
        };

        // Stub repo methods
        robisepRepoMock.findByTaskType.resolves([]);

        const robisepServiceInstance = Container.get(config.services.robisep.name);

        const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

        // Act
        await ctrl.listRobisepsByNicknameOrTaskType(<Request>req, <Response>res);

        // Assert
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 400);
        sinon.assert.calledOnce(res.send);
        sinon.assert.calledWith(
          res.send,
          sinon.stub({
            message: `Invalid tasksType provided - NON EXISTING TASKTYPE. Valid values are: SURVEILLANCE, TRANSPORT`,
          }),
        );
      });

      it('RobisepController should return 400 - both nickname and taskType not provided', async function() {
        // Arrange
        const res: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy(),
        };
        const req: Partial<Request> = {
          query: {
            nickname: null,
            taskType: null,
          },
        };

        const robisepServiceInstance = Container.get(config.services.robisep.name);

        const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

        // Act
        await ctrl.listRobisepsByNicknameOrTaskType(<Request>req, <Response>res);

        // Assert
        // Assert
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 400);
        sinon.assert.calledOnce(res.send);
        sinon.assert.calledWith(res.send, sinon.match({ message: `Nickname or one taskType are required.` }));
      });

      it('RobisepController should return 400 - both nickname and taskType provided', async function() {
        // Arrange
        const res: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy(),
        };
        const req: Partial<Request> = {
          query: {
            nickname: 'nickanme',
            taskType: 'non existing taskType',
          },
        };

        const robisepServiceInstance = Container.get(config.services.robisep.name);

        const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

        // Act
        await ctrl.listRobisepsByNicknameOrTaskType(<Request>req, <Response>res);

        // Assert
        // Assert
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 400);
        sinon.assert.calledOnce(res.send);
        sinon.assert.calledWith(res.send, sinon.match({ message: `Nickname and taskType are mutually exclusive.` }));
      });

      it('RobisepController should return 200 - empty list', async function() {
        // Arrange
        const res: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy(),
        };
        const req: Partial<Request> = {
          query: {
            nickname: 'nickanme',
            taskType: null,
          },
        };

        // Stub repo methods
        robisepRepoMock.findByNickname.resolves([]);

        const robisepServiceInstance = Container.get(config.services.robisep.name);

        const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

        // Act
        await ctrl.listRobisepsByNicknameOrTaskType(<Request>req, <Response>res);

        // Assert
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 200);
      });

      it('RobisepController should return 503 - save throws error', async function() {
        // Arrange
        const res: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy(),
        };
        const req: Partial<Request> = {
          query: {
            nickname: 'nickanme',
            taskType: null,
          },
        };

        // Stub repo methods
        robisepRepoMock.findByNickname.rejects(new Error('error.'));

        const robisepServiceInstance = Container.get(config.services.robisep.name);

        const ctrl = new RobisepController(robisepServiceInstance as IRobisepService);

        // Act
        await ctrl.listRobisepsByNicknameOrTaskType(<Request>req, <Response>res);

        // Assert
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 503);
        sinon.assert.calledOnce(res.send);
        sinon.assert.calledWith(res.send, `error.`);
      });
    });
  });

  describe('disableRobisep', function() {
    beforeEach(function() {
      robisepTypeMock = RobisepType.create(
        {
          designation: RobisepTypeDesignation.create('robot').getValue(),
          brand: RobisepTypeBrand.create('brand').getValue(),
          model: RobisepTypeModel.create('model').getValue(),
          tasksType: [TaskType.TRANSPORT],
        },
        new UniqueEntityID('123'),
      ).getValue();

      Container.reset();
      loggerMock = {
        error: sinon.stub(),
      };
      Container.set('logger', loggerMock);

      robisepRepoMock = {
        save: sinon.stub(),
        findByDomainId: sinon.stub(),
      };
      Container.set(config.repos.robisep.name, robisepRepoMock);

      robisepTypeRepoMock = {
        findByDomainId: sinon.stub(),
      };
      Container.set(config.repos.robisepType.name, robisepTypeRepoMock);

      const robisepTypeSchemaMock = require('../../src/persistence/schemas/robisepTypeSchema').default;
      Container.set('robisepTypeSchema', robisepTypeSchemaMock);

      robisepFactory = {
        createRobisep: sinon.stub(),
      };
      Container.set(config.factories.robisep.name, robisepFactory);

      const robisepServiceClass = require('../../src/services/ServicesImpl/robisepService').default;
      const robisepServiceInstance = Container.get(robisepServiceClass);
      Container.set(config.services.robisep.name, robisepServiceInstance);
    });

    afterEach(function() {
      sandbox.restore();
    });

    describe('is successful', function() {
      it('in unit test using RobisepService stub', async function() {
        const requestBody = {
          state: RobisepState.INACTIVE,
        };

        const request: Partial<Request> = {
          body: requestBody,
        };
        const robisepId = '123';
        request.params = { id: robisepId };

        const response: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy(),
        };

        const robisepServiceInstance = Container.get(config.services.robisep.name);

        // Stub the createRobisep method in the RobisepService
        sinon.stub(robisepServiceInstance, 'disableRobisep').returns(
          Result.ok<IRobisepOutDTO>({
            domainId: '123',
            nickname: 'robot2',
            serialNumber: '123456789',
            code: '123',
            description: 'something',
            robisepType: RobisepTypeMap.toDTO(robisepTypeMock),
            state: RobisepState.INACTIVE,
            room: RoomMap.toDTO(roomMock),
          }),
        );

        const controller = new RobisepController(robisepServiceInstance as IRobisepService);

        // Act
        await controller.disableRobisep(<Request>request, <Response>response);

        // Assert
        sinon.assert.calledOnce(response.json);
        sinon.assert.calledWith(
          response.json,
          sinon.match({
            domainId: '123',
            nickname: 'robot2',
            serialNumber: '123456789',
            code: '123',
            description: 'something',
            robisepType: RobisepTypeMap.toDTO(robisepTypeMock),
            state: RobisepState.INACTIVE,
          }),
        );
      });

      describe('in integration test', function() {
        it('with a valid request', async function() {
          // Arrange
          const requestBody = {
            state: RobisepState.INACTIVE,
          };

          const request: Partial<Request> = {
            body: requestBody,
          };

          const robisepId = '123';
          request.params = { id: robisepId };

          const response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          const robisep = Robisep.create(
            {
              nickname: RobisepNickname.create('robot2').getValue(),
              serialNumber: RobisepSerialNumber.create('123456789').getValue(),
              code: RobisepCode.create('123').getValue(),
              description: RobisepDescription.create('something').getValue(),
              robisepType: robisepTypeMock,
              state: RobisepState.ACTIVE,
              roomId: roomMock,
            },
            new UniqueEntityID(robisepId),
          ).getValue();

          const robisepNickname = 'robot2';
          const robisepSerialNumber = '123456789';
          const robisepCode = '123';
          const robisepDescription = 'something';

          // Stub repo methods
          robisepRepoMock.findByDomainId.resolves(robisep);
          //robisepRepoMock.save.resolves(robisep);

          const robisepServiceInstance = Container.get(config.services.robisep.name);

          const controller = new RobisepController(robisepServiceInstance as IRobisepService);

          // Act
          await controller.disableRobisep(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.json);
          sinon.assert.calledWith(
            response.json,
            sinon.match({
              domainId: robisepId,
              nickname: robisepNickname,
              serialNumber: robisepSerialNumber,
              code: robisepCode,
              description: robisepDescription,
              robisepType: RobisepTypeMap.toDTO(robisepTypeMock),
              state: RobisepState.INACTIVE,
            }),
          );
        });
      });
    });

    describe('is failure', function() {
      describe('in unit test', function() {
        it('where service returns failure because robisep does not exist', async function() {
          // Arrange
          const requestBody = {
            state: RobisepState.INACTIVE,
          };

          const request: Partial<Request> = {
            body: requestBody,
          };
          const robisepId = '123';
          request.params = { id: robisepId };

          const response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          const robisepServiceInstance = Container.get(config.services.robisep.name);

          // Stub the createRobisep method in the RobisepService
          sinon
            .stub(robisepServiceInstance, 'disableRobisep')
            .returns(
              Result.fail<IRobisepOutDTO>(`No robisep found with id=${robisepId}`, FailureType.EntityDoesNotExist),
            );

          const controller = new RobisepController(robisepServiceInstance as IRobisepService);

          // Act
          await controller.disableRobisep(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 404);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send, sinon.match({ message: `No robisep found with id=${robisepId}` }));
        });

        it('where service returns failure because robisep is already disabled', async function() {
          // Arrange
          const requestBody = {
            state: RobisepState.INACTIVE,
          };

          const request: Partial<Request> = {
            body: requestBody,
          };
          const robisepId = '123';
          request.params = { id: robisepId };

          const response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          const robisepServiceInstance = Container.get(config.services.robisep.name);

          // Stub the createRobisep method in the RobisepService
          sinon
            .stub(robisepServiceInstance, 'disableRobisep')
            .returns(Result.fail<IRobisepOutDTO>('Robisep is already disabled.', FailureType.InvalidInput));

          const controller = new RobisepController(robisepServiceInstance as IRobisepService);

          // Act
          await controller.disableRobisep(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 400);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send, sinon.match({ message: 'Robisep is already disabled.' }));
        });

        it('where service returns failure because state is != INACTIVE', async function() {
          // Arrange
          const requestBody = {
            state: RobisepState.ACTIVE,
          };

          const request: Partial<Request> = {
            body: requestBody,
          };
          const robisepId = '123';
          request.params = { id: robisepId };

          const response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          const robisepServiceInstance = Container.get(config.services.robisep.name);

          // Stub the createRobisep method in the RobisepService
          sinon
            .stub(robisepServiceInstance, 'disableRobisep')
            .returns(Result.fail<IRobisepOutDTO>('Invalid state.', FailureType.InvalidInput));

          const controller = new RobisepController(robisepServiceInstance as IRobisepService);

          // Act
          await controller.disableRobisep(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 400);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send, sinon.match({ message: 'Invalid state.' }));
        });
      });

      describe('in integration test', function() {
        it('where robisep does not exist', async function() {
          // Arrange
          const requestBody = {
            state: RobisepState.INACTIVE,
          };

          const request: Partial<Request> = {
            body: requestBody,
          };

          const robisepId = '123';
          request.params = { id: robisepId };

          const response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          // Stub repo methods
          robisepRepoMock.findByDomainId.resolves(null);

          const robisepServiceInstance = Container.get(config.services.robisep.name);

          const controller = new RobisepController(robisepServiceInstance as IRobisepService);

          // Act
          await controller.disableRobisep(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 404);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send, sinon.match({ message: `No robisep found with id=${robisepId}` }));
        });

        it('where robisep is already disabled', async function() {
          // Arrange
          const requestBody = {
            state: RobisepState.INACTIVE,
          };

          const request: Partial<Request> = {
            body: requestBody,
          };

          const robisepId = '123';
          request.params = { id: robisepId };

          const response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          const robisep = Robisep.create(
            {
              nickname: RobisepNickname.create('robot2').getValue(),
              serialNumber: RobisepSerialNumber.create('123456789').getValue(),
              code: RobisepCode.create('123').getValue(),
              description: RobisepDescription.create('something').getValue(),
              robisepType: robisepTypeMock,
              state: RobisepState.ACTIVE,
              roomId: roomMock,
            },
            new UniqueEntityID(robisepId),
          ).getValue();

          robisep.disable();

          // Stub repo methods
          robisepRepoMock.findByDomainId.resolves(robisep);

          const robisepServiceInstance = Container.get(config.services.robisep.name);

          const controller = new RobisepController(robisepServiceInstance as IRobisepService);

          // Act
          await controller.disableRobisep(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 400);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send, sinon.match({ message: 'Robisep is already disabled.' }));
        });

        it('where state is != INACTIVE', async function() {
          // Arrange
          const requestBody = {
            state: 'DEAD',
          };

          const request: Partial<Request> = {
            body: requestBody,
          };

          const robisepId = '123';
          request.params = { id: robisepId };

          const response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          const robisep = Robisep.create(
            {
              nickname: RobisepNickname.create('robot2').getValue(),
              serialNumber: RobisepSerialNumber.create('123456789').getValue(),
              code: RobisepCode.create('123').getValue(),
              description: RobisepDescription.create('something').getValue(),
              robisepType: robisepTypeMock,
              state: RobisepState.ACTIVE,
              roomId: roomMock,
            },
            new UniqueEntityID(robisepId),
          ).getValue();

          // Stub repo methods
          robisepRepoMock.findByDomainId.resolves(robisep);

          const robisepServiceInstance = Container.get(config.services.robisep.name);

          const controller = new RobisepController(robisepServiceInstance as IRobisepService);

          // Act
          await controller.disableRobisep(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 400);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send, sinon.match({ message: 'Invalid state.' }));
        });

        it('where there is a 503 error while saving', async function() {
          // Arrange
          const requestBody = {
            state: RobisepState.INACTIVE,
          };

          const request: Partial<Request> = {
            body: requestBody,
          };

          const robisepId = '123';
          request.params = { id: robisepId };

          const response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          const robisep = Robisep.create(
            {
              nickname: RobisepNickname.create('robot2').getValue(),
              serialNumber: RobisepSerialNumber.create('123456789').getValue(),
              code: RobisepCode.create('123').getValue(),
              description: RobisepDescription.create('something').getValue(),
              robisepType: robisepTypeMock,
              state: RobisepState.ACTIVE,
              roomId: roomMock,
            },
            new UniqueEntityID(robisepId),
          ).getValue();

          // Stub repo methods
          robisepRepoMock.findByDomainId.resolves(robisep);
          robisepRepoMock.save.rejects(new Error('error'));

          const robisepServiceInstance = Container.get(config.services.robisep.name);

          const controller = new RobisepController(robisepServiceInstance as IRobisepService);

          // Act
          await controller.disableRobisep(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 503);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send, sinon.match({ message: 'error' }));
        });

        it('where there is a 401 unauthorized error while findingByDomainId', async function() {
          // Arrange
          const requestBody = {
            state: RobisepState.INACTIVE,
          };

          const request: Partial<Request> = {
            body: requestBody,
          };

          const robisepId = '123';
          request.params = { id: robisepId };

          const response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          // Stub repo methods

          const robisepServiceInstance = Container.get(config.services.robisep.name);

          // Force the service to throw an error
          sinon
            .stub(robisepServiceInstance, 'disableRobisep')
            .throws(new Error('You are not authorized to perform this action'));

          const controller = new RobisepController(robisepServiceInstance as IRobisepService);

          // Act
          await controller.disableRobisep(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 401);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send, 'You are not authorized to perform this action');
        });
      });
    });
  });
});
