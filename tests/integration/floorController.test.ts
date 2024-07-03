import 'reflect-metadata';
import * as sinon from 'sinon';
import {expect} from 'chai';
import {Container} from 'typedi';
import config from '../../config';
import BuildingDataSource from '../datasource/buildingDataSource';
import {Request, Response} from 'express';
import {Result} from '../../src/core/logic/Result';
import IFloorDTO from '../../src/dto/IFloorDTO';
import FloorController from '../../src/controllers/floorController';
import IFloorService from '../../src/services/IServices/IFloorService';
import {Floor} from '../../src/domain/floor/floor';
import {FloorNumber} from '../../src/domain/floor/floorNumber';
import {FloorDescription} from '../../src/domain/floor/floorDescription';
import {UniqueEntityID} from '../../src/core/domain/UniqueEntityID';
import FloorDataSource from '../datasource/floorDataSource';
import {Elevator} from '../../src/domain/elevator/elevator';
import {ElevatorPosition} from '../../src/domain/elevator/elevatorPosition';
import {ElevatorBrand} from '../../src/domain/elevator/elevatorBrand';
import {ElevatorModel} from '../../src/domain/elevator/elevatorModel';
import {ElevatorDescription} from '../../src/domain/elevator/elevatorDescription';
import {ElevatorSerialNumber} from '../../src/domain/elevator/elevatorSerialNumber';
import PassageDataSource from '../datasource/passageDataSource';
import {ElevatorOrientation} from '../../src/domain/elevator/elevatorOrientation';

