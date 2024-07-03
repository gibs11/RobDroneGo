import 'reflect-metadata';

import * as sinon from 'sinon';
import { Response, Request } from 'express';
import { Container } from 'typedi';
import { FailureType, Result } from '../../src/core/logic/Result';

import IBuildingService from '../../src/services/IServices/IBuildingService';
import BuildingController from '../../src/controllers/buildingController';
import IBuildingDTO from '../../src/dto/IBuildingDTO';
import { Building } from '../../src/domain/building/building';
import { BuildingCode } from '../../src/domain/building/buildingCode';
import { BuildingDescription } from '../../src/domain/building/buildingDescription';
import { BuildingName } from '../../src/domain/building/buildingName';
import { BuildingDimensions } from '../../src/domain/building/buildingDimensions';
import BuildingDataSource from '../datasource/buildingDataSource';
import { UniqueEntityID } from '../../src/core/domain/UniqueEntityID';

describe('BuildingController', function() {
  const sandbox = sinon.createSandbox();
  let loggerMock;
  let buildingRepoMock;

  describe('createBuilding', function() {
    beforeEach(function() {
      Container.reset();
      loggerMock = {
        error: sinon.stub(),
      };
      Container.set('logger', loggerMock);

      buildingRepoMock = {
        findByBuildingCode: sinon.stub(),
        findByDomainId: sinon.stub(),
        save: sinon.stub(),
      };
      Container.set('BuildingRepo', buildingRepoMock);

      const buildingServiceClass = require('../../src/services/ServicesImpl/buildingService').default;
      const buildingServiceInstance = Container.get(buildingServiceClass);
      Container.set('BuildingService', buildingServiceInstance);
    });

    afterEach(function() {
      sandbox.restore();
      sinon.restore();
    });

    it('BuildingController unit test using BuildingService stub', async function() {
      // Arrange
      const requestBody = {
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TEST',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const buildingServiceInstance = Container.get('BuildingService');

      // Stub the createBuilding method in the BuildingService
      sinon.stub(buildingServiceInstance, 'createBuilding').returns(
        Result.ok<IBuildingDTO>({
          domainId: '123',
          buildingName: 'Sample Building Name',
          buildingDimensions: { width: 5, length: 10 },
          buildingDescription: 'Sample Building Description',
          buildingCode: 'TEST',
        }),
      );

      const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

      // Act
      await ctrl.createBuilding(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match({
          domainId: '123',
          buildingName: 'Sample Building Name',
          buildingDimensions: { width: 5, length: 10 },
          buildingDescription: 'Sample Building Description',
          buildingCode: 'TEST',
        }),
      );
    });

    it('BuildingController + BuildingService integration test', async function() {
      // Arrange
      const requestBody = {
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TEST',
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
      buildingRepoMock.findByBuildingCode.resolves(null);
      buildingRepoMock.save.resolves(
        Building.create({
          buildingName: BuildingName.create(requestBody.buildingName).getValue(),
          buildingDimensions: BuildingDimensions.create(requestBody.buildingDimensions).getValue(),
          buildingDescription: BuildingDescription.create(requestBody.buildingDescription).getValue(),
          buildingCode: BuildingCode.create(requestBody.buildingCode).getValue(),
        }).getValue(),
      );

      const buildingServiceInstance = Container.get('BuildingService');
      const buildingServiceSpy = sinon.spy(buildingServiceInstance, 'createBuilding');

      const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

      // Act
      await ctrl.createBuilding(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match({
          buildingName: requestBody.buildingName,
          buildingDimensions: requestBody.buildingDimensions,
          buildingDescription: requestBody.buildingDescription,
          buildingCode: requestBody.buildingCode,
        }),
      );
      sinon.assert.calledOnce(buildingServiceSpy);
      sinon.assert.calledWith(
        buildingServiceSpy,
        sinon.match({
          buildingName: requestBody.buildingName,
          buildingDimensions: requestBody.buildingDimensions,
          buildingDescription: requestBody.buildingDescription,
          buildingCode: requestBody.buildingCode,
        }),
      );
    });

    it('should return 400 if building is invalid', async function() {
      // Arrange
      const requestBody = {
        buildingName: 'Inv@lid--',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TEST',
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
      buildingRepoMock.findByBuildingCode.resolves(null);

      const buildingServiceInstance = Container.get('BuildingService');

      const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

      // Act
      await ctrl.createBuilding(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      // Res.send is now called with an object instead of a string, i wnat to check the message property
      sinon.assert.calledWith(
        res.send,
        sinon.match({ message: 'Building Name can only contain alphanumeric characters and spaces.' }),
      );
    });

    it('should return 409 if a building with the same code already exists', async function() {
      // Arrange
      const requestBody = {
        buildingName: 'Sample Building Code',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'A',
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
      buildingRepoMock.findByBuildingCode.resolves(BuildingDataSource.getBuildingA());

      const buildingServiceInstance = Container.get('BuildingService');

      const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

      // Act
      await ctrl.createBuilding(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 409);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(
        res.send,
        sinon.match({ message: 'Another Building already exists with code=' + requestBody.buildingCode }),
      );
    });

    it('should return 503 if a database error occurs', async function() {
      // Arrange
      const requestBody = {
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TEST',
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
      buildingRepoMock.findByBuildingCode.rejects(new Error('Database error'));

      const buildingServiceInstance = Container.get('BuildingService');

      const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

      // Act
      await ctrl.createBuilding(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 503);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({ message: 'Database error' }));
    });

    it('should return 401 if a user is not authorized', async function() {
      // Arrange
      const requestBody = {
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TEST',
      };
      const req: Partial<Request> = {
        body: requestBody,
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const buildingServiceInstance = Container.get('BuildingService');

      // Force the service to throw an error
      sinon
        .stub(buildingServiceInstance, 'createBuilding')
        .throws(new Error('You are not authorized to perform this action'));

      const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

      // Act
      await ctrl.createBuilding(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
    });
  });

  describe('listBuildings', function() {
    beforeEach(function() {
      Container.reset();
      loggerMock = {
        error: sinon.stub(),
      };
      Container.set('logger', loggerMock);

      buildingRepoMock = {
        findAll: sinon.stub(),
      };
      Container.set('BuildingRepo', buildingRepoMock);

      const buildingServiceClass = require('../../src/services/ServicesImpl/buildingService').default;
      const buildingServiceInstance = Container.get(buildingServiceClass);
      Container.set('BuildingService', buildingServiceInstance);
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('BuildingController unit test using BuildingService stub', async function() {
      // Arrange
      const req: Partial<Request> = {};
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const buildingServiceInstance = Container.get('BuildingService');

      // Stub the createBuilding method in the BuildingService
      sinon
        .stub(buildingServiceInstance, 'listBuildings')
        .returns([
          BuildingDataSource.getBuildingAdto(),
          BuildingDataSource.getBuildingBdto(),
          BuildingDataSource.getBuildingCdto(),
        ]);

      const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

      // Act
      await ctrl.listBuildings(<Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match([
          BuildingDataSource.getBuildingAdto(),
          BuildingDataSource.getBuildingBdto(),
          BuildingDataSource.getBuildingCdto(),
        ]),
      );
    });

    it('BuildingController + BuildingService integration test', async function() {
      // Arrange
      const req: Partial<Request> = {};
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      buildingRepoMock.findAll.resolves([
        BuildingDataSource.getBuildingA(),
        BuildingDataSource.getBuildingB(),
        BuildingDataSource.getBuildingC(),
      ]);
      const buildingServiceInstance = Container.get('BuildingService');
      const buildingServiceSpy = sinon.spy(buildingServiceInstance, 'listBuildings');

      const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

      // Act
      await ctrl.listBuildings(<Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match([
          BuildingDataSource.getBuildingAdto(),
          BuildingDataSource.getBuildingBdto(),
          BuildingDataSource.getBuildingCdto(),
        ]),
      );
      sinon.assert.calledOnce(buildingServiceSpy);
    });
  });

  describe('editBuilding', function() {
    beforeEach(function() {
      Container.reset();
      loggerMock = {
        error: sinon.stub(),
      };
      Container.set('logger', loggerMock);

      buildingRepoMock = {
        findByDomainId: sinon.stub(),
        findByBuildingCode: sinon.stub(),
        save: sinon.stub(),
      };
      Container.set('BuildingRepo', buildingRepoMock);

      const buildingServiceClass = require('../../src/services/ServicesImpl/buildingService').default;
      const buildingServiceInstance = Container.get(buildingServiceClass);
      Container.set('BuildingService', buildingServiceInstance);
    });

    afterEach(function() {
      sandbox.restore();
    });

    describe('is successful', function() {
      it('in unit test using BuildingService stub', async function() {
        // Arrange
        const requestBody = {
          buildingName: 'Sample Building Name',
          buildingDimensions: { width: 5, length: 10 },
          buildingDescription: 'Sample Building Description',
        };
        const req: Partial<Request> = {
          body: requestBody,
        };
        const buildingId = '1';
        req.params = { id: buildingId };
        const res: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy(),
        };

        const buildingServiceInstance = Container.get('BuildingService');

        // Stub the createBuilding method in the BuildingService
        sinon.stub(buildingServiceInstance, 'editBuilding').returns(
          Result.ok<IBuildingDTO>({
            domainId: buildingId,
            buildingName: 'Sample Building Name',
            buildingDimensions: { width: 5, length: 10 },
            buildingDescription: 'Sample Building Description',
            buildingCode: 'TEST',
          }),
        );

        const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

        // Act
        await ctrl.editBuilding(<Request>req, <Response>res);

        // Assert
        sinon.assert.calledOnce(res.json);
        sinon.assert.calledWith(
          res.json,
          sinon.match({
            domainId: buildingId,
            buildingName: 'Sample Building Name',
            buildingDimensions: { width: 5, length: 10 },
            buildingDescription: 'Sample Building Description',
            buildingCode: 'TEST',
          }),
        );
      });

      describe('in integration test', function() {
        it('with a full update', async function() {
          // Arrange
          const requestBody = {
            buildingName: 'Updated Building Name',
            buildingDimensions: { width: 6, length: 6 },
            buildingDescription: 'Sample Building Description',
          };
          const req: Partial<Request> = {
            body: requestBody,
          };
          const buildingCode = 'A';
          const buildingId = '1';
          req.params = { id: buildingId };
          const res: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          // Stub repo methods
          buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());
          buildingRepoMock.save.resolves(
            Building.create(
              {
                buildingName: BuildingName.create(requestBody.buildingName).getValue(),
                buildingDimensions: BuildingDimensions.create(requestBody.buildingDimensions).getValue(),
                buildingDescription: BuildingDescription.create(requestBody.buildingDescription).getValue(),
                buildingCode: BuildingCode.create(buildingCode).getValue(),
              },
              new UniqueEntityID(buildingId),
            ).getValue(),
          );

          const buildingServiceInstance = Container.get('BuildingService');
          const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

          // Act
          await ctrl.editBuilding(<Request>req, <Response>res);

          // Assert
          sinon.assert.calledOnce(res.json);
          sinon.assert.calledWith(
            res.json,
            sinon.match({
              domainId: buildingId,
              buildingName: requestBody.buildingName,
              buildingDimensions: requestBody.buildingDimensions,
              buildingDescription: requestBody.buildingDescription,
              buildingCode: buildingCode,
            }),
          );
        });

        it('updating only the building name', async function() {
          // Arrange
          const requestBody = {
            buildingName: 'Updated Building Name',
            buildingDescription: 'Description A',
          };
          const req: Partial<Request> = {
            body: requestBody,
          };
          const buildingId = '1';
          req.params = { id: buildingId };
          const res: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };
          const building = BuildingDataSource.getBuildingA();

          // Stub repo methods
          buildingRepoMock.findByDomainId.resolves(building);
          buildingRepoMock.save.resolves(building);
          building.updateName(requestBody.buildingName);

          const buildingServiceInstance = Container.get('BuildingService');
          const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);
          const buildingServiceSpy = sinon.spy(buildingServiceInstance, 'editBuilding');

          // Act
          await ctrl.editBuilding(<Request>req, <Response>res);

          // Assert
          sinon.assert.calledOnce(res.json);
          sinon.assert.calledWith(
            res.json,
            sinon.match({
              buildingName: requestBody.buildingName,
              buildingDimensions: building.dimensions.props,
              buildingDescription: building.description.value,
              buildingCode: building.code.value,
              domainId: buildingId,
            }),
          );
          sinon.assert.calledOnce(buildingServiceSpy);
        });

        it('updating only the building description', async function() {
          // Arrange
          const requestBody = {
            buildingDescription: 'Updated Building Description',
            buildingName: 'Building A',
          };
          const req: Partial<Request> = {
            body: requestBody,
          };
          const buildingId = '1';
          req.params = { id: buildingId };
          const res: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };
          const building = BuildingDataSource.getBuildingA();

          // Stub repo methods
          buildingRepoMock.findByDomainId.resolves(building);
          buildingRepoMock.save.resolves(building);
          building.updateDescription(requestBody.buildingDescription);

          const buildingServiceInstance = Container.get('BuildingService');
          const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);
          const buildingServiceSpy = sinon.spy(buildingServiceInstance, 'editBuilding');

          // Act
          await ctrl.editBuilding(<Request>req, <Response>res);

          // Assert
          sinon.assert.calledOnce(res.json);
          sinon.assert.calledWith(
            res.json,
            sinon.match({
              buildingName: building.name.value,
              buildingDimensions: building.dimensions.props,
              buildingDescription: requestBody.buildingDescription,
              buildingCode: building.code.value,
              domainId: buildingId,
            }),
          );
          sinon.assert.calledOnce(buildingServiceSpy);
        });

        it('updating only the building dimensions', async function() {
          // Arrange
          const requestBody = {
            buildingDimensions: { width: 6, length: 6 },
            buildingName: 'Building A',
            buildingDescription: 'Description A',
          };
          const req: Partial<Request> = {
            body: requestBody,
          };
          const buildingId = '1';
          req.params = { id: buildingId };
          const res: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };
          const building = BuildingDataSource.getBuildingA();
          const buildingDimensions = BuildingDimensions.create(requestBody.buildingDimensions).getValue();

          // Stub repo methods
          buildingRepoMock.findByDomainId.resolves(building);
          buildingRepoMock.save.resolves(building);
          building.dimensions = buildingDimensions;

          const buildingServiceInstance = Container.get('BuildingService');
          const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);
          const buildingServiceSpy = sinon.spy(buildingServiceInstance, 'editBuilding');

          // Act
          await ctrl.editBuilding(<Request>req, <Response>res);

          // Assert
          sinon.assert.calledOnce(res.json);
          sinon.assert.calledWith(
            res.json,
            sinon.match({
              buildingName: building.name.value,
              buildingDimensions: requestBody.buildingDimensions,
              buildingDescription: building.description.value,
              buildingCode: building.code.value,
              domainId: buildingId,
            }),
          );
          sinon.assert.calledOnce(buildingServiceSpy);
        });

        it('updating only the length of the building dimensions', async function() {
          // Arrange
          const requestBody = {
            buildingDimensions: { length: 6 },
            buildingName: 'Building A',
            buildingDescription: 'Description A',
          };
          const req: Partial<Request> = {
            body: requestBody,
          };
          const buildingId = '1';
          req.params = { id: buildingId };
          const res: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };
          const building = BuildingDataSource.getBuildingA();

          // Stub repo methods
          buildingRepoMock.findByDomainId.resolves(building);
          buildingRepoMock.save.resolves(building);

          const buildingServiceInstance = Container.get('BuildingService');
          const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);
          const buildingServiceSpy = sinon.spy(buildingServiceInstance, 'editBuilding');

          // Act
          await ctrl.editBuilding(<Request>req, <Response>res);

          // Assert
          sinon.assert.calledOnce(res.json);
          sinon.assert.calledWith(
            res.json,
            sinon.match({
              buildingName: building.name.value,
              buildingDimensions: {
                width: building.dimensions.props.width,
                length: requestBody.buildingDimensions.length,
              },
              buildingDescription: building.description.value,
              buildingCode: building.code.value,
              domainId: buildingId,
            }),
          );
          sinon.assert.calledOnce(buildingServiceSpy);
        });

        it('updating only the width of the building dimensions', async function() {
          // Arrange
          const requestBody = {
            buildingDimensions: { width: 6 },
            buildingName: 'Building A',
            buildingDescription: 'Description A',
          };
          const req: Partial<Request> = {
            body: requestBody,
          };
          const buildingId = '1';
          req.params = { id: buildingId };
          const res: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };
          const building = BuildingDataSource.getBuildingA();

          // Stub repo methods
          buildingRepoMock.findByDomainId.resolves(building);
          buildingRepoMock.save.resolves(building);

          const buildingServiceInstance = Container.get('BuildingService');
          const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);
          const buildingServiceSpy = sinon.spy(buildingServiceInstance, 'editBuilding');

          // Act
          await ctrl.editBuilding(<Request>req, <Response>res);

          // Assert
          sinon.assert.calledOnce(res.json);
          sinon.assert.calledWith(
            res.json,
            sinon.match({
              buildingName: building.name.value,
              buildingDimensions: {
                width: requestBody.buildingDimensions.width,
                length: building.dimensions.props.length,
              },
              buildingDescription: building.description.value,
              buildingCode: building.code.value,
              domainId: buildingId,
            }),
          );
          sinon.assert.calledOnce(buildingServiceSpy);
        });

        it('updating the building name and description', async function() {
          // Arrange
          const requestBody = {
            buildingName: 'Updated Building Name',
            buildingDescription: 'Updated Building Description',
          };
          const req: Partial<Request> = {
            body: requestBody,
          };
          const buildingId = '1';
          req.params = { id: buildingId };
          const res: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };
          const building = BuildingDataSource.getBuildingA();

          // Stub repo methods
          buildingRepoMock.findByDomainId.resolves(building);
          buildingRepoMock.save.resolves(building);
          building.updateName(requestBody.buildingName);
          building.updateDescription(requestBody.buildingDescription);

          const buildingServiceInstance = Container.get('BuildingService');
          const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

          // Act
          await ctrl.editBuilding(<Request>req, <Response>res);

          // Assert
          sinon.assert.calledOnce(res.json);
          sinon.assert.calledWith(
            res.json,
            sinon.match({
              buildingName: requestBody.buildingName,
              buildingDimensions: building.dimensions.props,
              buildingDescription: requestBody.buildingDescription,
              buildingCode: building.code.value,
              domainId: buildingId,
            }),
          );
        });
      });
    });

    describe('is failure', function() {
      describe('in unit test', function() {
        it('where service returns failure because building does not exist', async function() {
          // Arrange
          const requestBody = {
            buildingName: 'Sample Building Name',
            buildingDimensions: { width: 5, length: 10 },
            buildingDescription: 'Sample Building Description',
            buildingCode: 'TEST',
          };
          const req: Partial<Request> = {
            body: requestBody,
          };
          const buildingId = '1';
          req.params = { id: buildingId };
          const res: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          const buildingServiceInstance = Container.get('BuildingService');

          // Stub the createBuilding method in the BuildingService
          sinon
            .stub(buildingServiceInstance, 'editBuilding')
            .returns(Result.fail<IBuildingDTO>('Building does not exist.', FailureType.EntityDoesNotExist));

          const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

          // Act
          await ctrl.editBuilding(<Request>req, <Response>res);
          const expectedResponse = {
            message: 'Building does not exist.',
          };

          // Assert
          sinon.assert.calledOnce(res.status);
          sinon.assert.calledWith(res.status, 404);
          sinon.assert.calledOnce(res.send);
          sinon.assert.calledWith(res.send, expectedResponse);
        });

        it('where service returns failure because building name already exists', async function() {
          // Arrange
          const requestBody = {
            buildingName: 'Sample Building Name',
            buildingDimensions: { width: 5, length: 10 },
            buildingDescription: 'Sample Building Description',
            buildingCode: 'TEST',
          };
          const req: Partial<Request> = {
            body: requestBody,
          };
          const buildingId = '1';
          req.params = { id: buildingId };
          const res: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          const buildingServiceInstance = Container.get('BuildingService');

          // Stub the createBuilding method in the BuildingService
          sinon
            .stub(buildingServiceInstance, 'editBuilding')
            .returns(
              Result.fail<IBuildingDTO>(
                `Another Building already exists with name=${requestBody.buildingName}`,
                FailureType.EntityAlreadyExists,
              ),
            );

          const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

          // Act
          await ctrl.editBuilding(<Request>req, <Response>res);
          const expectedResponse = {
            message: `Another Building already exists with name=${requestBody.buildingName}`,
          };

          // Assert
          sinon.assert.calledOnce(res.status);
          sinon.assert.calledWith(res.status, 409);
          sinon.assert.calledOnce(res.send);
          sinon.assert.calledWith(res.send, expectedResponse);
        });

        it('where service returns failure because building code already exists', async function() {
          // Arrange
          const requestBody = {
            buildingName: 'Sample Building Name',
            buildingDimensions: { width: 5, length: 10 },
            buildingDescription: 'Sample Building Description',
            buildingCode: 'TEST',
          };
          const req: Partial<Request> = {
            body: requestBody,
          };
          const buildingId = '1';
          req.params = { id: buildingId };
          const res: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          const buildingServiceInstance = Container.get('BuildingService');

          // Stub the createBuilding method in the BuildingService
          sinon
            .stub(buildingServiceInstance, 'editBuilding')
            .returns(
              Result.fail<IBuildingDTO>(
                `Another Building already exists with code=${requestBody.buildingCode}`,
                FailureType.EntityAlreadyExists,
              ),
            );

          const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

          // Act
          await ctrl.editBuilding(<Request>req, <Response>res);
          const expectedResponse = {
            message: `Another Building already exists with code=${requestBody.buildingCode}`,
          };

          // Assert
          sinon.assert.calledOnce(res.status);
          sinon.assert.calledWith(res.status, 409);
          sinon.assert.calledOnce(res.send);
          sinon.assert.calledWith(res.send, expectedResponse);
        });

        it('where service returns failure because of invalid input', async function() {
          // Arrange
          const requestBody = {
            buildingName: 'Inv@lid--',
            buildingDimensions: { width: 5, length: 10 },
            buildingDescription: 'Sample Building Description',
            buildingCode: 'TEST',
          };
          const req: Partial<Request> = {
            body: requestBody,
          };
          const buildingId = '1';
          req.params = { id: buildingId };
          const res: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          const buildingServiceInstance = Container.get('BuildingService');

          // Stub the createBuilding method in the BuildingService
          sinon
            .stub(buildingServiceInstance, 'editBuilding')
            .returns(
              Result.fail<IBuildingDTO>(
                'Building Name can only contain alphanumeric characters and spaces.',
                FailureType.InvalidInput,
              ),
            );

          const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

          // Act
          await ctrl.editBuilding(<Request>req, <Response>res);
          const expectedResponse = {
            message: 'Building Name can only contain alphanumeric characters and spaces.',
          };

          // Assert
          sinon.assert.calledOnce(res.status);
          sinon.assert.calledWith(res.status, 400);
          sinon.assert.calledOnce(res.send);
          sinon.assert.calledWith(res.send, expectedResponse);
        });

        it('where service returns failure because of database error', async function() {
          // Arrange
          const requestBody = {
            buildingName: 'Sample Building Name',
            buildingDimensions: { width: 5, length: 10 },
            buildingDescription: 'Sample Building Description',
            buildingCode: 'TEST',
          };
          const req: Partial<Request> = {
            body: requestBody,
          };
          const buildingId = '1';
          req.params = { id: buildingId };
          const res: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          const buildingServiceInstance = Container.get('BuildingService');

          // Stub the createBuilding method in the BuildingService
          sinon
            .stub(buildingServiceInstance, 'editBuilding')
            .returns(Result.fail<IBuildingDTO>('Database error', FailureType.DatabaseError));

          const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

          // Act
          await ctrl.editBuilding(<Request>req, <Response>res);
          const expectedResponse = {
            message: 'Database error',
          };

          // Assert
          sinon.assert.calledOnce(res.status);
          sinon.assert.calledWith(res.status, 503);
          sinon.assert.calledOnce(res.send);
          sinon.assert.calledWith(res.send, expectedResponse);
        });

        it('should return 401 if a user is not authorized', async function() {
          // Arrange
          const requestBody = {
            buildingName: 'Sample Building Name',
            buildingDimensions: { width: 5, length: 10 },
            buildingDescription: 'Sample Building Description',
          };
          const req: Partial<Request> = {
            body: requestBody,
          };
          const buildingId = '1';
          req.params = { id: buildingId };
          const res: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };
          const building = BuildingDataSource.getBuildingA();

          // Force the service to throw an error
          const buildingServiceInstance = Container.get('BuildingService');
          sinon
            .stub(buildingServiceInstance, 'editBuilding')
            .throws(new Error('You are not authorized to perform this action'));
          const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

          // Act
          await ctrl.editBuilding(<Request>req, <Response>res);

          // Assert
          sinon.assert.calledOnce(res.status);
          sinon.assert.calledWith(res.status, 401);
          sinon.assert.calledOnce(res.send);
          sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
        });
      });

      describe('in integration test', function() {
        it('where building does not exist', async function() {
          // Arrange
          const requestBody = {
            buildingName: 'Sample Building Name',
            buildingDimensions: { width: 5, length: 10 },
            buildingDescription: 'Sample Building Description',
          };
          const req: Partial<Request> = {
            body: requestBody,
          };
          const buildingId = '1';
          req.params = { id: buildingId };
          const res: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          // Stub repo methods
          buildingRepoMock.findByDomainId.resolves(null);
          const buildingServiceInstance = Container.get('BuildingService');

          const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

          // Act
          await ctrl.editBuilding(<Request>req, <Response>res);
          const expectedResponse = {
            message: 'Building does not exist.',
          };

          // Assert
          sinon.assert.calledOnce(res.status);
          sinon.assert.calledWith(res.status, 404);
          sinon.assert.calledOnce(res.send);
          sinon.assert.calledWith(res.send, expectedResponse);
        });

        it('where building name is invalid', async function() {
          // Arrange
          const requestBody = {
            buildingName: 'Inv@lid--',
            buildingDimensions: { width: 5, length: 10 },
            buildingDescription: 'Sample Building Description',
          };
          const req: Partial<Request> = {
            body: requestBody,
          };
          const buildingId = '2';
          req.params = { id: buildingId };
          const res: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          // Stub repo methods
          buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingB());
          buildingRepoMock.findByBuildingCode.resolves(BuildingDataSource.getBuildingA());
          const buildingServiceInstance = Container.get('BuildingService');

          const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

          // Act
          await ctrl.editBuilding(<Request>req, <Response>res);
          const expectedResponse = {
            message: 'Building Name can only contain alphanumeric characters and spaces.',
          };

          // Assert
          sinon.assert.calledOnce(res.status);
          sinon.assert.calledWith(res.status, 400);
          sinon.assert.calledOnce(res.send);
          sinon.assert.calledWith(res.send, expectedResponse);
        });

        it('where database error occurs', async function() {
          // Arrange
          const requestBody = {
            buildingName: 'Building B',
            buildingDimensions: { width: 5, length: 10 },
            buildingDescription: 'Sample Building Description',
          };
          const req: Partial<Request> = {
            body: requestBody,
          };
          const buildingId = '2';
          req.params = { id: buildingId };
          const res: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          // Stub repo methods
          buildingRepoMock.findByDomainId.rejects(new Error('Database error'));
          const buildingServiceInstance = Container.get('BuildingService');

          const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

          // Act
          await ctrl.editBuilding(<Request>req, <Response>res);
          const expectedResponse = {
            message: 'Database error',
          };

          // Assert
          sinon.assert.calledOnce(res.status);
          sinon.assert.calledWith(res.status, 503);
          sinon.assert.calledOnce(res.send);
          sinon.assert.calledWith(res.send, expectedResponse);
        });
      });
    });
  });

  describe('findWithMinAndMaxFloors', function() {
    beforeEach(function() {
      Container.reset();
      loggerMock = {
        error: sinon.stub(),
      };
      Container.set('logger', loggerMock);

      buildingRepoMock = {
        findWithMinAndMaxFloors: sinon.stub(),
      };
      Container.set('BuildingRepo', buildingRepoMock);

      const buildingServiceClass = require('../../src/services/ServicesImpl/buildingService').default;
      const buildingServiceInstance = Container.get(buildingServiceClass);
      Container.set('BuildingService', buildingServiceInstance);
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('BuildingController unit test using BuildingService stub', async function() {
      // Arrange
      const req: Partial<Request> = {
        query: {
          minFloors: '1',
          maxFloors: '3',
        },
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      const buildingServiceInstance = Container.get('BuildingService');

      // Stub the createBuilding method in the BuildingService
      sinon
        .stub(buildingServiceInstance, 'listBuildingsWithMinAndMaxFloors')
        .returns([
          BuildingDataSource.getBuildingAdto(),
          BuildingDataSource.getBuildingBdto(),
          BuildingDataSource.getBuildingCdto(),
        ]);

      const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

      // Act
      await ctrl.listBuildingsWithMinAndMaxFloors(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match([
          BuildingDataSource.getBuildingAdto(),
          BuildingDataSource.getBuildingBdto(),
          BuildingDataSource.getBuildingCdto(),
        ]),
      );
    });

    it('BuildingController + BuildingService integration test', async function() {
      // Arrange
      const req: Partial<Request> = {
        query: {
          minFloors: '1',
          maxFloors: '3',
        },
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      buildingRepoMock.findWithMinAndMaxFloors.resolves([
        BuildingDataSource.getBuildingA(),
        BuildingDataSource.getBuildingB(),
        BuildingDataSource.getBuildingC(),
      ]);
      const buildingServiceInstance = Container.get('BuildingService');
      const buildingServiceSpy = sinon.spy(buildingServiceInstance, 'listBuildingsWithMinAndMaxFloors');

      const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

      // Act
      await ctrl.listBuildingsWithMinAndMaxFloors(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(
        res.json,
        sinon.match([
          BuildingDataSource.getBuildingAdto(),
          BuildingDataSource.getBuildingBdto(),
          BuildingDataSource.getBuildingCdto(),
        ]),
      );
      sinon.assert.calledOnce(buildingServiceSpy);
    });

    it('BuildingController should return 503 if database error occurs', async function() {
      // Arrange
      const req: Partial<Request> = {
        query: {
          minFloors: '1',
          maxFloors: '3',
        },
      };
      const res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Stub repo methods
      buildingRepoMock.findWithMinAndMaxFloors.rejects(new Error('Database error'));

      const buildingServiceInstance = Container.get('BuildingService');
      const ctrl = new BuildingController(buildingServiceInstance as IBuildingService);

      // Act
      await ctrl.listBuildingsWithMinAndMaxFloors(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 503);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, 'Database error');
    });
  });
});
