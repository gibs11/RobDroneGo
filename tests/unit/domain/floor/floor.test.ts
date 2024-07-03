import * as sinon from "sinon";
import "reflect-metadata";
import { assert } from "chai";

import { UniqueEntityID } from "../../../../src/core/domain/UniqueEntityID";

import { Floor } from "../../../../src/domain/floor/floor";
import { Building } from "../../../../src/domain/building/building";
import { FloorDescription } from "../../../../src/domain/floor/floorDescription";
import { FloorNumber } from "../../../../src/domain/floor/floorNumber";
import { Coordinates } from "../../../../src/domain/common/coordinates";
import { Result } from "../../../../src/core/logic/Result";
import BuildingDataSource from "../../../datasource/buildingDataSource";
import { BuildingName } from "../../../../src/domain/building/buildingName";
import { BuildingDimensions } from "../../../../src/domain/building/buildingDimensions";
import { BuildingDescription } from "../../../../src/domain/building/buildingDescription";
import { BuildingCode } from "../../../../src/domain/building/buildingCode";

describe("Floor Creation", () => {
  // Create sinon sandbox for isolating tests
  const sandbox = sinon.createSandbox();

  // Building for the floor
  let buildingMock: Building;

  beforeEach(() => {
    buildingMock = sinon.mock(Building.prototype);
  });

  afterEach(() => {
    sandbox.restore();
    sinon.restore();
  });

  it("should create a valid floor", () => {
    // Assert
    const validFloorProps = {
      building: buildingMock,
      floorDescription: FloorDescription.create("Sample Floor Description").getValue(),
      floorNumber: FloorNumber.create(1).getValue(),
      floorPlan: FloorDescription.create("Sample Floor Plan").getValue()
    };

    const floorId = new UniqueEntityID();
    const floorResult = Floor.create(validFloorProps, floorId);

    // Act
    sinon.assert.match(floorResult.isSuccess, true);

    const floor = floorResult.getValue();
    sinon.assert.match(floor.id, floorId);
    sinon.assert.match(floor.building, validFloorProps.building);
    sinon.assert.match(floor.floorDescription, validFloorProps.floorDescription);
    sinon.assert.match(floor.floorNumber, validFloorProps.floorNumber);
    sinon.assert.match(floor.floorPlan, validFloorProps.floorPlan);
  });

  it("should create a valid floor without floor description", () => {
    // Assert
    const validFloorProps = {
      building: buildingMock,
      floorNumber: FloorNumber.create(1).getValue(),
      floorPlan: FloorDescription.create("Sample Floor Plan").getValue()
    };

    const floorResult = Floor.create(validFloorProps);

    // Act
    sinon.assert.match(floorResult.isSuccess, true);
  });

  it("should create a valid floor without floor plan", () => {
    // Assert
    const validFloorProps = {
      building: buildingMock,
      floorDescription: FloorDescription.create("Sample Floor Description").getValue(),
      floorNumber: FloorNumber.create(1).getValue()
    };

    const floorResult = Floor.create(validFloorProps);

    // Act
    sinon.assert.match(floorResult.isSuccess, true);
  });

  it("should create a valid floor without floor description and floor plan", () => {
    // Assert
    const validFloorProps = {
      building: buildingMock,
      floorNumber: FloorNumber.create(1).getValue()
    };

    const floorResult = Floor.create(validFloorProps);

    // Act
    sinon.assert.match(floorResult.isSuccess, true);
  });

  it("should fail to create a floor with null or undefined building", () => {
    // Assert
    const validFloorProps = {
      building: null,
      floorDescription: FloorDescription.create("Sample Floor Description").getValue(),
      floorNumber: FloorNumber.create(1).getValue()
    };

    const floorResult = Floor.create(validFloorProps);

    // Act
    sinon.assert.match(floorResult.isFailure, true);
  });

  it("should fail to create a floor with null or undefined floor number", () => {
    // Assert
    const validFloorProps = {
      building: buildingMock,
      floorDescription: FloorDescription.create("Sample Floor Description").getValue(),
      floorNumber: null
    };

    const floorResult = Floor.create(validFloorProps);

    // Act
    sinon.assert.match(floorResult.isFailure, true);
  });

});