describe('FloorController', () => {
  const sandbox = sinon.createSandbox();
  let loggerMock;
  let floorRepoMock;
  let buildingServiceMock;
  let roomRepoMock;
  let passageRepoMock;
  let elevatorRepoMock;
  let floorFactoryMock;
  let buildingFromDataSource;
  let floorMock;
  let floorPlanJSONValidatorMock;
  let floorMapCalculatorMock;

  describe('createFloor', () => {
    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };

      Container.set('logger', loggerMock);

      floorRepoMock = {
        save: sinon.stub(),
        findByDomainId: sinon.stub(),
        findByFloorNumberAndBuildingId: sinon.stub(),
      };

      Container.set(config.repos.floor.name, floorRepoMock);

      buildingServiceMock = {
        verifyBuildingExists: sinon.stub(),
      };

      Container.set(config.services.building.name, buildingServiceMock);

      floorFactoryMock = {
        createFloor: sinon.stub(),
      };

      Container.set(config.factories.floor.name, floorFactoryMock);

      floorMapCalculatorMock = {
        calculateFloorMap: sinon.stub(),
      }
      Container.set(config.services.floorMapGenerator.name, floorMapCalculatorMock);

      Container.set(config.services.floorPlanJSONValidator.name, floorPlanJSONValidatorMock);

      buildingFromDataSource = BuildingDataSource.getBuildingA();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const floorServiceClass = require('../../src/services/ServicesImpl/floorService').default;
      const floorServiceInstance = Container.get(floorServiceClass);
      Container.set(config.services.floor.name, floorServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Floor Controller unit test using FloorService stub results in valid floor creation', async () => {
      // Arrange
      const requestBody = {
        buildingId: buildingFromDataSource.id,
        floorNumber: 12,
        floorDescription: 'floor description',
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const floorServiceInstance = Container.get(config.services.floor.name);

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(true);

      sinon.stub(floorServiceInstance, 'createBuildingFloor').returns(
        Result.ok<IFloorDTO>({
          domainId: '123',
          floorNumber: 12,
          floorDescription: 'floor description',
          buildingId: buildingFromDataSource.id,
        }),
      );

      // Stub

      const controller = new FloorController(floorServiceInstance as IFloorService);

      // Act
      await controller.createBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match({
          domainId: '123',
          floorNumber: 12,
          floorDescription: 'floor description',
          buildingId: buildingFromDataSource.id,
        }),
      );
    });

    it('FloorController + FloorService integration test valid floor created with domainId', async () => {
      // Arrange
      const requestBody = {
        buildingId: buildingFromDataSource.id,
        floorNumber: 12,
        floorDescription: 'floor description',
        domainId: '123',
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub floorRepo findByDomainId method
      floorRepoMock.findByDomainId.resolves(null);

      // Stub buildingService verifyBuildingExists method
      buildingServiceMock.verifyBuildingExists.resolves(true);

      const floorInstance = Floor.create(
        {
          floorNumber: FloorNumber.create(requestBody.floorNumber).getValue(),
          floorDescription: FloorDescription.create(requestBody.floorDescription).getValue(),
          building: buildingFromDataSource,
        },
        new UniqueEntityID(requestBody.domainId),
      ).getValue();

      // Stub the floorFactory createFloor method
      floorFactoryMock.createFloor.resolves(floorInstance);

      // Stub floorFactory createFloor method
      floorRepoMock.save.resolves(floorInstance);

      const floorService = Container.get(config.services.floor.name);

      const floorServiceSpy = sinon.spy(floorService, 'createBuildingFloor');

      const controller = new FloorController(floorService as IFloorService);

      // Act
      await controller.createBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match({
          floorDescription: requestBody.floorDescription,
          floorNumber: requestBody.floorNumber,
          domainId: requestBody.domainId,
        }),
      );

      sinon.assert.calledOnce(floorServiceSpy);
      sinon.assert.calledWith(
        floorServiceSpy,
        sinon.match({
          floorDescription: requestBody.floorDescription,
          floorNumber: requestBody.floorNumber,
          domainId: requestBody.domainId,
        }),
      );
    });

    it('FloorController + FloorService integration test valid floor created', async () => {
      // Arrange
      const requestBody = {
        buildingId: buildingFromDataSource.id,
        floorNumber: 12,
        floorDescription: 'floor description',
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub floorRepo findByFloorNumberAndBuildingId method
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);
      // Stub buildingService verifyBuildingExists method
      buildingServiceMock.verifyBuildingExists.resolves(true);

      const floorInstance = Floor.create({
        floorNumber: FloorNumber.create(requestBody.floorNumber).getValue(),
        floorDescription: FloorDescription.create(requestBody.floorDescription).getValue(),
        building: buildingFromDataSource,
      }).getValue();

      // Stub the floorFactory createFloor method
      floorFactoryMock.createFloor.resolves(floorInstance);

      // Stub floorFactory createFloor method
      floorRepoMock.save.resolves(floorInstance);

      const floorService = Container.get(config.services.floor.name);
      const floorServiceSpy = sinon.spy(floorService, 'createBuildingFloor');

      const controller = new FloorController(floorService as IFloorService);

      // Act
      await controller.createBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match({
          floorDescription: requestBody.floorDescription,
          floorNumber: requestBody.floorNumber,
          domainId: floorInstance.id.toString(),
        }),
      );

      sinon.assert.calledOnce(floorServiceSpy);
      sinon.assert.calledWith(
        floorServiceSpy,
        sinon.match({
          buildingId: requestBody.buildingId,
          floorNumber: requestBody.floorNumber,
          floorDescription: requestBody.floorDescription,
        }),
      );
    });

    it('Floor Controller should return 400 when floor number is invalid', async () => {
      // Arrange
      const requestBody = {
        buildingId: buildingFromDataSource.id,
        floorNumber: 1.1,
        floorDescription: 'floor description',
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(true);

      // Stub floorFactory createFloor method
      floorFactoryMock.createFloor.throws(new TypeError('Floor Number must be an integer value.'));

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.createBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'Floor Number must be an integer value.'}));

    });

    it('Floor Controller should return 400 when floor description is invalid', async () => {
      // Arrange
      const requestBody = {
        buildingId: buildingFromDataSource.id,
        floorNumber: 12,
        floorDescription: 'a'.repeat(255),
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(true);

      // Stub floorFactory createFloor method
      floorFactoryMock.createFloor.throws(new TypeError('Floor Description is not within range 1 to 250.'));

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.createBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'Floor Description is not within range 1 to 250.'}));

    });

    it('Floor Controller should return 401 when user is not authorized', async () => {
      // Arrange
      const requestBody = {
        buildingId: buildingFromDataSource.id,
        floorNumber: 12,
        floorDescription: 'floor description',
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
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(true);

      const floorServiceInstance = Container.get('FloorService');

      // Force the service to throw an error
      sinon
        .stub(floorServiceInstance, 'createBuildingFloor')
        .throws(new Error('You are not authorized to perform this action'));

      const controller = new FloorController(floorServiceInstance as IFloorService);

      // Act
      await controller.createBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
    });

    it('Floor Controller should return 404 when building does not exist', async () => {
      // Arrange
      const requestBody = {
        buildingId: 'Invalid building id',
        floorNumber: 12,
        floorDescription: 'floor description',
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(false);

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.createBuildingFloor(<Request>req, <Response>res);

      const id = 'Invalid building id';

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'Building with id ' + id + ' does not exist'}));

    });

    it('Floor Controller should return 409 when floor already exists with number', async () => {
      // Arrange
      const requestBody = {
        buildingId: buildingFromDataSource.id,
        floorNumber: 12,
        floorDescription: 'floor description',
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByFloorNumberAndBuildingId.resolves({
        id: '123',
        floorNumber: 12,
        floorDescription: 'floor description',
        building: buildingFromDataSource.id,
      });

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(true);

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.createBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 409);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'Floor already exists with number ' + requestBody.floorNumber + ' for that building'}));

    });

    it('Floor Controller should return 409 when floor already exists with domainId', async () => {
      // Arrange
      const requestBody = {
        buildingId: buildingFromDataSource.id,
        floorNumber: 12,
        floorDescription: 'floor description',
        domainId: '123',
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByDomainId.resolves({
        id: '123',
        floorNumber: 12,
        floorDescription: 'floor description',
        building: buildingFromDataSource.id,
      });

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(true);

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.createBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 409);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'Floor with id ' + requestBody.domainId + ' already exists'}));
    });

    it('Save floor should return 503 when database error occurs', async () => {
      // Arrange
      const requestBody = {
        buildingId: buildingFromDataSource.id,
        floorNumber: 12,
        floorDescription: 'floor description',
      };

      const req: Partial<Request> = {
        body: requestBody,
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(true);

      // Stub floorFactory createFloor method
      floorRepoMock.save.rejects(new Error('Database error'));

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.createBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 503);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'Database error'}));

    });
  });

  describe('listBuildingFloors', () => {
    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };

      Container.set('logger', loggerMock);

      floorRepoMock = {
        findByBuildingId: sinon.stub(),
      };

      Container.set(config.repos.floor.name, floorRepoMock);

      buildingServiceMock = {
        verifyBuildingExists: sinon.stub(),
      };

      Container.set(config.services.building.name, buildingServiceMock);

      floorMapCalculatorMock = {
        calculateFloorMap: sinon.stub(),
      }
      Container.set(config.services.floorMapGenerator.name, floorMapCalculatorMock);

      Container.set(config.factories.floor.name, floorFactoryMock);

      buildingFromDataSource = BuildingDataSource.getBuildingA();

      Container.set(config.services.floorPlanJSONValidator.name, floorPlanJSONValidatorMock);

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const floorServiceClass = require('../../src/services/ServicesImpl/floorService').default;
      const floorServiceInstance = Container.get(floorServiceClass);
      Container.set(config.services.floor.name, floorServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Floor Controller unit test using FloorService stub results in valid floor list', async () => {
      // Arrange
      const req: Partial<Request> = {
        params: {
          byBuildingId: buildingFromDataSource.id,
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const floorServiceInstance = Container.get(config.services.floor.name);

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByBuildingId.resolves([
        {
          id: '123',
          floorNumber: 12,
          floorDescription: 'floor description',
          building: buildingFromDataSource.id,
        },
        {
          id: '456',
          floorNumber: 13,
          floorDescription: 'floor description',
          building: buildingFromDataSource.id,
        },
      ]);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(true);

      sinon.stub(floorServiceInstance, 'listBuildingFloors').returns(
        Result.ok<IFloorDTO[]>([
          {
            domainId: '123',
            floorNumber: 12,
            floorDescription: 'floor description',
            buildingId: buildingFromDataSource.id,
          },
          {
            domainId: '456',
            floorNumber: 13,
            floorDescription: 'floor description',
            buildingId: buildingFromDataSource.id,
          },
        ]),
      );

      const controller = new FloorController(floorServiceInstance as IFloorService);

      // Act
      await controller.listBuildingFloors(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match([
          {
            domainId: '123',
            floorNumber: 12,
            floorDescription: 'floor description',
            buildingId: buildingFromDataSource.id,
          },
          {
            domainId: '456',
            floorNumber: 13,
            floorDescription: 'floor description',
            buildingId: buildingFromDataSource.id,
          },
        ]),
      );
    });

    it('FloorController + FloorService integration test', async () => {
      // Arrange
      const req: Partial<Request> = {
        params: {
          byBuildingId: buildingFromDataSource.id,
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub floorRepo findByBuildingId method
      floorRepoMock.findByBuildingId.resolves([
        {
          domainId: '123',
          floorNumber: 12,
          floorDescription: 'floor description',
          building: buildingFromDataSource,
        },
      ]);

      // Stub buildingService verifyBuildingExists method
      buildingServiceMock.verifyBuildingExists.resolves(true);

      const floorService = Container.get(config.services.floor.name);
      const floorServiceSpy = sinon.spy(floorService, 'listBuildingFloors');

      const controller = new FloorController(floorService as IFloorService);

      // Act
      await controller.listBuildingFloors(<Request>req, <Response>res);

      sinon.assert.calledOnce(floorServiceSpy);
      sinon.assert.calledWith(floorServiceSpy, sinon.match(buildingFromDataSource.id));
    });

    it('Floor Controller should return 200 when there are no floors for the building', async () => {
      // Arrange
      const req: Partial<Request> = {
        params: {
          byBuildingId: buildingFromDataSource.id,
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByBuildingId.resolves([]);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(true);

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.listBuildingFloors(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(res.json, sinon.match([]));
    });

    it('Floor Controller should return 401 when user is not authorized', async () => {
      // Arrange
      const req: Partial<Request> = {
        params: {
          byBuildingId: buildingFromDataSource.id,
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByBuildingId.resolves(null);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(true);

      const floorServiceInstance = Container.get('FloorService');

      // Force the service to throw an error
      sinon
        .stub(floorServiceInstance, 'listBuildingFloors')
        .throws(new Error('You are not authorized to perform this action'));

      const controller = new FloorController(floorServiceInstance as IFloorService);

      // Act
      await controller.listBuildingFloors(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
    });

    it('Floor Controller should return 404 when building does not exist', async () => {
      // Arrange
      const req: Partial<Request> = {
        params: {
          byBuildingId: 'Invalid building id',
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByBuildingId.resolves(null);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(false);

      loggerMock.error.resolves('Building with id ' + req.params.byBuildingId + ' does not exist');

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.listBuildingFloors(<Request>req, <Response>res);

      const id = 'Invalid building id';

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match('Building with id ' + id + ' does not exist'));
    });

    it('Floor Controller should return 503 when database error occurs', async () => {
      // Arrange
      const req: Partial<Request> = {
        params: {
          byBuildingId: buildingFromDataSource.id,
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the verifyBuildingExists method in the FloorService
      buildingServiceMock.verifyBuildingExists.rejects(new Error('Database error'));

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.listBuildingFloors(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 503);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match('Database error'));
    });
  });

  describe('updateBuildingFloor', () => {
    beforeEach(() => {
      Container.reset();

      floorMock = Floor.create(
        {
          floorNumber: FloorNumber.create(12).getValue(),
          floorDescription: FloorDescription.create('floor description').getValue(),
          building: BuildingDataSource.getBuildingA(),
        },
        new UniqueEntityID('123'),
      ).getValue();

      loggerMock = {
        error: sinon.stub(),
      };

      Container.set('logger', loggerMock);

      floorRepoMock = {
        save: sinon.stub(),
        findByDomainId: sinon.stub(),
        findByFloorNumberAndBuildingId: sinon.stub(),
      };

      Container.set(config.repos.floor.name, floorRepoMock);

      Container.set(config.services.building.name, buildingServiceMock);

      floorFactoryMock = {
        createFloor: sinon.stub(),
      };

      Container.set(config.factories.floor.name, floorFactoryMock);

      buildingFromDataSource = BuildingDataSource.getBuildingA();

      floorPlanJSONValidatorMock = {
        isFloorPlanValid: sinon.stub(),
      };

      Container.set(config.services.floorPlanJSONValidator.name, floorPlanJSONValidatorMock);

      floorMapCalculatorMock = {
        calculateFloorMap: sinon.stub(),
      }

      Container.set(config.services.floorMapGenerator.name, floorMapCalculatorMock);

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const floorServiceClass = require('../../src/services/ServicesImpl/floorService').default;
      const floorServiceInstance = Container.get(floorServiceClass);
      Container.set(config.services.floor.name, floorServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Floor Controller unit test using FloorService stub results in valid floor update', async () => {
      // Arrange
      const requestBody = {
        floorNumber: 13,
        floorDescription: 'floor',
      };

      const req: Partial<Request> = {
        body: requestBody,
        params: {
          floorId: '123',
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const floorServiceInstance = Container.get(config.services.floor.name);

      // Stub the findByDomainId method in the FloorService
      floorRepoMock.findByDomainId.resolves(floorMock);

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      sinon.stub(floorServiceInstance, 'updateBuildingFloor').returns(
        Result.ok<IFloorDTO>({
          domainId: '123',
          floorNumber: 13,
          floorDescription: 'floor',
          buildingId: buildingFromDataSource.id,
        }),
      );

      const controller = new FloorController(floorServiceInstance as IFloorService);

      // Act
      await controller.updateBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match({
          domainId: '123',
          floorNumber: 13,
          floorDescription: 'floor',
          buildingId: buildingFromDataSource.id,
        }),
      );
    });

    it('FloorController + FloorService integration test valid floor edited (floor number and floor description)', async () => {
      // Arrange
      const requestBody = {
        floorNumber: 13,
        floorDescription: 'floor',
      };

      const req: Partial<Request> = {
        body: requestBody,
        params: {
          floorId: '123',
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub floorRepo findByDomainId method
      floorRepoMock.findByDomainId.resolves(floorMock);

      // Stub floorRepo findByFloorNumberAndBuildingId method
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      const floorService = Container.get(config.services.floor.name);
      const floorServiceSpy = sinon.spy(floorService, 'updateBuildingFloor');

      const controller = new FloorController(floorService as IFloorService);

      // Act
      await controller.updateBuildingFloor(<Request>req, <Response>res);

      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match({
          domainId: '123'.toString(),
          floorDescription: requestBody.floorDescription.toString(),
          floorNumber: requestBody.floorNumber,
        }),
      );

      sinon.assert.calledOnce(floorServiceSpy);
    });

    it('FloorController + FloorService integration test valid floor edited (only floor number)', async () => {
      // Arrange
      const requestBody = {
        floorNumber: 13,
        floorDescription: null,
      };

      const req: Partial<Request> = {
        body: requestBody,
        params: {
          floorId: '123',
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.stub().returnsThis(),
      };

      // Stub floorRepo findByDomainId method
      floorRepoMock.findByDomainId.resolves(floorMock);

      // Stub floorRepo findByFloorNumberAndBuildingId method
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      const floorService = Container.get(config.services.floor.name);
      const floorServiceSpy = sinon.spy(floorService, 'updateBuildingFloor');

      const controller = new FloorController(floorService as IFloorService);

      // Act
      await controller.updateBuildingFloor(<Request>req, <Response>res);

      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match({
          domainId: '123'.toString(),
          floorDescription: floorMock.floorDescription.value,
          floorNumber: requestBody.floorNumber,
        }),
      );

      sinon.assert.calledOnce(floorServiceSpy);
    });

    it('FloorController + FloorService integration test valid floor edited (only floor description)', async () => {
      // Arrange
      const requestBody = {
        floorNumber: null,
        floorDescription: 'floor',
      };

      const req: Partial<Request> = {
        body: requestBody,
        params: {
          floorId: '123',
        },
      };

      const res: Partial<Response> = {
        json: sinon.stub().returnsThis(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub floorRepo findByDomainId method
      floorRepoMock.findByDomainId.resolves(floorMock);

      // Stub floorRepo findByFloorNumberAndBuildingId method
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      const floorService = Container.get(config.services.floor.name);
      const floorServiceSpy = sinon.spy(floorService, 'updateBuildingFloor');

      const controller = new FloorController(floorService as IFloorService);

      // Act
      await controller.updateBuildingFloor(<Request>req, <Response>res);

      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match({
          domainId: '123'.toString(),
          floorDescription: requestBody.floorDescription.toString(),
          floorNumber: floorMock.floorNumber.value,
        }),
      );

      sinon.assert.calledOnce(floorServiceSpy);
    });

    it('FloorController + FloorService integration test valid floor description edited + load floor plan', async () => {
      // Arrange
      const requestBody = {
        floorDescription: 'test update/load',
        floorPlan: {
          planFloorNumber: 5,
          planFloorSize: {
            width: 51,
            height: 51,
          },
          floorPlanGrid: [
            [3, 0, 1, 2],
            [2, 0, 0, 2],
            [2, 0, 0, 2],
            [2, 1, 1, 0],
          ],
          floorPlanRooms: [
            {
              roomName: 'Room1',
              roomCoordinates: [
                {
                  x: 10,
                  y: 20,
                },
                {
                  x: 15,
                  y: 17,
                },
              ],
              roomDoorCoordinates: {
                x: 30,
                y: 25,
              },
            },
          ],
          floorPlanElevator: [
            {
              elevatorNumber: 1,
              elevatorCoordinates: {
                x: 50,
                y: 60,
              },
            },
          ],
          floorPlanPassages: [
            {
              toFloor: 'Floor2',
              passageCoordinates: {
                x: 70,
                y: 90,
              },
            },
          ],
        },
      };

      const req: Partial<Request> = {
        body: requestBody,
        params: {
          floorId: '123',
        },
      };

      const res: Partial<Response> = {
        json: sinon.stub().returnsThis(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub floorRepo findByDomainId method
      floorRepoMock.findByDomainId.resolves(floorMock);

      // Stub floorRepo findByFloorNumberAndBuildingId method
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      // Stub floorPlanJSONValidator isFloorPlanValid method
      floorPlanJSONValidatorMock.isFloorPlanValid.resolves(true);

      const floorService = Container.get(config.services.floor.name);
      const floorServiceSpy = sinon.spy(floorService, 'updateBuildingFloor');

      const controller = new FloorController(floorService as IFloorService);

      // Act
      await controller.updateBuildingFloor(<Request>req, <Response>res);

      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match({
          domainId: '123'.toString(),
          floorDescription: requestBody.floorDescription.toString(),
          floorNumber: floorMock.floorNumber.value,
          floorPlan: requestBody.floorPlan,
        }),
      );

      sinon.assert.calledOnce(floorServiceSpy);
    });

    it('Floor Controller should return 400 when floor plan is loaded is not valid', async () => {
      // Arrange
      const requestBody = {
        floorPlan: {
          planFloorNumber: 5,
          planFloorSize: {
            width: 51,
            height: 51,
          },
          floorPlanGrid: [
            [3, 0, 1, 2],
            [2, 0, 0, 2],
            [2, 0, 0, 2],
            [2, 1, 1, 0],
          ],
        },
      };

      const req: Partial<Request> = {
        body: requestBody,
        params: {
          floorId: '123',
        },
      };

      const res: Partial<Response> = {
        json: sinon.stub().returnsThis(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub floorRepo findByDomainId method
      floorRepoMock.findByDomainId.resolves(floorMock);

      // Stub floorRepo findByFloorNumberAndBuildingId method
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      // Stub floorPlanJSONValidator isFloorPlanValid method
      floorPlanJSONValidatorMock.isFloorPlanValid.returns(false);

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.updateBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'The floor plan is not valid!'}));
    });

    it('Floor Controller should return 200 when floor number and description are null', async () => {
      // Arrange
      const requestBody = {
        floorNumber: null,
        floorDescription: null,
      };

      const req: Partial<Request> = {
        body: requestBody,
        params: {
          floorId: '123',
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByDomainId method in the FloorService
      floorRepoMock.findByDomainId.resolves(floorMock);

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.updateBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 200);
    });

    it('Floor Controller should return 400 when floor number is invalid', async () => {
      // Arrange
      const requestBody = {
        floorNumber: 1.1,
        floorDescription: 'floor description',
      };

      const req: Partial<Request> = {
        body: requestBody,
        params: {
          floorId: '123',
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByDomainId method in the FloorService
      floorRepoMock.findByDomainId.resolves(floorMock);

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      // Stub floorFactory createFloor method
      floorFactoryMock.createFloor.throws(new TypeError('Floor Number must be an integer value.'));

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.updateBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'Floor Number must be an integer value.'}));

    });

    it('Floor Controller should return 400 when floor description is invalid', async () => {
      // Arrange
      const requestBody = {
        floorNumber: 12,
        floorDescription: 'a'.repeat(255),
      };

      const req: Partial<Request> = {
        body: requestBody,
        params: {
          floorId: '123',
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByDomainId method in the FloorService
      floorRepoMock.findByDomainId.resolves(floorMock);

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      // Stub floorFactory createFloor method
      floorFactoryMock.createFloor.throws(new TypeError('Floor Description is not within range 1 to 250.'));

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.updateBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'Floor Description is not within range 1 to 250.'}));

    });

    it('Floor Controller should return 401 when user is not authorized', async () => {
      // Arrange
      const requestBody = {
        floorNumber: 12,
        floorDescription: 'floor description',
      };

      const req: Partial<Request> = {
        body: requestBody,
        params: {
          floorId: '123',
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByDomainId method in the FloorService
      floorRepoMock.findByDomainId.resolves(floorMock);

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      const floorServiceInstance = Container.get('FloorService');

      // Force the service to throw an error
      sinon
        .stub(floorServiceInstance, 'updateBuildingFloor')
        .throws(new Error('You are not authorized to perform this action'));

      const controller = new FloorController(floorServiceInstance as IFloorService);

      // Act
      await controller.updateBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
    });

    it('Floor Controller should return 404 when floor does not exist', async () => {
      // Arrange
      const requestBody = {
        floorNumber: 12,
        floorDescription: 'floor description',
      };

      const req: Partial<Request> = {
        body: requestBody,
        params: {
          floorId: '123',
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByDomainId method in the FloorService
      floorRepoMock.findByDomainId.resolves(null);

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.updateBuildingFloor(<Request>req, <Response>res);

      const id = '123';

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'Floor with id ' + id + ' does not exist'}));

    });

    it('Floor Controller should return 409 when floor with number already exists', async () => {
      // Arrange
      const requestBody = {
        floorNumber: 13,
        floorDescription: 'floor description to overlap',
      };

      const req: Partial<Request> = {
        body: requestBody,
        params: {
          floorId: '123',
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByDomainId method in the FloorService
      floorRepoMock.findByDomainId.resolves(floorMock);

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByFloorNumberAndBuildingId.resolves({
        id: '1234',
        floorNumber: 13,
        floorDescription: 'floor description to overlap',
        building: buildingFromDataSource.id,
      });

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.updateBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 409);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({
        message: 'Floor already exists with number ' +
          requestBody.floorNumber + ' for that building'
      }));

    });

    it('Floor Controller should return 503 when database error occurs', async () => {
      // Arrange
      const requestBody = {
        floorNumber: 12,
        floorDescription: 'floor description',
      };

      const req: Partial<Request> = {
        body: requestBody,
        params: {
          floorId: '123',
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.stub().returnsThis(),
      };

      // Stub the findByDomainId method in the FloorService
      floorRepoMock.findByDomainId.resolves(floorMock);

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      // Stub floorFactory createFloor method
      floorRepoMock.save.rejects(new Error('Database error'));

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.updateBuildingFloor(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 503);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'Database error'}));

    });
  });

  describe('listFloorsInBuildingWithElevator', () => {
    let elevatorDataSourceFull;
    let elevatorDataSourceNoBrandNoModel;
    let floorDataSource1;
    let floorDataSource2;
    let floorDataSource3;

    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };

      Container.set('logger', loggerMock);

      floorRepoMock = {
        findFloorsWithElevatorByBuildingId: sinon.stub(),
      };

      Container.set(config.repos.floor.name, floorRepoMock);

      buildingServiceMock = {
        verifyBuildingExists: sinon.stub(),
      };

      Container.set(config.services.building.name, buildingServiceMock);

      floorMapCalculatorMock = {
        calculateFloorMap: sinon.stub(),
      }
      Container.set(config.services.floorMapGenerator.name, floorMapCalculatorMock);

      Container.set(config.factories.floor.name, floorFactoryMock);

      floorDataSource1 = Floor.create({
        floorNumber: FloorNumber.create(1).getValue(),
        building: BuildingDataSource.getBuildingA(),
      }).getValue();

      floorDataSource2 = Floor.create({
        floorNumber: FloorNumber.create(3).getValue(),
        building: BuildingDataSource.getBuildingA(),
      }).getValue();

      floorDataSource3 = Floor.create({
        floorNumber: FloorNumber.create(2).getValue(),
        building: BuildingDataSource.getBuildingB(),
      }).getValue();

      elevatorDataSourceFull = Elevator.create(
        {
          uniqueNumber: 1,
          description: ElevatorDescription.create('Elevator 1').getValue(),
          brand: ElevatorBrand.create('Brand 1').getValue(),
          model: ElevatorModel.create('Model 1').getValue(),
          serialNumber: ElevatorSerialNumber.create('Serial 1').getValue(),
          elevatorPosition: ElevatorPosition.create({xposition: 5, yposition: 8}).getValue(),
          orientation: ElevatorOrientation.NORTH,
          building: BuildingDataSource.getBuildingA(),
          floors: [floorDataSource1],
        },
        new UniqueEntityID('id'),
      ).getValue();

      elevatorDataSourceNoBrandNoModel = Elevator.create(
        {
          uniqueNumber: 2,
          description: ElevatorDescription.create('Elevator 2').getValue(),
          elevatorPosition: ElevatorPosition.create({xposition: 5, yposition: 8}).getValue(),
          orientation: ElevatorOrientation.NORTH,
          building: BuildingDataSource.getBuildingA(),
          floors: [floorDataSource2],
        },
        new UniqueEntityID('id2'),
      ).getValue();

      Container.set(config.services.floorPlanJSONValidator.name, floorPlanJSONValidatorMock);

      const floorServiceClass = require('../../src/services/ServicesImpl/floorService').default;
      const floorServiceInstance = Container.get(floorServiceClass);
      Container.set(config.services.floor.name, floorServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Floor Controller unit test using FloorService stub results in valid floor list', async () => {
      const req: Partial<Request> = {
        params: {
          buildingId: BuildingDataSource.getBuildingA().id.toString(),
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findFloorsWithElevatorByBuildingId.resolves([floorDataSource1]);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(true);

      const floorService = Container.get(config.services.floor.name);
      const floorServiceSpy = sinon.spy(floorService, 'listFloorsWithElevatorByBuildingId');

      const controller = new FloorController(floorService as IFloorService);

      // Act
      await controller.listFloorsWithElevatorByBuildingId(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match([
          {
            domainId: floorDataSource1.id.toString(),
            floorNumber: floorDataSource1.floorNumber.value,
            building: {
              domainId: floorDataSource1.building.id.toString(),
              buildingName: floorDataSource1.building.name.value,
              buildingCode: floorDataSource1.building.code.value,
              buildingDescription: floorDataSource1.building.description.value,
              buildingDimensions: {
                width: floorDataSource1.building.dimensions.width,
                length: floorDataSource1.building.dimensions.length,
              }
            }
          },
        ]),
      );
      sinon.assert.calledOnce(floorServiceSpy);
    });

    it('should return 401 when user is not authorized', async () => {
      // Arrange
      const req: Partial<Request> = {
        params: {
          buildingId: BuildingDataSource.getBuildingA().id.toString(),
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findFloorsWithElevatorByBuildingId.resolves([floorDataSource1]);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(true);

      const floorServiceInstance = Container.get('FloorService');

      // Force the service to throw an error
      sinon
        .stub(floorServiceInstance, 'listFloorsWithElevatorByBuildingId')
        .throws(new Error('You are not authorized to perform this action'));

      const controller = new FloorController(floorServiceInstance as IFloorService);

      // Act
      await controller.listFloorsWithElevatorByBuildingId(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
    });

    it('should return 404 when building does not exist', async () => {
      // Arrange
      const req: Partial<Request> = {
        params: {
          buildingId: 'Invalid building id',
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findFloorsWithElevatorByBuildingId.resolves(null);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(false);

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.listFloorsWithElevatorByBuildingId(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'The building does not exist.'}));

    });

    it('should return 503 when database error occurs', async () => {
      // Arrange
      const req: Partial<Request> = {
        params: {
          buildingId: BuildingDataSource.getBuildingA().id.toString(),
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.stub().returnsThis(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findFloorsWithElevatorByBuildingId.resolves(null);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.rejects(new Error('Database error'));

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.listFloorsWithElevatorByBuildingId(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 503);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'Database error'}));

    });
  });

  describe('listFloorsInBuildingWithPassage', () => {
    let floorDataSource1: Floor;
    let floorDataSource2: Floor;
    let passageDataSource1;

    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };

      Container.set('logger', loggerMock);

      floorRepoMock = {
        findFloorsWithPassageByBuildingId: sinon.stub(),
      };

      Container.set(config.repos.floor.name, floorRepoMock);

      buildingServiceMock = {
        verifyBuildingExists: sinon.stub(),
      };

      Container.set(config.services.building.name, buildingServiceMock);

      floorMapCalculatorMock = {
        calculateFloorMap: sinon.stub(),
      }
      Container.set(config.services.floorMapGenerator.name, floorMapCalculatorMock);

      Container.set(config.factories.floor.name, floorFactoryMock);

      floorDataSource1 = Floor.create({
        floorNumber: FloorNumber.create(1).getValue(),
        building: BuildingDataSource.getBuildingA(),
      }).getValue();

      floorDataSource2 = Floor.create({
        floorNumber: FloorNumber.create(3).getValue(),
        building: BuildingDataSource.getBuildingA(),
      }).getValue();

      passageDataSource1 = PassageDataSource.getPassageA();

      Container.set(config.services.floorPlanJSONValidator.name, floorPlanJSONValidatorMock);

      const floorServiceClass = require('../../src/services/ServicesImpl/floorService').default;
      const floorServiceInstance = Container.get(floorServiceClass);
      Container.set(config.services.floor.name, floorServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Floor Controller unit test using FloorService stub results in valid floor list', async () => {
      const req: Partial<Request> = {
        params: {
          buildingId: BuildingDataSource.getBuildingA().id.toString(),
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findFloorsWithPassageByBuildingId.resolves([floorDataSource1]);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(true);

      const floorService = Container.get(config.services.floor.name);
      const floorServiceSpy = sinon.spy(floorService, 'listFloorsWithPassageByBuildingId');

      const controller = new FloorController(floorService as IFloorService);

      // Act
      await controller.listFloorsWithPassageByBuildingId(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match([
          {
            domainId: floorDataSource1.id.toString(),
            floorNumber: floorDataSource1.floorNumber.value,
            building: {
              domainId: floorDataSource1.building.id.toString(),
              buildingName: floorDataSource1.building.name.value,
              buildingCode: floorDataSource1.building.code.value,
              buildingDescription: floorDataSource1.building.description.value,
              buildingDimensions: {
                width: floorDataSource1.building.dimensions.width,
                length: floorDataSource1.building.dimensions.length,
              }
            }
          },
        ]),
      );
      sinon.assert.calledOnce(floorServiceSpy);
    });

    it('Floor Controller + FloorService integration test valid floor list', async () => {
      // Arrange
      const req: Partial<Request> = {
        params: {
          buildingId: BuildingDataSource.getBuildingA().id.toString(),
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findFloorsWithPassageByBuildingId.resolves([floorDataSource1]);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(true);

      const floorServiceInstance = Container.get('FloorService');

      const controller = new FloorController(floorServiceInstance as IFloorService);

      // Act
      await controller.listFloorsWithPassageByBuildingId(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match([
          {
            domainId: floorDataSource1.id.toString(),
            floorNumber: floorDataSource1.floorNumber.value,
            building: {
              domainId: floorDataSource1.building.id.toString(),
              buildingName: floorDataSource1.building.name.value,
              buildingCode: floorDataSource1.building.code.value,
              buildingDescription: floorDataSource1.building.description.value,
              buildingDimensions: {
                width: floorDataSource1.building.dimensions.width,
                length: floorDataSource1.building.dimensions.length,
              }
            }
          },
        ]),
      );
    });

    it('should return 401 when user is not authorized', async () => {
      // Arrange
      const req: Partial<Request> = {
        params: {
          buildingId: BuildingDataSource.getBuildingA().id.toString(),
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findFloorsWithPassageByBuildingId.resolves([floorDataSource1]);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(true);

      const floorServiceInstance = Container.get('FloorService');

      // Force the service to throw an error
      sinon
        .stub(floorServiceInstance, 'listFloorsWithPassageByBuildingId')
        .throws(new Error('You are not authorized to perform this action'));

      const controller = new FloorController(floorServiceInstance as IFloorService);

      // Act
      await controller.listFloorsWithPassageByBuildingId(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
    });

    it('should return 404 when building does not exist', async () => {
      // Arrange
      const req: Partial<Request> = {
        params: {
          buildingId: 'Invalid building id',
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findFloorsWithPassageByBuildingId.resolves(null);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.resolves(false);

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.listFloorsWithPassageByBuildingId(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'The building does not exist.'}));
    });

    it('should return 503 when database error occurs', async () => {
      // Arrange
      const req: Partial<Request> = {
        params: {
          buildingId: BuildingDataSource.getBuildingA().id.toString(),
        },
      };

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.stub().returnsThis(),
      };

      // Stub the findByFloorNumberAndBuildingId method in the FloorService
      floorRepoMock.findFloorsWithPassageByBuildingId.resolves(null);

      // Stub the verifyBuildingExists method in the BuildingService
      buildingServiceMock.verifyBuildingExists.rejects(new Error('Database error'));

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.listFloorsWithPassageByBuildingId(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 503);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: 'Database error'}));
    });
  });

  describe('listFloors', () => {
    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };

      Container.set('logger', loggerMock);

      floorRepoMock = {
        findAll: sinon.stub(),
      };

      Container.set(config.repos.floor.name, floorRepoMock);

      floorMapCalculatorMock = {
        calculateFloorMap: sinon.stub(),
      }
      Container.set(config.services.floorMapGenerator.name, floorMapCalculatorMock);

      Container.set(config.services.building.name, buildingServiceMock);

      Container.set(config.factories.floor.name, floorFactoryMock);

      Container.set(config.services.floorPlanJSONValidator.name, floorPlanJSONValidatorMock);

      const floorServiceClass = require('../../src/services/ServicesImpl/floorService').default;
      const floorServiceInstance = Container.get(floorServiceClass);
      Container.set(config.services.floor.name, floorServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Floor Controller unit test using FloorService stub results in valid floor list', async () => {

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const floorService = Container.get(config.services.floor.name);

      // Stub the listFloors method in the FloorService
      sinon
        .stub(floorService, 'listFloors')
        .returns([
          FloorDataSource.getFirstFloor(),
          FloorDataSource.getSecondFloor(),
          FloorDataSource.getThirdFloor(),
          FloorDataSource.getFourthFloor(),
        ]);

      const controller = new FloorController(floorService as IFloorService);

      // Act
      await controller.listFloors(<Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match([
          FloorDataSource.getFirstFloor(),
          FloorDataSource.getSecondFloor(),
          FloorDataSource.getThirdFloor(),
          FloorDataSource.getFourthFloor(),
        ]),
      );
    });

    it('Floor Controller + FloorService integration test valid floor list', async () => {
      // Arrange

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub the find all
      floorRepoMock.findAll.resolves([FloorDataSource.getFirstFloor(), FloorDataSource.getSecondFloor()]);

      const floorServiceInstance = Container.get('FloorService');
      const floorServiceSpy = sinon.spy(floorServiceInstance, 'listFloors');

      const controller = new FloorController(floorServiceInstance as IFloorService);

      // Act
      await controller.listFloors(<Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match([FloorDataSource.getFirstFloorOutDTO(), FloorDataSource.getSecondFloorOutDTO()]),
      );
      sinon.assert.calledOnce(floorServiceSpy);
    });

    it('should return 401 when user is not authorized', async () => {
      // Arrange

      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.stub().returnsThis(),
      };

      // Stub the find all
      floorRepoMock.findAll.throws(new Error('Unauthorized'));

      const controller = new FloorController(Container.get(config.services.floor.name) as IFloorService);

      // Act
      await controller.listFloors(<Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match('Unauthorized'));
    });

  });

  describe('getFloorMap', () => {
    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };
      Container.set('logger', loggerMock);

      floorRepoMock = {
        findByBuildingCodeAndFloorNumber: sinon.stub(),
      };
      Container.set(config.repos.floor.name, floorRepoMock);

      roomRepoMock = {
        findByFloorId: sinon.stub(),
      }
      Container.set(config.repos.room.name, roomRepoMock);

      passageRepoMock = {
        findPassagesByFloorId: sinon.stub(),
      }
      Container.set(config.repos.passage.name, passageRepoMock);

      elevatorRepoMock = {
        findAllByFloorID: sinon.stub(),
      }
      Container.set(config.repos.elevator.name, elevatorRepoMock);

      floorMapCalculatorMock = {
        calculateFloorMap: sinon.stub(),
      }
      Container.set(config.services.floorMapGenerator.name, floorMapCalculatorMock);

      Container.set(config.services.building.name, buildingServiceMock);

      Container.set(config.factories.floor.name, floorFactoryMock);

      Container.set(config.services.floorPlanJSONValidator.name, floorPlanJSONValidatorMock);

      floorMock = FloorDataSource.floorWithFloorPlan();

      const floorServiceClass = require('../../src/services/ServicesImpl/floorService').default;
      const floorServiceInstance = Container.get(floorServiceClass);
      Container.set(config.services.floor.name, floorServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Floor Controller unit test using FloorService stub results in valid floor map', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          buildingCode: floorMock.building.buildingCode,
          floorNumber: floorMock.floorNumber
        },
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const floorService = Container.get(config.services.floor.name);

      // Stub the getFloorMap method in the FloorService
      floorRepoMock.findByBuildingCodeAndFloorNumber.resolves(FloorDataSource.getFirstFloor());
      floorMapCalculatorMock.calculateFloorMap.resolves('floor-plan');

      const controller = new FloorController(floorService as IFloorService);

      // Act
      await controller.getFloorMap(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match('floor-plan'),
      );
    });

    it('Floor does not exist', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          buildingCode: 'CC',
          floorNumber: '1'
        },
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const floorService = Container.get(config.services.floor.name);

      // Stub the getFloorMap method in the FloorService
      floorRepoMock.findByBuildingCodeAndFloorNumber.resolves(null);

      const controller = new FloorController(floorService as IFloorService);

      // Act
      await controller.getFloorMap(<Request>req, <Response>res);

      // Assert

      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: `Floor with number ${req.query.floorNumber} does not exist in building with code ${req.query.buildingCode}`}));
    });

    it('Error while calculating plan', async () => {
      // Arrange
      const req: Partial<Request> = {
        query: {
          buildingCode: floorMock.building.buildingCode,
          floorNumber: floorMock.floorNumber
        },
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const floorService = Container.get(config.services.floor.name);

      // Stub the getFloorMap method in the FloorService
      floorRepoMock.findByBuildingCodeAndFloorNumber.resolves(floorMock);
      floorMapCalculatorMock.calculateFloorMap.throws(new Error('Error while calculating floor map'));

      const controller = new FloorController(floorService as IFloorService);

      // Act
      await controller.getFloorMap(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 503);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message: `Error while calculating floor map`}));
    });
  });
});
