import 'reflect-metadata';
import * as sinon from 'sinon';
import {expect, use} from 'chai';

import FloorService from '../../../src/services/ServicesImpl/floorService';
import BuildingDataSource from '../../datasource/buildingDataSource';
import FloorDataSource from '../../datasource/floorDataSource';
import {Floor} from '../../../src/domain/floor/floor';
import {FloorNumber} from "../../../src/domain/floor/floorNumber";
import {FloorDescription} from "../../../src/domain/floor/floorDescription";
import {UniqueEntityID} from "../../../src/core/domain/UniqueEntityID";


describe('FloorService', () => {
  const sandbox = sinon.createSandbox();


  describe('createFloor', () => {
    // service
    let floorService: FloorService;

    // stubs
    let loggerMock: any;
    let buildingServiceMock: any;
    let floorRepoMock: any;
    let floorPlanValidatorMock: any;
    let floorFactoryMock: any;
    let floorMapCalculatorMock: any;

    // stub the building from the data source
    let buildingFromDataSource: any;

    // stub the floor from the data source
    let floorFromDataSource: any;

    beforeEach(() => {
      // stub logger
      loggerMock = {
        error: sinon.stub(),
      };

      // stub building service
      buildingServiceMock = {
        verifyBuildingExists: sinon.stub(),
      };

      // stub floor repo
      floorRepoMock = {
        save: sinon.stub(),
        findByDomainId: sinon.stub(),
        findByFloorNumberAndBuildingId: sinon.stub(),
      };

      // stub floor plan validator
      floorPlanValidatorMock = {};

      // stub floor factory
      floorFactoryMock = {
        createFloor: sinon.stub(),
      };

      // stub floor map calculator
      floorMapCalculatorMock = {};

      // stub building from data source
      buildingFromDataSource = BuildingDataSource.getBuildingA();

      // stub floor from data source
      floorFromDataSource = FloorDataSource.getFirstFloor();

      floorService =
        new FloorService(floorRepoMock, buildingServiceMock, floorPlanValidatorMock, floorFactoryMock, floorMapCalculatorMock, loggerMock);
    });


    afterEach(() => {
      sandbox.restore();
    });


    it('should create a floor successfully with all fields', async () => {
      // Arrange
      const floorDto = {
        domainId: "domainId",
        buildingId: buildingFromDataSource.id,
        floorNumber: 12,
        floorDescription: 'floor description',
      };

      // Mock the buildingService return value
      buildingServiceMock.verifyBuildingExists.resolves(buildingFromDataSource);

      // Mock the floorFactory return value
      floorFactoryMock.createFloor.resolves(
        Floor.create(
          {
            building: buildingFromDataSource,
            floorNumber: FloorNumber.create(floorDto.floorNumber).getValue(),
            floorDescription: FloorDescription.create(floorDto.floorDescription).getValue(),
          },
          new UniqueEntityID(floorDto.domainId),
        ).getValue(),
      );

      // Act
      const result = await floorService.createBuildingFloor(floorDto);

      // Assert
      expect(result.isSuccess).to.be.true;
      expect(result.getValue().domainId).to.equal(floorDto.domainId);
      expect(result.getValue().floorNumber).to.equal(floorDto.floorNumber);
      expect(result.getValue().floorDescription).to.equal(floorDto.floorDescription);
    });


    it('should create a floor successfully with no floorDescription', async () => {
      // Arrange
      const floorDto = {
        domainId: "domainId",
        buildingId: buildingFromDataSource.id,
        floorNumber: 12,
      };

      // Mock the buildingService return value
      buildingServiceMock.verifyBuildingExists.resolves(buildingFromDataSource);

      // Mock the floorFactory return value
      floorFactoryMock.createFloor.resolves(
        Floor.create(
          {
            building: buildingFromDataSource,
            floorNumber: FloorNumber.create(floorDto.floorNumber).getValue(),
          },
          new UniqueEntityID(floorDto.domainId),
        ).getValue(),
      );

      // Act
      const result = await floorService.createBuildingFloor(floorDto);

      // Assert
      expect(result.isSuccess).to.be.true;
      expect(result.getValue().domainId).to.equal(floorDto.domainId);
      expect(result.getValue().floorNumber).to.equal(floorDto.floorNumber);
    });


    it('should fail to create a floor with invalid building domainId', async () => {
      // Arrange
      const floorDto = {
        domainId: "domainId",
        buildingId: "buildingDoesNotExist",
        floorNumber: 1,
      };

      // Mock the buildingService return value
      buildingServiceMock.verifyBuildingExists.resolves(null);

      // Act
      const result = await floorService.createBuildingFloor(floorDto);

      // Assert
      expect(result.isSuccess).to.be.false;
    });


    it('should fail to create a floor when domainId is already in use', async () => {
      // Arrange
      const floorDto = {
        domainId: "domainId",
        buildingId: buildingFromDataSource.id,
        floorNumber: 12,
      };

      // Mock the buildingService return value
      buildingServiceMock.verifyBuildingExists.resolves(buildingFromDataSource);

      // Mock the floorRepo return value
      floorRepoMock.findByDomainId.resolves(floorFromDataSource);

      // Act
      const result = await floorService.createBuildingFloor(floorDto);

      // Assert
      expect(result.isSuccess).to.be.false;
    });


    it('should fail to create a floor when there is already a floor with that number for the building', async () => {
      // Arrange
      const floorDto = {
        domainId: "domainId",
        buildingId: buildingFromDataSource.id,
        floorNumber: 1,
      };

      // Mock the buildingService return value
      buildingServiceMock.verifyBuildingExists.resolves(buildingFromDataSource);

      // Mock the floorRepo return value
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(floorFromDataSource);

      // Act
      const result = await floorService.createBuildingFloor(floorDto);

      // Assert
      expect(result.isSuccess).to.be.false;
    });
  });


  describe('editFloor', () => {
    // service
    let floorService: FloorService;

    // stubs
    let loggerMock: any;
    let buildingServiceMock: any;
    let floorRepoMock: any;
    let floorPlanValidatorMock: any;
    let floorFactoryMock: any;
    let floorMapCalculatorMock: any;


    beforeEach(() => {
      // stub logger
      loggerMock = {
        error: sinon.stub(),
      };

      // stub building service
      buildingServiceMock = {};

      // stub floor repo
      floorRepoMock = {
        save: sinon.stub(),
        findByDomainId: sinon.stub(),
        findByFloorNumberAndBuildingId: sinon.stub(),
      };

      // stub floor plan validator
      floorPlanValidatorMock = {
        isFloorPlanValid: sinon.stub(),
      };

      // stub floor factory
      floorFactoryMock = {};

      // stub floor map calculator
      floorMapCalculatorMock = {};

      floorService =
        new FloorService(floorRepoMock, buildingServiceMock, floorPlanValidatorMock, floorFactoryMock, floorMapCalculatorMock, loggerMock);
    });


    afterEach(() => {
      sandbox.restore();
    });


    it('should edit a floor successfully when no field is altered', async () => {
      // Arrange
      const floorDto = FloorDataSource.getFirstFloorDto();
      const floorId = floorDto.domainId;
      const floor = FloorDataSource.getFirstFloor();

      floorDto.floorNumber = null;
      floorDto.floorDescription = null;
      floorDto.floorPlan = null;

      // Mock the floorRepo return value
      floorRepoMock.findByDomainId.resolves(floor);

      // Act
      const result = await floorService.updateBuildingFloor(floorId, floorDto);

      // Assert
      expect(result.isSuccess).to.be.true;
    });


    it('should edit a floor successfully with floorNumber and floorDescription', async () => {
      // Arrange
      const floorDto = FloorDataSource.getFirstFloorDto();
      const floorId = floorDto.domainId;
      const floor = FloorDataSource.getFirstFloor();

      floorDto.floorNumber = 2;
      floorDto.floorDescription = 'Description floor 2';

      // Mock the floorRepo return value
      floorRepoMock.findByDomainId.resolves(floor);
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      // Act
      const result = await floorService.updateBuildingFloor(floorId, floorDto);

      // Assert
      expect(result.isSuccess).to.be.true;
      expect(result.getValue().floorNumber).to.equal(floorDto.floorNumber);
      expect(result.getValue().floorDescription).to.equal(floorDto.floorDescription);
    });


    it('should edit a floor successfully with only floorNumber to update', async () => {
      // Arrange
      const floorDto = FloorDataSource.getFirstFloorDto();
      const floorId = floorDto.domainId;
      const floor = FloorDataSource.getFirstFloor();

      floorDto.floorNumber = 2;

      // Mock the floorRepo return value
      floorRepoMock.findByDomainId.resolves(floor);
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      // Act
      const result = await floorService.updateBuildingFloor(floorId, floorDto);

      // Assert
      expect(result.isSuccess).to.be.true;
      expect(result.getValue().floorNumber).to.equal(floorDto.floorNumber);
    });


    it('should edit a floor successfully with only floorDescription to update', async () => {
      // Arrange
      const floorDto = FloorDataSource.getFirstFloorDto();
      const floorId = floorDto.domainId;
      const floor = FloorDataSource.getFirstFloor();

      floorDto.floorDescription = 'Description floor 2';

      // Mock the floorRepo return value
      floorRepoMock.findByDomainId.resolves(floor);

      // Act
      const result = await floorService.updateBuildingFloor(floorId, floorDto);

      // Assert
      expect(result.isSuccess).to.be.true;
      expect(result.getValue().floorDescription).to.equal(floorDto.floorDescription);
    });


    it('should edit a floor successfully, loading the floorPlan', async () => {
      // Arrange
      const floorDto = FloorDataSource.getFirstFloorDto();
      const floorId = floorDto.domainId;
      const floor = FloorDataSource.getFirstFloor();

      floorDto.floorPlan = {
        // PlanFloorNumber must be the same as the floorNumber
        planFloorNumber: 1,
        planFloorSize: {
          // Width is the one from the building the floor belongs to, plus 1
          width: 6,
          // Height is the one from the building the floor belongs to, plus 1
          height: 11,
        },
        floorPlanGrid: [],
        floorWallTexture: 'wallTexture.jpg',
        floorDoorTexture: 'doorTexture.jpg',
        floorElevatorTexture: 'elevatorTexture.jpg',
      }

      // Mock the floorRepo return value
      floorRepoMock.findByDomainId.resolves(floor);

      // Mock the floorPlanValidator return value
      floorPlanValidatorMock.isFloorPlanValid.returns(true);

      // Act
      const result = await floorService.updateBuildingFloor(floorId, floorDto);

      // Assert
      expect(result.isSuccess).to.be.true;
      expect(result.getValue().floorPlan.planFloorNumber).to.equal(floorDto.floorPlan.planFloorNumber);
      expect(result.getValue().floorPlan.planFloorSize.width).to.equal(floorDto.floorPlan.planFloorSize.width);
      expect(result.getValue().floorPlan.planFloorSize.height).to.equal(floorDto.floorPlan.planFloorSize.height);
    });


    it('should edit a floor successfully, loading the floorPlan and updating the floorNumber', async () => {
      // Arrange
      const floorDto = FloorDataSource.getFirstFloorDto();
      const floorId = floorDto.domainId;
      const floor = FloorDataSource.getFirstFloor();

      floorDto.floorNumber = 13;
      floorDto.floorPlan = {
        planFloorNumber: 13,
        planFloorSize: {
          // Width is the one from the building the floor belongs to, plus 1
          width: 6,
          // Height is the one from the building the floor belongs to, plus 1
          height: 11,
        },
        floorPlanGrid: [],
        floorWallTexture: 'wallTexture.jpg',
        floorDoorTexture: 'doorTexture.jpg',
        floorElevatorTexture: 'elevatorTexture.jpg',
      }

      // Mock the floorRepo return value
      floorRepoMock.findByDomainId.resolves(floor);
      floorRepoMock.findByFloorNumberAndBuildingId.resolves(null);

      // Mock the floorPlanValidator return value
      floorPlanValidatorMock.isFloorPlanValid.returns(true);

      // Act
      const result = await floorService.updateBuildingFloor(floorId, floorDto);

      // Assert
      expect(result.isSuccess).to.be.true;
      expect(result.getValue().floorNumber).to.equal(floorDto.floorNumber);
      expect(result.getValue().floorPlan.planFloorNumber).to.equal(floorDto.floorPlan.planFloorNumber);
      expect(result.getValue().floorPlan.planFloorSize.width).to.equal(floorDto.floorPlan.planFloorSize.width);
      expect(result.getValue().floorPlan.planFloorSize.height).to.equal(floorDto.floorPlan.planFloorSize.height);
    });


    it('should edit a floor successfully, loading the floorPlan and updating the floorDescription', async () => {
      // Arrange
      const floorDto = FloorDataSource.getFirstFloorDto();
      const floorId = floorDto.domainId;
      const floor = FloorDataSource.getFirstFloor();

      floorDto.floorDescription = 'Description floor 1';
      floorDto.floorPlan = {
        planFloorNumber: 1,
        planFloorSize: {
          // Width is the one from the building the floor belongs to, plus 1
          width: 6,
          // Height is the one from the building the floor belongs to, plus 1
          height: 11,
        },
        floorPlanGrid: [],
        floorWallTexture: 'wallTexture1.jpg',
        floorDoorTexture: 'doorTexture1.jpg',
        floorElevatorTexture: 'elevatorTexture1.jpg',
      }

      // Mock the floorRepo return value
      floorRepoMock.findByDomainId.resolves(floor);

      // Mock the floorPlanValidator return value
      floorPlanValidatorMock.isFloorPlanValid.returns(true);

      // Act
      const result = await floorService.updateBuildingFloor(floorId, floorDto);

      // Assert
      expect(result.isSuccess).to.be.true;
      expect(result.getValue().floorDescription).to.equal(floorDto.floorDescription);
      expect(result.getValue().floorPlan.planFloorNumber).to.equal(floorDto.floorPlan.planFloorNumber);
      expect(result.getValue().floorPlan.planFloorSize.width).to.equal(floorDto.floorPlan.planFloorSize.width);
      expect(result.getValue().floorPlan.planFloorSize.height).to.equal(floorDto.floorPlan.planFloorSize.height);
    });


    it('should fail edit a floor when the floor to update does not exist', async () => {
      // Arrange
      const floorDto = FloorDataSource.getFirstFloorDto();
      const floorId = "Non existent floor id"
      const floor = FloorDataSource.getFirstFloor();

      // To update the floor number
      floorDto.floorNumber = 2;

      // Mock the floorRepo return value to a floor that does not exist
      floorRepoMock.findByDomainId.resolves(null);

      // Act
      const result = await floorService.updateBuildingFloor(floorId, floorDto);

      // Assert
      expect(result.isSuccess).to.be.false;
    });


    it('should fail edit a floor when the floorNumber is already in use', async () => {
      // Arrange
      const floorDto = FloorDataSource.getFirstFloorDto();
      const floorId = floorDto.domainId;
      const floor = FloorDataSource.getFirstFloor();

      const floorThatAlreadyExists = FloorDataSource.getSecondFloor();

      floorDto.floorNumber = 2;

      // Mock the floorRepo return value
      floorRepoMock.findByDomainId.resolves(floor);
      // Mock the floorRepo return value to a floor that already exists
      floorRepoMock.findByFloorNumberAndBuildingId.returns(floorThatAlreadyExists);

      // Act
      const result = await floorService.updateBuildingFloor(floorId, floorDto);

      // Assert
      expect(result.isSuccess).to.be.false;
    });


    it('should fail edit a floor when the floorPlan is invalid', async () => {
      // Arrange
      const floorDto = FloorDataSource.getFirstFloorDto();
      const floorId = floorDto.domainId;
      const floor = FloorDataSource.getFirstFloor();

      floorDto.floorPlan = {
        planFloorNumber: 35,
        planFloorSize: {
          // Width is the one from the building the floor belongs to, plus 1
          width: 6,
          // Height is the one from the building the floor belongs to, plus 1
          height: 11,
        },
        floorPlanGrid: [],
        floorWallTexture: 'wallTexture.jpg',
        floorDoorTexture: 'doorTexture.jpg',
        floorElevatorTexture: 'elevatorTexture.jpg',
      }

      // Mock the floorRepo return value
      floorRepoMock.findByDomainId.resolves(floor);

      // Mock the floorPlanValidator return value
      floorPlanValidatorMock.isFloorPlanValid.returns(false);

      // Act
      const result = await floorService.updateBuildingFloor(floorId, floorDto);

      // Assert
      expect(result.isSuccess).to.be.false;
    });
  });


  describe('listAllFloors', () => {
    // service
    let floorService: FloorService;

    // stubs
    let loggerMock: any;
    let buildingServiceMock: any;
    let floorRepoMock: any;
    let floorPlanValidatorMock: any;
    let floorFactoryMock: any;
    let floorMapCalculatorMock: any;

    beforeEach(() => {
      // stub logger
      loggerMock = {
        error: sinon.stub(),
      };

      // stub building service
      buildingServiceMock = {
      };

      // stub floor repo
      floorRepoMock = {
        findAll: sinon.stub(),
      };

      // stub floor plan validator
      floorPlanValidatorMock = {};

      // stub floor factory
      floorFactoryMock = {};

      // stub floor map calculator
      floorMapCalculatorMock = {};

      floorService =
        new FloorService(floorRepoMock, buildingServiceMock, floorPlanValidatorMock, floorFactoryMock, floorMapCalculatorMock, loggerMock);
    });


    afterEach(() => {
      sandbox.restore();
    });


    it('should list all floors', async () => {
      // Arrange
      const floor = FloorDataSource.getFirstFloor();
      const floor2 = FloorDataSource.getSecondFloor();
      const floor3 = FloorDataSource.getThirdFloor();
      const floor4 = FloorDataSource.getFourthFloor();
      const floor5 = FloorDataSource.getFifthFloor();

      const floors = [floor, floor2, floor3, floor4, floor5];

      // Mock the floorRepo return value
      floorRepoMock.findAll.resolves(floors);

      // Act
      const result = await floorService.listFloors();

      // Assert
      expect(result).to.have.lengthOf(5);
      expect(result[0].domainId).to.equal(floor.id.toString());
      expect(result[1].domainId).to.equal(floor2.id.toString());
      expect(result[2].domainId).to.equal(floor3.id.toString());
      expect(result[3].domainId).to.equal(floor4.id.toString());
      expect(result[4].domainId).to.equal(floor5.id.toString());
    });


    it('should list when there are no floors ([])', async () => {
      // Arrange
      const floors = [];

      // Mock the floorRepo return value
      floorRepoMock.findAll.resolves(floors);

      // Act
      const result = await floorService.listFloors();

      // Assert
      expect(result).to.be.empty;
    });
  });


  describe('listBuildingFloors', () => {
    // service
    let floorService: FloorService;

    // stubs
    let loggerMock: any;
    let buildingServiceMock: any;
    let floorRepoMock: any;
    let floorPlanValidatorMock: any;
    let floorFactoryMock: any;
    let floorMapCalculatorMock: any;

    beforeEach(() => {
      // stub logger
      loggerMock = {
        error: sinon.stub(),
      };

      // stub building service
      buildingServiceMock = {
        verifyBuildingExists: sinon.stub(),
      };

      // stub floor repo
      floorRepoMock = {
        findByBuildingId: sinon.stub(),
      };

      // stub floor plan validator
      floorPlanValidatorMock = {};

      // stub floor factory
      floorFactoryMock = {};

      // stub floor map calculator
      floorMapCalculatorMock = {};

      floorService =
        new FloorService(floorRepoMock, buildingServiceMock, floorPlanValidatorMock, floorFactoryMock, floorMapCalculatorMock, loggerMock);
    });


    afterEach(() => {
      sandbox.restore();
    });


    it('should list all floors from a building', async () => {
      // Arrange
      const buildingId = BuildingDataSource.getBuildingA().id.toString();

      // Two floors from the same building
      const floor = FloorDataSource.getFirstFloor();
      const floor5 = FloorDataSource.getFifthFloor();

      const floors = [floor, floor5];

      // Mock the buildingService return value
      buildingServiceMock.verifyBuildingExists.resolves(true);

      // Mock the floorRepo return value
      floorRepoMock.findByBuildingId.resolves(floors);

      // Act
      const result = await floorService.listBuildingFloors(buildingId);

      // Assert
      expect(result.getValue()).to.have.lengthOf(2);
      expect(result.getValue()[0].domainId).to.equal(floor.id.toString());
      expect(result.getValue()[1].domainId).to.equal(floor5.id.toString());
    });


    it('should list when there are no floors for a building ([])', async () => {
      // Arrange
      const buildingId = "No floors for me";

      const floors = [];

      // Mock the buildingService return value
      buildingServiceMock.verifyBuildingExists.resolves(true);

      // Mock the floorRepo return value
      floorRepoMock.findByBuildingId.resolves(floors);

      // Act
      const result = await floorService.listBuildingFloors(buildingId);

      // Assert
      expect(result.getValue()).to.be.empty;
    });
  });


  describe('listFloorsWithPassage', () => {
    // service
    let floorService: FloorService;

    // stubs
    let loggerMock: any;
    let buildingServiceMock: any;
    let floorRepoMock: any;
    let floorPlanValidatorMock: any;
    let floorFactoryMock: any;
    let floorMapCalculatorMock: any;

    beforeEach(() => {
      // stub logger
      loggerMock = {
        error: sinon.stub(),
      };

      // stub building service
      buildingServiceMock = {
        verifyBuildingExists: sinon.stub(),
      };

      // stub floor repo
      floorRepoMock = {
        findFloorsWithPassageByBuildingId: sinon.stub(),
      };

      // stub floor plan validator
      floorPlanValidatorMock = {};

      // stub floor factory
      floorFactoryMock = {};

      // stub floor map calculator
      floorMapCalculatorMock = {};

      floorService =
        new FloorService(floorRepoMock, buildingServiceMock, floorPlanValidatorMock, floorFactoryMock, floorMapCalculatorMock, loggerMock);
    });


    afterEach(() => {
      sandbox.restore();
    });


    it('should list all floors from a building with passage', async () => {
      // Arrange
      const buildingId = BuildingDataSource.getBuildingA().id.toString();

      // Two floors from the same building
      const floor = FloorDataSource.getFirstFloor();

      const floors = [floor];

      // Mock the buildingService return value
      buildingServiceMock.verifyBuildingExists.resolves(true);

      // Mock the floorRepo return value
      floorRepoMock.findFloorsWithPassageByBuildingId.resolves(floors);

      // Act
      const result = await floorService.listFloorsWithPassageByBuildingId(buildingId);

      // Assert
      expect(result.getValue()).to.have.lengthOf(1);
      expect(result.getValue()[0].domainId).to.equal(floor.id.toString());
    });


    it('should list when there are no floors for a building with passage ([])', async () => {
      // Arrange
      const buildingId = "No floors for me";

      const floors = [];

      // Mock the buildingService return value
      buildingServiceMock.verifyBuildingExists.resolves(true);

      // Mock the floorRepo return value
      floorRepoMock.findFloorsWithPassageByBuildingId.resolves(floors);

      // Act
      const result = await floorService.listFloorsWithPassageByBuildingId(buildingId);

      // Assert
      expect(result.getValue()).to.be.empty;
    });
  });


  describe('listFloorsWithElevator', () => {
    // service
    let floorService: FloorService;

    // stubs
    let loggerMock: any;
    let buildingServiceMock: any;
    let floorRepoMock: any;
    let floorPlanValidatorMock: any;
    let floorFactoryMock: any;
    let floorMapCalculatorMock: any;

    beforeEach(() => {
      // stub logger
      loggerMock = {
        error: sinon.stub(),
      };

      // stub building service
      buildingServiceMock = {
        verifyBuildingExists: sinon.stub(),
      };

      // stub floor repo
      floorRepoMock = {
        findFloorsWithElevatorByBuildingId: sinon.stub(),
      };

      // stub floor plan validator
      floorPlanValidatorMock = {};

      // stub floor factory
      floorFactoryMock = {};

      // stub floor map calculator
      floorMapCalculatorMock = {};

      floorService =
        new FloorService(floorRepoMock, buildingServiceMock, floorPlanValidatorMock, floorFactoryMock, floorMapCalculatorMock, loggerMock);
    });


    afterEach(() => {
      sandbox.restore();
    });


    it('should list all floors from a building with elevator', async () => {
      // Arrange
      const buildingId = BuildingDataSource.getBuildingA().id.toString();

      // Two floors from the same building
      const floor = FloorDataSource.getFirstFloor();

      const floors = [floor];

      // Mock the buildingService return value
      buildingServiceMock.verifyBuildingExists.resolves(true);

      // Mock the floorRepo return value
      floorRepoMock.findFloorsWithElevatorByBuildingId.resolves(floors);

      // Act
      const result = await floorService.listFloorsWithElevatorByBuildingId(buildingId);

      // Assert
      expect(result.getValue()).to.have.lengthOf(1);
      expect(result.getValue()[0].domainId).to.equal(floor.id.toString());
    });


    it('should list when there are no floors for a building with elevator ([])', async () => {
      // Arrange
      const buildingId = "No floors for me";

      const floors = [];

      // Mock the buildingService return value
      buildingServiceMock.verifyBuildingExists.resolves(true);

      // Mock the floorRepo return value
      floorRepoMock.findFloorsWithElevatorByBuildingId.resolves(floors);

      // Act
      const result = await floorService.listFloorsWithElevatorByBuildingId(buildingId);

      // Assert
      expect(result.getValue()).to.be.empty;
    });
  });
});