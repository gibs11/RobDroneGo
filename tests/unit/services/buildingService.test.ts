import { expect, use } from 'chai';
import sinon from 'sinon';
import BuildingService from '../../../src/services/ServicesImpl/buildingService';
import BuildingDataSource from '../../datasource/buildingDataSource';
import { BuildingMap } from '../../../src/mappers/BuildingMap';
import chaiAsPromised from 'chai-as-promised';
import { FailureType } from '../../../src/core/logic/Result';

use(chaiAsPromised);

describe('BuildingService', () => {
  let buildingRepoMock;
  let loggerMock;
  let buildingService;

  describe('createBuilding', () => {
    beforeEach(() => {
      buildingRepoMock = {
        findByBuildingCode: sinon.stub(),
        findByDomainId: sinon.stub(),
        save: sinon.stub(),
      };
      loggerMock = {
        error: sinon.stub(),
      };
      buildingService = new BuildingService(buildingRepoMock, loggerMock);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should create a building successfully', async () => {
      // Arrange
      const buildingDTO = {
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TEST',
      };
      buildingRepoMock.findByBuildingCode.resolves(null);

      // Act
      const result = await buildingService.createBuilding(buildingDTO);

      // Assert
      expect(result.isSuccess).to.be.true;

      // Restore the stubs
      sinon.restore();
    });

    it('should create a building successfully with no building name', async () => {
      // Arrange
      const buildingDTO = {
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TEST',
      };
      buildingRepoMock.findByBuildingCode.resolves(null);

      // Act
      const result = await buildingService.createBuilding(buildingDTO);

      // Assert
      expect(result.isSuccess).to.be.true;

      // Restore the stubs
      sinon.restore();
    });

    it('should fail to create a building with an existing code', async () => {
      // Arrange
      const buildingDTO = {
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TEST',
      };
      buildingRepoMock.findByBuildingCode.resolves(BuildingMap.toDomain(buildingDTO));
      buildingDTO.buildingName = 'TEST2';

      // Act
      const result = await buildingService.createBuilding(buildingDTO);

      // Assert
      expect(result.isFailure).to.be.true;
      expect(result.error).to.equal(`Another Building already exists with code=${buildingDTO.buildingCode}`);
    });

    it('should fail to create a building with an invalid building name', async () => {
      // Arrange
      const buildingDTO = {
        buildingName: '%%%',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TEST',
      };
      buildingRepoMock.findByBuildingCode.resolves(null);

      // Act
      const result = await buildingService.createBuilding(buildingDTO);

      // Assert
      expect(result.isFailure).to.be.true;
    });

    it('should fail to create a building with an invalid building code', async () => {
      // Arrange
      const buildingDTO = {
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: '%%%$',
      };
      buildingRepoMock.findByBuildingCode.resolves(null);

      // Act
      const result = await buildingService.createBuilding(buildingDTO);

      // Assert
      expect(result.isFailure).to.be.true;
    });

    it('should fail to create a building with an invalid building dimensions', async () => {
      // Arrange
      const buildingDTO = {
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: -5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TEST',
      };
      buildingRepoMock.findByBuildingCode.resolves(null);

      // Act
      const result = await buildingService.createBuilding(buildingDTO);

      // Assert
      expect(result.isFailure).to.be.true;
    });

    it('should fail to create a building with an invalid building description', async () => {
      // Arrange
      const buildingDTO = {
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: '%%%$',
        buildingCode: 'TEST',
      };
      buildingRepoMock.findByBuildingCode.resolves(null);

      // Act
      const result = await buildingService.createBuilding(buildingDTO);

      // Assert
      expect(result.isFailure).to.be.true;
    });

    it('should fail to create a building with a database error', async () => {
      // Arrange
      const buildingDTO = {
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TEST',
      };
      buildingRepoMock.findByBuildingCode.rejects(new Error('Simulated error'));

      // Act
      const result = await buildingService.createBuilding(buildingDTO);

      // Assert
      expect(result.isFailure).to.be.true;
    });

    it('should fail to create a building with Building.Create() throwing a TypeError', async () => {
      // Arrange
      const buildingDTO = {
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TEST',
      };
      buildingRepoMock.findByBuildingCode.resolves(null);
      sinon.stub(BuildingMap, 'toDomain').throws(new TypeError('Simulated error'));

      // Act
      const result = await buildingService.createBuilding(buildingDTO);

      // Assert
      expect(result.isFailure).to.be.true;
    });

    it('should fail to create a building with a an existing id', async () => {
      // Arrange
      const buildingDTO = {
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TESTA',
        domainId: '123',
      };
      buildingRepoMock.findByBuildingCode.resolves(null);
      buildingRepoMock.findByDomainId.resolves(BuildingMap.toDomain(buildingDTO));

      // Act
      const result = await buildingService.createBuilding(buildingDTO);

      // Assert
      expect(result.isFailure).to.be.true;
      expect(result.error).to.equal(`Another Building already exists with id=${buildingDTO.domainId}`);
    });
  });

  describe('listBuildings', () => {
    beforeEach(() => {
      buildingRepoMock = {
        findAll: sinon.stub(),
      };
      loggerMock = {
        error: sinon.stub(),
      };
      buildingService = new BuildingService(buildingRepoMock, loggerMock);
    });

    it('should list buildings successfully', async () => {
      // Arrange
      const buildingOne = BuildingDataSource.getBuildingA();
      const buildingTwo = BuildingDataSource.getBuildingB();
      const buildingThree = BuildingDataSource.getBuildingC();
      buildingRepoMock.findAll.resolves([buildingOne, buildingTwo, buildingThree]);

      // Act
      const buildings = await buildingService.listBuildings();

      // Assert
      expect(buildings.length).to.equal(3);

      // Restore the stubs
      sinon.restore();
    });

    it('should fail to list buildings', async () => {
      // Arrange
      buildingRepoMock.findAll.rejects(new Error('Simulated error'));

      // Act & Assert that the error was thrown
      await expect(buildingService.listBuildings()).to.eventually.be.rejectedWith('Simulated error');

      // Restore the stubs
      sinon.restore();
    });
  });

  describe('editBuilding', () => {
    beforeEach(() => {
      buildingRepoMock = {
        findByBuildingCode: sinon.stub(),
        findByDomainId: sinon.stub(),
        save: sinon.stub(),
      };
      loggerMock = {
        error: sinon.stub(),
      };
      buildingService = new BuildingService(buildingRepoMock, loggerMock);
    });

    describe('is successful', () => {
      it('with a full update', async () => {
        // Arrange
        let buildingDTO = BuildingDataSource.getBuildingAdto();
        const initId = buildingDTO.domainId;
        const building = BuildingDataSource.getBuildingA();

        // Mock the repo methods
        buildingRepoMock.findByDomainId.resolves(building);
        buildingRepoMock.save.resolves(building);
        buildingDTO = BuildingDataSource.getBuildingBdto();
        buildingDTO.domainId = initId;
        buildingDTO.buildingCode = null;

        // Act
        const result = await buildingService.editBuilding(initId, buildingDTO);

        // Assert
        expect(result.isSuccess).to.be.true;
        expect(result.getValue().buildingName).to.equal(buildingDTO.buildingName);
        expect(result.getValue().buildingCode).to.equal(building.code.value);
        expect(result.getValue().buildingDescription).to.equal(buildingDTO.buildingDescription);
        expect(result.getValue().buildingDimensions.length).to.equal(buildingDTO.buildingDimensions.length);
        expect(result.getValue().buildingDimensions.width).to.equal(buildingDTO.buildingDimensions.width);

        // Restore the stubs
        sinon.restore();
      });

      it('when only changing the name', async () => {
        // Arrange
        const buildingDTO = BuildingDataSource.getBuildingAdto();
        const initId = buildingDTO.domainId;
        const building = BuildingDataSource.getBuildingA();

        // Mock the repo methods
        buildingRepoMock.findByDomainId.resolves(building);
        buildingRepoMock.save.resolves(building);
        buildingDTO.buildingName = 'New Name';
        buildingDTO.buildingCode = null;
        buildingDTO.buildingDescription = 'Description A';
        buildingDTO.buildingDimensions = null;

        // Act
        const result = await buildingService.editBuilding(initId, buildingDTO);

        // Assert
        expect(result.isSuccess).to.be.true;
        expect(result.getValue().buildingName).to.equal(buildingDTO.buildingName);
        expect(result.getValue().buildingCode).to.equal(building.code.value);
        expect(result.getValue().buildingDescription).to.equal(building.description.value);
        expect(result.getValue().buildingDimensions.length).to.equal(building.dimensions.length);
        expect(result.getValue().buildingDimensions.width).to.equal(building.dimensions.width);

        // Restore the stubs
        sinon.restore();
      });

      it('when only changing the description', async () => {
        // Arrange
        const buildingDTO = BuildingDataSource.getBuildingAdto();
        const initId = buildingDTO.domainId;
        const building = BuildingDataSource.getBuildingA();

        // Mock the repo methods
        buildingRepoMock.findByDomainId.resolves(building);
        buildingRepoMock.save.resolves(building);
        buildingDTO.buildingName = 'Building A';
        buildingDTO.buildingCode = null;
        buildingDTO.buildingDescription = 'New Description';
        buildingDTO.buildingDimensions = null;

        // Act
        const result = await buildingService.editBuilding(initId, buildingDTO);

        // Assert
        expect(result.isSuccess).to.be.true;
        expect(result.getValue().buildingName).to.equal(building.name.value);
        expect(result.getValue().buildingCode).to.equal(building.code.value);
        expect(result.getValue().buildingDescription).to.equal(buildingDTO.buildingDescription);
        expect(result.getValue().buildingDimensions.length).to.equal(building.dimensions.length);
        expect(result.getValue().buildingDimensions.width).to.equal(building.dimensions.width);

        // Restore the stubs
        sinon.restore();
      });

      it('when only changing the dimensions', async () => {
        // Arrange
        const buildingDTO = BuildingDataSource.getBuildingAdto();
        const initId = buildingDTO.domainId;
        const building = BuildingDataSource.getBuildingA();

        // Mock the repo methods
        buildingRepoMock.findByDomainId.resolves(building);
        buildingRepoMock.save.resolves(building);
        buildingDTO.buildingName = 'Building A';
        buildingDTO.buildingCode = null;
        buildingDTO.buildingDescription = 'Description A';
        buildingDTO.buildingDimensions = { width: 10, length: 20 };

        // Act
        const result = await buildingService.editBuilding(initId, buildingDTO);

        // Assert
        expect(result.isSuccess).to.be.true;
        expect(result.getValue().buildingName).to.equal(building.name.value);
        expect(result.getValue().buildingCode).to.equal(building.code.value);
        expect(result.getValue().buildingDescription).to.equal(building.description.value);
        expect(result.getValue().buildingDimensions.length).to.equal(buildingDTO.buildingDimensions.length);
        expect(result.getValue().buildingDimensions.width).to.equal(buildingDTO.buildingDimensions.width);

        // Restore the stubs
        sinon.restore();
      });
    });

    describe('is a failure', () => {
      it('with an invalid building name', async () => {
        // Arrange
        const buildingDTO = BuildingDataSource.getBuildingAdto();
        const initId = buildingDTO.domainId;
        const building = BuildingMap.toDomain(buildingDTO);
        buildingDTO.buildingName = '%%%$';

        // Mock the repo methods
        buildingRepoMock.findByDomainId.resolves(building);
        buildingRepoMock.save.resolves(building);

        // Act
        const result = await buildingService.editBuilding(initId, buildingDTO);

        // Assert
        expect(result.isFailure).to.be.true;
        expect(result.failureType).to.equal(FailureType.InvalidInput);
      });

      it('with an invalid building dimensions', async () => {
        // Arrange
        const buildingDTO = BuildingDataSource.getBuildingAdto();
        const initId = buildingDTO.domainId;
        const building = BuildingMap.toDomain(buildingDTO);
        buildingDTO.buildingDimensions = { width: -5, length: 10 };

        // Mock the repo methods
        buildingRepoMock.findByBuildingCode.resolves(null);
        buildingRepoMock.findByDomainId.resolves(building);
        buildingRepoMock.save.resolves(building);

        // Act
        const result = await buildingService.editBuilding(initId, buildingDTO);

        // Assert
        expect(result.isFailure).to.be.true;
        expect(result.failureType).to.equal(FailureType.InvalidInput);
      });

      it('with an invalid building description', async () => {
        // Arrange
        const buildingDTO = BuildingDataSource.getBuildingAdto();
        const initId = buildingDTO.domainId;
        const building = BuildingMap.toDomain(buildingDTO);
        buildingDTO.buildingDescription = '%%%$';

        // Mock the repo methods
        buildingRepoMock.findByBuildingCode.resolves(null);
        buildingRepoMock.findByDomainId.resolves(building);
        buildingRepoMock.save.resolves(building);

        // Act
        const result = await buildingService.editBuilding(initId, buildingDTO);

        // Assert
        expect(result.isFailure).to.be.true;
        expect(result.failureType).to.equal(FailureType.InvalidInput);
      });

      it('when a building does not exist', async () => {
        // Arrange
        const initId = '200';
        const buildingDTO = BuildingDataSource.getBuildingAdto();

        // Mock the repo methods
        buildingRepoMock.findByBuildingCode.resolves(null);
        buildingRepoMock.findByDomainId.resolves(null);
        buildingRepoMock.save.resolves(null);

        // Act
        const result = await buildingService.editBuilding(initId, buildingDTO);

        // Assert
        expect(result.isFailure).to.be.true;
        expect(result.failureType).to.equal(FailureType.EntityDoesNotExist);
      });

      it('when a database error occurs', async () => {
        // Arrange
        const initId = '200';
        const buildingDTO = BuildingDataSource.getBuildingAdto();

        // Mock the repo methods
        buildingRepoMock.findByBuildingCode.resolves(null);
        buildingRepoMock.findByDomainId.rejects(new Error('Simulated error'));
        buildingRepoMock.save.resolves(null);

        // Act
        const result = await buildingService.editBuilding(initId, buildingDTO);

        // Assert
        expect(result.isFailure).to.be.true;
        expect(result.failureType).to.equal(FailureType.DatabaseError);
      });
    });
  });

  describe('listBuildingsWithMinAndMaxFloors', () => {
    beforeEach(() => {
      buildingRepoMock = {
        findWithMinAndMaxFloors: sinon.stub(),
      };
      loggerMock = {
        error: sinon.stub(),
      };
      buildingService = new BuildingService(buildingRepoMock, loggerMock);
    });

    it('should list buildings with min and max floors successfully', async () => {
      // Arrange
      const buildingOne = BuildingDataSource.getBuildingA();
      const buildingTwo = BuildingDataSource.getBuildingB();
      const buildingThree = BuildingDataSource.getBuildingC();
      buildingRepoMock.findWithMinAndMaxFloors.resolves([buildingOne, buildingTwo, buildingThree]);

      // Act
      const buildings = await buildingService.listBuildingsWithMinAndMaxFloors(1, 10);

      // Assert
      expect(buildings.length).to.equal(3);

      // Restore the stubs
      sinon.restore();
    });

    it('should fail to list buildings with min and max floors', async () => {
      // Arrange
      buildingRepoMock.findWithMinAndMaxFloors.rejects(new Error('Simulated error'));

      // Act & Assert that the error was thrown
      await expect(buildingService.listBuildingsWithMinAndMaxFloors(1, 10)).to.eventually.be.rejectedWith(
        'Simulated error',
      );

      // Restore the stubs
      sinon.restore();
    });
  });

  describe('verifyBuildingExists', () => {
    beforeEach(() => {
      buildingRepoMock = {
        findByDomainId: sinon.stub(),
      };
      loggerMock = {
        error: sinon.stub(),
      };
      buildingService = new BuildingService(buildingRepoMock, loggerMock);
    });

    it('should return true when a building exists', async () => {
      // Arrange
      const building = BuildingDataSource.getBuildingA();
      buildingRepoMock.findByDomainId.resolves(building);

      // Act
      const result = await buildingService.verifyBuildingExists(building.id);

      // Assert
      expect(result.isSuccess).to.be.true;

      // Restore the stubs
      sinon.restore();
    });

    it('should return false when a building does not exist', async () => {
      // Arrange
      buildingRepoMock.findByDomainId.resolves(null);

      // Act
      const result = await buildingService.verifyBuildingExists('123');

      // Assert
      expect(result == null).to.be.true;

      // Restore the stubs
      sinon.restore();
    });
  });
});