describe("Floor Update", () => {
  // Create sinon sandbox for isolating tests
  const sandbox = sinon.createSandbox();

  // Building for the floor
  let buildingMock: Building;
  let floorMock: Floor;

  beforeEach(() => {
    buildingMock = sinon.mock(Building.prototype);

    const validFloorProps = {
      building: buildingMock,
      floorDescription: FloorDescription.create("Sample Floor Description").getValue(),
      floorNumber: FloorNumber.create(1).getValue(),
      floorPlan: FloorDescription.create("Sample Floor Plan").getValue()
    };
    const floorId = new UniqueEntityID();

    floorMock = Floor.create(validFloorProps, floorId).getValue();
  });

  afterEach(() => {
    sandbox.restore();
    sinon.restore();
  });

  it("should update a valid floor description)", () => {
    // Assert
    const newFloorDescription = "New Floor Description";

    floorMock.updateDescription(newFloorDescription);

    // Act
    sinon.assert.match(floorMock.floorDescription.value, newFloorDescription);
  });

  it("should not update an invalid floor description)", () => {
    // Assert
    const newFloorDescription = "";

    // Act
    sinon.assert.match(() => floorMock.updateDescription(newFloorDescription), TypeError);
  });

  it("should update a valid floor plan)", () => {
    // Assert
    const floorPlan = {
      "floorPlan": {
        "planFloorNumber": 5,
        "planFloorSize": {
          "width": 51,
          "height": 51
        },
        "floorPlanGrid": [
          [
            3,
            0,
            1,
            2
          ],
          [
            2,
            0,
            0,
            2
          ],
          [
            2,
            0,
            0,
            2
          ],
          [
            2,
            1,
            1,
            0
          ]
        ]
      }
    };

    const newFloorPlan = JSON.stringify(floorPlan);

    floorMock.updatePlan(newFloorPlan);

    // Act
    sinon.assert.match(floorMock.floorPlan.value, newFloorPlan);
  });

  it("should not update an invalid floor plan)", () => {
    // Assert
    const newFloorPlan = "";

    // Act
    sinon.assert.match(() => floorMock.updatePlan(newFloorPlan), TypeError);
  });

  it("should not update an invalid floor plan)", () => {
    // Assert
    const newFloorPlan = null;

    // Act
    assert.throws(() => floorMock.updatePlan(newFloorPlan), TypeError);
  });

  it("should update a valid floor number)", () => {
    // Assert
    const newFloorNumber = 5;

    floorMock.updateNumber(newFloorNumber);

    // Act
    sinon.assert.match(floorMock.floorNumber.value, newFloorNumber);
  });

  it("should not update an invalid floor number)", () => {
    // Assert
    const newFloorNumber = 0;

    // Act
    sinon.assert.match(() => floorMock.updateNumber(newFloorNumber), TypeError);
  });
});

describe("Floor Are Coordinates In Border", () => {
  // Create sinon sandbox for isolating tests
  const sandbox = sinon.createSandbox();

  // Building for the floor
  let buildingMock: Building;
  let floorMock: Floor;

  beforeEach(() => {
    buildingMock = Building.create({
      buildingName: BuildingName.create('Building A').getValue(),
      buildingDimensions: BuildingDimensions.create({ width: 5, length: 10 }).getValue(),
      buildingDescription: BuildingDescription.create('Description A').getValue(),
      buildingCode: BuildingCode.create('A').getValue(),
    }, new UniqueEntityID('1'))
      .getValue();

    const validFloorProps = {
      building: buildingMock,
      floorDescription: FloorDescription.create("Sample Floor Description").getValue(),
      floorNumber: FloorNumber.create(1).getValue(),
      floorPlan: FloorDescription.create("Sample Floor Plan").getValue()
    };
    const floorId = new UniqueEntityID();

    floorMock = Floor.create(validFloorProps, floorId).getValue();
  });

  afterEach(() => {
    sandbox.restore();
    sinon.restore();
  });

  it("should return true if coordinates are in the border", () => {
    // Stub the isCoordinateInBorder method to always return true
    const stub = sinon.stub(buildingMock, "isCoordinateInBorder");
    stub.returns({getValue: () => true});

    // Define the first and last coordinates
    const firstCoordinates = Coordinates.create({x: 0, y: 0}).getValue();
    const lastCoordinates = Coordinates.create({x: 0, y: 1}).getValue();

    // Call the method and check the result
    const result = floorMock.areCoordinatesInBorder(firstCoordinates, lastCoordinates);
    sinon.assert.match(result.getValue(), true);
  });

  it("should return false when first coordinates are not in the border", () => {
    // Stub the isCoordinateInBorder method to return false for the first coordinates
    const stub = sinon.stub(buildingMock, "isCoordinateInBorder");
    stub.onCall(0).returns({getValue: () => false});
    stub.onCall(1).returns({getValue: () => true});

    // Define the first and last coordinates
    const firstCoordinates = Coordinates.create({x: 0, y: 0}).getValue();
    const lastCoordinates = Coordinates.create({x: 0, y: 1}).getValue();

    // Call the method and check the result
    const result = floorMock.areCoordinatesInBorder(firstCoordinates, lastCoordinates);
    sinon.assert.match(result.getValue(), false);
  });

  it("should return false when last coordinates are not in the border", () => {
    // Stub the isCoordinateInBorder method to return false for the first coordinates
    const stub = sinon.stub(buildingMock, "isCoordinateInBorder");
    stub.onCall(0).returns({getValue: () => true});
    stub.onCall(1).returns({getValue: () => false});

    // Define the first and last coordinates
    const firstCoordinates = Coordinates.create({x: 0, y: 0}).getValue();
    const lastCoordinates = Coordinates.create({x: 0, y: 1}).getValue();

    // Call the method and check the result
    const result = floorMock.areCoordinatesInBorder(firstCoordinates, lastCoordinates);
    sinon.assert.match(result.getValue(), false);
  });
});