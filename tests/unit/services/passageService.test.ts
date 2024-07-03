import 'reflect-metadata';
import * as sinon from 'sinon';
import {expect} from 'chai';
import PassageService from '../../../src/services/ServicesImpl/passageService';
import FloorDataSource from '../../datasource/floorDataSource';
import {Passage} from "../../../src/domain/passage/passage";
import {Coordinates} from "../../../src/domain/common/coordinates";
import {PassagePoint} from "../../../src/domain/passage/passagePoint";
import {UniqueEntityID} from "../../../src/core/domain/UniqueEntityID";
import PassageDataSource from "../../datasource/passageDataSource";

describe('PassageService', () => {
  const sandbox = sinon.createSandbox();

  describe('createPassage', () => {
    // service
    let passageService: PassageService;

    // stubs
    let loggerMock: any;
    let passageRepoMock: any;
    let passageBuilderMock: any;
    let floorRepoMock: any;
    let buildingRepoMock: any;
    let positionCheckerMock: any;

    // stub the building from the data source
    let buildingFromDataSource: any;

    // stub the building from the data source
    let buildingFromRepository: any;

    beforeEach(() => {
      // stub logger
      loggerMock = {
        error: sinon.stub(),
      };

      passageRepoMock = {
        save: sinon.stub(),
        findByDomainId: sinon.stub(),
        findByFloors: sinon.stub(),
        isTherePassageBetweenFloorAndBuilding: sinon.stub(),
      };

      floorRepoMock = {
        findByDomainId: sinon.stub(),
      };

      buildingRepoMock = {
        findByDomainId: sinon.stub(),
      };

      positionCheckerMock = {
        isPositionAvailable: sinon.stub(),
      };

      passageBuilderMock = {
        withStartPointFloor: sinon.stub().returnsThis(),
        withEndPointFloor: sinon.stub().returnsThis(),
        withPassageDTO: sinon.stub().returnsThis(),
        build: sinon.stub()
      };

      passageService = new PassageService(passageRepoMock, floorRepoMock, buildingRepoMock, positionCheckerMock, passageBuilderMock, loggerMock);
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('success', () => {
      it('should create a passage successfully', async () => {
        // Arrange
        const passageDto = {
          domainId: 'domainId',
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
        };

        passageRepoMock.findByDomainId.resolves(null);
        passageRepoMock.findByFloors.resolves(null);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.resolves(false);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
        positionCheckerMock.isPositionAvailable.onCall(0).resolves(true);
        positionCheckerMock.isPositionAvailable.onCall(1).resolves(true);
        positionCheckerMock.isPositionAvailable.onCall(2).resolves(true);
        positionCheckerMock.isPositionAvailable.onCall(3).resolves(true);

        // Mock the builder return value
        passageBuilderMock.build.resolves(Passage.create({
              passageStartPoint: PassagePoint.create({
                floor: FloorDataSource.getFirstFloor(),
                firstCoordinates: Coordinates.create({
                  x: 0,
                  y: 0,
                }).getValue(),
                lastCoordinates: Coordinates.create({
                  x: 0,
                  y: 1,
                }).getValue(),
              }).getValue(),
              passageEndPoint: PassagePoint.create({
                floor: FloorDataSource.getSecondFloor(),
                firstCoordinates: Coordinates.create({
                  x: 0,
                  y: 0,
                }).getValue(),
                lastCoordinates: Coordinates.create({
                  x: 0,
                  y: 1,
                }).getValue(),
              }).getValue(),
            },
            new UniqueEntityID(passageDto.domainId),
          ).getValue(),
        );

        // Act
        const result = await passageService.createPassage(passageDto);

        // Assert
        expect(result.isSuccess).to.be.true;
        expect(result.getValue().domainId).to.equal(passageDto.domainId);
        expect(result.getValue().passageStartPoint.floor.domainId).to.equal(passageDto.passageStartPoint.floorId);
        expect(result.getValue().passageEndPoint.floor.domainId).to.equal(passageDto.passageEndPoint.floorId);
        expect(result.getValue().passageStartPoint.firstCoordinates.x).to.equal(passageDto.passageStartPoint.firstCoordinates.x);
        expect(result.getValue().passageStartPoint.firstCoordinates.y).to.equal(passageDto.passageStartPoint.firstCoordinates.y);
        expect(result.getValue().passageStartPoint.lastCoordinates.x).to.equal(passageDto.passageStartPoint.lastCoordinates.x)
        expect(result.getValue().passageStartPoint.lastCoordinates.y).to.equal(passageDto.passageStartPoint.lastCoordinates.y);
        expect(result.getValue().passageEndPoint.firstCoordinates.x).to.equal(passageDto.passageEndPoint.firstCoordinates.x);
        expect(result.getValue().passageEndPoint.firstCoordinates.y).to.equal(passageDto.passageEndPoint.firstCoordinates.y);
        expect(result.getValue().passageEndPoint.lastCoordinates.x).to.equal(passageDto.passageEndPoint.lastCoordinates.x);
        expect(result.getValue().passageEndPoint.lastCoordinates.y).to.equal(passageDto.passageEndPoint.lastCoordinates.y);
      });
    });

    describe('failure', () => {
      it('should fail to create a passage because the passage already exists', async () => {
        // Arrange
        const passageDto = {
          domainId: 'domainId',
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
        };

        passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());

        const result = await passageService.createPassage(passageDto);

        expect(result.isSuccess).to.be.false;
      });

      it('should fail to create a passage because the startPointFloor is not found', async () => {
        // Arrange
        const passageDto = {
          domainId: 'domainId',
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
        };

        passageRepoMock.findByDomainId.resolves(null);
        floorRepoMock.findByDomainId.onCall(0).resolves(null);

        const result = await passageService.createPassage(passageDto);

        expect(result.isSuccess).to.be.false;
      });

      it('should fail to create a passage because the endPointFloor is not found', async () => {
        // Arrange
        const passageDto = {
          domainId: 'domainId',
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
        };

        passageRepoMock.findByDomainId.resolves(null);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(null);

        const result = await passageService.createPassage(passageDto);

        expect(result.isSuccess).to.be.false;
      });

      it('should fail to create a passage because the passage already exists between the floors', async () => {
        // Arrange
        const passageDto = {
          domainId: 'domainId',
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
        };

        passageRepoMock.findByDomainId.resolves(null);
        passageRepoMock.findByFloors.resolves(PassageDataSource.getPassageA());
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());

        const result = await passageService.createPassage(passageDto);

        expect(result.isSuccess).to.be.false;
      });

      it('should fail to create a passage that already exists between floor and building (startpoint)', async () => {
        // Arrange
        const passageDto = {
          domainId: 'domainId',
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
          passageEndPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
        };

        passageRepoMock.findByDomainId.resolves(null);
        passageRepoMock.findByFloors.resolves(null);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(true);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getFirstFloor());

        const result = await passageService.createPassage(passageDto);

        expect(result.isSuccess).to.be.false;
      });

      it('should fail to create a passage that already exists between floor and building (endpoint)', async () => {
        // Arrange
        const passageDto = {
          domainId: 'domainId',
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
          passageEndPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
        };

        passageRepoMock.findByDomainId.resolves(null);
        passageRepoMock.findByFloors.resolves(null);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(true);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getFirstFloor());

        const result = await passageService.createPassage(passageDto);

        expect(result.isSuccess).to.be.false;
      });

      it('should fail if the position is not available (startPoint firstCoordinates)', async () => {
        // Arrange
        const passageDto = {
          domainId: 'domainId',
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
        };

        passageRepoMock.findByDomainId.resolves(null);
        passageRepoMock.findByFloors.resolves(null);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.resolves(false);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
        positionCheckerMock.isPositionAvailable.onCall(0).resolves(false);

        const result = await passageService.createPassage(passageDto);

        expect(result.isSuccess).to.be.false;
      });

      it('should fail if the position is not available (startPoint lastCoordinates)', async () => {
        // Arrange
        const passageDto = {
          domainId: 'domainId',
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
        };

        passageRepoMock.findByDomainId.resolves(null);
        passageRepoMock.findByFloors.resolves(null);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.resolves(false);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
        positionCheckerMock.isPositionAvailable.onCall(0).resolves(true);
        positionCheckerMock.isPositionAvailable.onCall(1).resolves(false);

        const result = await passageService.createPassage(passageDto);

        expect(result.isSuccess).to.be.false;
      });

      it('should fail if the position is not available (endPoint firstCoordinates)', async () => {
        // Arrange
        const passageDto = {
          domainId: 'domainId',
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
        };

        passageRepoMock.findByDomainId.resolves(null);
        passageRepoMock.findByFloors.resolves(null);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.resolves(false);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
        positionCheckerMock.isPositionAvailable.onCall(0).resolves(true);
        positionCheckerMock.isPositionAvailable.onCall(1).resolves(true);
        positionCheckerMock.isPositionAvailable.onCall(2).resolves(false);

        const result = await passageService.createPassage(passageDto);

        expect(result.isSuccess).to.be.false;
      });

      it('should fail if the position is not available (endPoint lastCoordinates)', async () => {
        // Arrange
        const passageDto = {
          domainId: 'domainId',
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0,
            },
            lastCoordinates: {
              x: 0,
              y: 1,
            },
          },
        };

        passageRepoMock.findByDomainId.resolves(null);
        passageRepoMock.findByFloors.resolves(null);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.resolves(false);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
        positionCheckerMock.isPositionAvailable.onCall(0).resolves(true);
        positionCheckerMock.isPositionAvailable.onCall(1).resolves(true);
        positionCheckerMock.isPositionAvailable.onCall(2).resolves(true);
        positionCheckerMock.isPositionAvailable.onCall(3).resolves(false);

        const result = await passageService.createPassage(passageDto);

        expect(result.isSuccess).to.be.false;
      });
    });
  });

  describe('editPassage', () => {
    // service
    let passageService: PassageService;

    // stubs
    let loggerMock: any;
    let passageRepoMock: any;
    let passageBuilderMock: any;
    let floorRepoMock: any;
    let buildingRepoMock: any;
    let positionCheckerMock: any;

    // stub the building from the data source
    let buildingFromDataSource: any;

    // stub the building from the data source
    let buildingFromRepository: any;

    beforeEach(() => {
      // stub logger
      loggerMock = {
        error: sinon.stub(),
      };

      passageRepoMock = {
        save: sinon.stub(),
        findByDomainId: sinon.stub(),
        findByFloors: sinon.stub(),
        isTherePassageBetweenFloorAndBuilding: sinon.stub(),
      };

      floorRepoMock = {
        findByDomainId: sinon.stub(),
      };

      buildingRepoMock = {
        findByDomainId: sinon.stub(),
      };

      positionCheckerMock = {
        isPositionAvailable: sinon.stub(),
      };

      passageBuilderMock = {
        withStartPointFloor: sinon.stub().returnsThis(),
        withEndPointFloor: sinon.stub().returnsThis(),
        withPassageDTO: sinon.stub().returnsThis(),
        build: sinon.stub()
      };

      passageService = new PassageService(passageRepoMock, floorRepoMock, buildingRepoMock, positionCheckerMock, passageBuilderMock, loggerMock);
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('success', () => {
      it('should edit a passage successfully when no attribute was changed', async () => {
        const passageDto = PassageDataSource.getPassageADTO()
        const passageId = passageDto.domainId;
        const passage = PassageDataSource.getPassageA();

        passageDto.passageStartPoint = undefined;
        passageDto.passageEndPoint = undefined;

        passageRepoMock.findByDomainId.resolves(passage);

        // Act
        const result = await passageService.editPassage(passageId, passageDto);

        // Assert
        expect(result.isSuccess).to.be.true;
      });
    });
    describe('failure', () => {
      it('should not edit if the passage is not found', async () => {
        const passageDto = PassageDataSource.getPassageADTO()
        const passageId = passageDto.domainId;

        passageRepoMock.findByDomainId.resolves(null);

        // Act
        const result = await passageService.editPassage(passageId, passageDto);

        // Assert
        expect(result.isSuccess).to.be.false;
      });
    });
  });
  describe('listPassagesBetweenBuildings', () => {
    // service
    let passageService: PassageService;

    // stubs
    let loggerMock: any;
    let passageRepoMock: any;
    let passageBuilderMock: any;
    let floorRepoMock: any;
    let buildingRepoMock: any;
    let positionCheckerMock: any;

    // stub the building from the data source
    let buildingFromDataSource: any;

    // stub the building from the data source
    let buildingFromRepository: any;

    beforeEach(() => {
      // stub logger
      loggerMock = {
        error: sinon.stub(),
      };

      passageRepoMock = {
        findPassagesBetweenBuildings: sinon.stub(),
      };

      floorRepoMock = {
        findByDomainId: sinon.stub(),
      };

      buildingRepoMock = {
        findByDomainId: sinon.stub(),
      };

      positionCheckerMock = {
        isPositionAvailable: sinon.stub(),
      };

      passageBuilderMock = {
        withStartPointFloor: sinon.stub().returnsThis(),
        withEndPointFloor: sinon.stub().returnsThis(),
        withPassageDTO: sinon.stub().returnsThis(),
        build: sinon.stub()
      };

      passageService = new PassageService(passageRepoMock, floorRepoMock, buildingRepoMock, positionCheckerMock, passageBuilderMock, loggerMock);
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('success', () => {
      it('should list passages between buildings successfully', async () => {
        const firstBuildingId = '1';
        const secondBuildingId = '2';

        const passages = [PassageDataSource.getPassageA()];

        buildingRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor().building);
        buildingRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor().building);
        passageRepoMock.findPassagesBetweenBuildings.resolves(passages);

        // Act
        const result = await passageService.listPassagesBetweenBuildings(firstBuildingId, secondBuildingId);

        // Assert
        expect(result.getValue().length).to.equal(1);
        expect(result.getValue()[0].domainId).to.equal(passages[0].id.toString());
        expect(result.getValue()[0].passageStartPoint.floor.domainId).to.equal(passages[0].startPoint.floor.id.toString());
        expect(result.getValue()[0].passageEndPoint.floor.domainId).to.equal(passages[0].endPoint.floor.id.toString());
        expect(result.getValue()[0].passageStartPoint.firstCoordinates.x).to.equal(passages[0].startPoint.firstCoordinates.x);
        expect(result.getValue()[0].passageStartPoint.firstCoordinates.y).to.equal(passages[0].startPoint.firstCoordinates.y);
        expect(result.getValue()[0].passageStartPoint.lastCoordinates.x).to.equal(passages[0].startPoint.lastCoordinates.x)
        expect(result.getValue()[0].passageStartPoint.lastCoordinates.y).to.equal(passages[0].startPoint.lastCoordinates.y);
        expect(result.getValue()[0].passageEndPoint.firstCoordinates.x).to.equal(passages[0].endPoint.firstCoordinates.x);
        expect(result.getValue()[0].passageEndPoint.firstCoordinates.y).to.equal(passages[0].endPoint.firstCoordinates.y);
        expect(result.getValue()[0].passageEndPoint.lastCoordinates.x).to.equal(passages[0].endPoint.lastCoordinates.x);
        expect(result.getValue()[0].passageEndPoint.lastCoordinates.y).to.equal(passages[0].endPoint.lastCoordinates.y);
      });
    });
  });
});
