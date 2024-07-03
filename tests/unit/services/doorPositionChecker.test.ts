import {expect} from 'chai';
import sinon from 'sinon';
import DoorPositionChecker from "../../../src/domain/ServicesImpl/doorPositionChecker";
import FloorDataSource from "../../datasource/floorDataSource";
import BuildingDataSource from "../../datasource/buildingDataSource";


describe('DoorPositionChecker', () => {

  let positionCheckerMock;
  let buildingRepoMock;
  let doorPositionChecker;

  beforeEach(() => {
    positionCheckerMock = {
      isPositionAvailable: sinon.stub()
    };
    buildingRepoMock = {
      findByDomainId: sinon.stub()
    };

    doorPositionChecker = new DoorPositionChecker(positionCheckerMock, buildingRepoMock);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('isPositionValid', () => {
    it('should return true if door is in a valid position', async () => {
      const initialX = 0;
      const initialY = 0;
      const finalX = 3;
      const finalY = 3;
      const doorX = 3;
      const doorY = 3;
      const doorOrientation = 'EAST';
      const floor = FloorDataSource.getFirstFloor();
      const building = BuildingDataSource.getBuildingA();

      // Mocks
      positionCheckerMock.isPositionAvailable.resolves(true);
      buildingRepoMock.findByDomainId.resolves(building);

      // Act
      const result = await doorPositionChecker.isPositionValid(
        initialX,
        initialY,
        finalX,
        finalY,
        doorX,
        doorY,
        doorOrientation,
        floor,
      );

      // Assert
      expect(result.isSuccess).to.be.true;

      // Restore the stubs
      sinon.restore();
    });
  });


  it('should return false if door is not within the the border of the room', async () => {
    const initialX = 0;
    const initialY = 0;
    const finalX = 10;
    const finalY = 10;
    const doorX = 10;
    const doorY = 50;
    const doorOrientation = 'EAST';
    const floor = FloorDataSource.getFirstFloor();

    // Act
    const result = await doorPositionChecker.isPositionValid(
      initialX,
      initialY,
      finalX,
      finalY,
      doorX,
      doorY,
      doorOrientation,
      floor,
    );

    // Assert
    expect(result.isSuccess).to.be.false;

    // Restore the stubs
    sinon.restore();
  });


  it('should return false if door is not within the the border of the room', async () => {
    const initialX = 0;
    const initialY = 0;
    const finalX = 10;
    const finalY = 10;
    const doorX = 50;
    const doorY = 10;
    const doorOrientation = 'EAST';
    const floor = FloorDataSource.getFirstFloor();

    // Act
    const result = await doorPositionChecker.isPositionValid(
      initialX,
      initialY,
      finalX,
      finalY,
      doorX,
      doorY,
      doorOrientation,
      floor,
    );

    // Assert
    expect(result.isSuccess).to.be.false;

    // Restore the stubs
    sinon.restore();
  });


  it('should return false if door is facing the outside of the room', async () => {
    const initialX = 0;
    const initialY = 0;
    const finalX = 10;
    const finalY = 10;
    const doorX = 0;
    const doorY = 5;
    const doorOrientation = 'WEST';
    const floor = FloorDataSource.getFirstFloor();
    const building = BuildingDataSource.getBuildingA();

    // Mocks
    buildingRepoMock.findByDomainId.resolves(building);

    // Act
    const result = await doorPositionChecker.isPositionValid(
      initialX,
      initialY,
      finalX,
      finalY,
      doorX,
      doorY,
      doorOrientation,
      floor,
    );

    // Assert
    expect(result.isSuccess).to.be.false;

    // Restore the stubs
    sinon.restore();
  });


  it('should return false if door is facing the a room, elevator or passage', async () => {
    const initialX = 1;
    const initialY = 1;
    const finalX = 10;
    const finalY = 10;
    const doorX = 1;
    const doorY = 4;
    const doorOrientation = 'WEST';
    const floor = FloorDataSource.getFirstFloor();
    const building = BuildingDataSource.getBuildingA();

    // Mocks
    buildingRepoMock.findByDomainId.resolves(building);
    positionCheckerMock.isPositionAvailable.resolves(false);

    // Act
    const result = await doorPositionChecker.isPositionValid(
      initialX,
      initialY,
      finalX,
      finalY,
      doorX,
      doorY,
      doorOrientation,
      floor,
    );

    // Assert
    expect(result.isSuccess).to.be.false;

    // Restore the stubs
    sinon.restore();
  });


  it('should return false if door orientation is invalid regarding the area (North, West)', async () => {
    const initialX = 0;
    const initialY = 0;
    const finalX = 3;
    const finalY = 3;
    const doorX = 3;
    const doorY = 3;
    const orientations = ['NORTH', 'WEST']
    const floor = FloorDataSource.getFirstFloor();
    const building = BuildingDataSource.getBuildingA();

    // Mocks
    buildingRepoMock.findByDomainId.resolves(building);

    for (let time = 0; time < 2; time++) {
      const doorOrientation = orientations[time];

      // Act
      const result = await doorPositionChecker.isPositionValid(
        initialX,
        initialY,
        finalX,
        finalY,
        doorX,
        doorY,
        doorOrientation,
        floor,
      );

      // Assert
      expect(result.isSuccess).to.be.false;

      // Restore the stubs
      sinon.restore();
    }
  });


  it('should return false if door orientation is invalid regarding the area (South, East)', async () => {
    const initialX = 1;
    const initialY = 1;
    const finalX = 3;
    const finalY = 3;
    const doorX = 1;
    const doorY = 1;
    const orientations = ['SOUTH', 'EAST']
    const floor = FloorDataSource.getFirstFloor();
    const building = BuildingDataSource.getBuildingA();

    // Mocks
    buildingRepoMock.findByDomainId.resolves(building);

    for (let time = 0; time < 2; time++) {
      const doorOrientation = orientations[time];

      // Act
      const result = await doorPositionChecker.isPositionValid(
        initialX,
        initialY,
        finalX,
        finalY,
        doorX,
        doorY,
        doorOrientation,
        floor,
      );

      // Assert
      expect(result.isSuccess).to.be.false;

      // Restore the stubs
      sinon.restore();
    }
  });


  it('should return false if door orientation is invalid', async () => {
    const initialX = 1;
    const initialY = 1;
    const finalX = 3;
    const finalY = 3;
    const doorX = 1;
    const doorY = 1;
    const doorOrientation = 'INVALID';
    const floor = FloorDataSource.getFirstFloor();
    const building = BuildingDataSource.getBuildingA();

    // Mocks
    buildingRepoMock.findByDomainId.resolves(building);

    // Act
    const result = await doorPositionChecker.isPositionValid(
      initialX,
      initialY,
      finalX,
      finalY,
      doorX,
      doorY,
      doorOrientation,
      floor,
    );

    // Assert
    expect(result.isSuccess).to.be.false;

    // Restore the stubs
    sinon.restore();
  });
});