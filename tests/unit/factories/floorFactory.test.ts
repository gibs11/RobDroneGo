import { expect } from 'chai';
import * as sinon from 'sinon';
import FloorFactory  from '../../../src/factories/floorFactory';
import BuildingDataSource from "../../datasource/buildingDataSource";

describe('floorFactory', () => {
  // Create sinon sandbox for isolating tests
  const sandbox = sinon.createSandbox();

  // Building for the floor
  let buildingData;

  let buildingRepoMock;
  let floorFactory;

  beforeEach(() => {
    buildingData = BuildingDataSource.getBuildingA();

    buildingRepoMock = {
      findByDomainId: sinon.stub(),
    }

    floorFactory = new FloorFactory(buildingRepoMock);
  });

  afterEach(() => {
    sandbox.restore();
    sinon.restore();
  });

  it('should create a valid floor', async () => {
    // Arrange
    const floorDTO = {
      building: buildingData,
      floorDescription: "Sample Floor Description",
      floorNumber: 1,
    };

    buildingRepoMock.findByDomainId.resolves(buildingData);

    const floor = await floorFactory.createFloor(floorDTO);

    // Assert
    expect(floor.building.value).to.equal(buildingData.value);
    expect(floor.floorDescription.value).to.equal(floorDTO.floorDescription.toString());
    expect(floor.floorNumber.value).to.equal(floorDTO.floorNumber.valueOf());
  });

  it('should create a valid floor without floor description', async () => {
    // Arrange
    const floorDTO = {
      building: buildingData,
      floorNumber: 1,
    };

    buildingRepoMock.findByDomainId.resolves(buildingData);

    const floor = await floorFactory.createFloor(floorDTO);

    // Assert
    expect(floor.building.value).to.equal(buildingData.value);
    expect(floor.floorDescription).to.equal(null);
    expect(floor.floorNumber.value).to.equal(floorDTO.floorNumber.valueOf());
  });

  it('should throw an error when building is not found', async () => {
    // Arrange
    const floorDTO = {
      floorNumber: 1,
      floorDescription: "Sample Floor Description",
    };

    buildingRepoMock.findByDomainId.resolves(null);

    // Act
    let error = null;
    try {
      await floorFactory.createFloor(floorDTO);
    } catch (e) {
      error = e;
    }

    // Assert
    expect(error).to.be.an.instanceof(TypeError);
    expect(error.message).to.equal('Building not found');
  });

  it('should throw an error when floor number is invalid (decimal)', async () => {
    // Arrange
    const floorDTO = {
      floorNumber: 1.1,
      floorDescription: "Sample Floor Description",
    };

    buildingRepoMock.findByDomainId.resolves(buildingData);

    // Act
    let error = null;
    try {
      await floorFactory.createFloor(floorDTO);
    } catch (e) {
      error = e;
    }

    // Assert
    expect(error).to.be.an.instanceof(TypeError);
    expect(error.message).to.equal('Floor Number must be an integer value.');
  });

  it('should throw an error when floor description is invalid (too long)', async () => {
    // Arrange
    const floorDTO = {
      floorNumber: 1,
      // Too short description
      floorDescription: "a".repeat(255),
    };

    buildingRepoMock.findByDomainId.resolves(buildingData);

    // Act
    let error = null;
    try {
      await floorFactory.createFloor(floorDTO);
    } catch (e) {
      error = e;
    }

    // Assert
    expect(error).to.be.an.instanceof(TypeError);
    expect(error.message).to.equal('Floor Description is not within range 1 to 250.');
  });

});