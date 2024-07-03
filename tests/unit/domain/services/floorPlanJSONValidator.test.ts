import { expect } from 'chai';
import * as sinon from 'sinon';
import BuildingDataSource from "../../../datasource/buildingDataSource";
import FloorFactory from "../../../../src/factories/floorFactory";
import { Floor } from "../../../../src/domain/floor/floor";
import FloorPlanJSONValidator from "../../../../src/domain/ServicesImpl/floorPlanJSONValidator";
import { FloorNumber } from "../../../../src/domain/floor/floorNumber";
import { FloorDescription } from "../../../../src/domain/floor/floorDescription";
import { UniqueEntityID } from "../../../../src/core/domain/UniqueEntityID";

describe('floorPlanJSONValidator', () => {
  // Create sinon sandbox for isolating tests
  const sandbox = sinon.createSandbox();

  // Building for the floor
  let floorMock: Floor;
  let floorPlanJSONValidator;
  let buildingData;

  beforeEach(() => {
    buildingData = BuildingDataSource.getBuildingA();

    floorMock = Floor.create({
      floorNumber: FloorNumber.create(5).getValue(),
      floorDescription: FloorDescription.create('floor description').getValue(),
      building: buildingData,
    }, new UniqueEntityID('123')).getValue();

    floorPlanJSONValidator = new FloorPlanJSONValidator();
  });

  afterEach(() => {
    sandbox.restore();
    sinon.restore();
  });

  it('should approve a valid floorPlan', async () => {
    // Arrange
    const floorDTO = {
      "floorPlan": {
        "planFloorNumber": 5,
        "planFloorSize": {
          "width": 6,
          "height": 11
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
        ],
        "floorPlanRooms": [
          {
            "roomName": "Room1",
            "roomCoordinates": [
              {
                "x": 10,
                "y": 20
              },
              {
                "x": 15,
                "y": 17
              }
            ],
            "roomDoorCoordinates": {
              "x": 30,
              "y": 25
            }
          }
        ],
        "floorPlanElevator": [
          {
            "elevatorNumber": 1,
            "elevatorCoordinates": {
              "x": 50,
              "y": 60
            }
          },
          {
            "elevatorNumber": 2,
            "elevatorCoordinates": {
              "x": 80,
              "y": 90
            }
          }
        ],
        "floorPlanPassages": [
          {
            "toFloor": "Floor2",
            "passageCoordinates": {
              "x": 70,
              "y": 90
            }
          }
        ]
      }
    };

    const isTexturePathStub = sinon.stub(floorPlanJSONValidator, 'isTexturePath').returns(true);

    // Act
    const floor = await floorPlanJSONValidator.isFloorPlanValid(floorDTO, floorMock);

    isTexturePathStub.restore();

    // Assert
    expect(floor).to.equal(true);
  });

  it('should reject a floorPlan with wrong floor number', async () => {
    // Arrange
    const floorDTO = {
      "floorPlan": {
        "planFloorNumber": 6,
        "planFloorSize": {
          "width": 6,
          "height": 11
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
        ],
      }
    };

    const isTexturePathStub = sinon.stub(floorPlanJSONValidator, 'isTexturePath').returns(true);

    // Act
    const floor = await floorPlanJSONValidator.isFloorPlanValid(floorDTO, floorMock);

    isTexturePathStub.restore();

    // Assert
    expect(floor).to.equal(false);
  });

  it('should reject a floorPlan with wrong floor width', async () => {
    // Arrange
    const floorDTO = {
      "floorPlan": {
        "planFloorNumber": 5,
        "planFloorSize": {
          "width": 7,
          "height": 11
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
        ],
      }
    };

    const isTexturePathStub = sinon.stub(floorPlanJSONValidator, 'isTexturePath').returns(true);

    // Act
    const floor = await floorPlanJSONValidator.isFloorPlanValid(floorDTO, floorMock);

    isTexturePathStub.restore();

    // Assert
    expect(floor).to.equal(false);
  });

  it('should reject a floorPlan with wrong floor height', async () => {
    // Arrange
    const floorDTO = {
      "floorPlan": {
        "planFloorNumber": 5,
        "planFloorSize": {
          "width": 6,
          "height": 12
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
        ],
      }
    };

    const isTexturePathStub = sinon.stub(floorPlanJSONValidator, 'isTexturePath').returns(true);

    // Act
    const floor = await floorPlanJSONValidator.isFloorPlanValid(floorDTO, floorMock);

    isTexturePathStub.restore();

    // Assert
    expect(floor).to.equal(false);
  });

  it('should reject a floorPlan with invalid texture', async () => {
    // Arrange
    const floorDTO = {
      "floorPlan": {
        "planFloorNumber": 5,
        "planFloorSize": {
          "width": 6,
          "height": 12
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
        ],
        "floorWallTexture": "./textures/wall.not_valid",
        "floorElevatorTexture": "./textures/elevator.invalid",
        "floorDoorTexture": "./textures/door.not_allowed",
      }
    };

    const isTexturePathStub = sinon.stub(floorPlanJSONValidator, 'isTexturePath').returns(false);

    // Act
    const floor = await floorPlanJSONValidator.isFloorPlanValid(floorDTO, floorMock);

    isTexturePathStub.restore();

    // Assert
    expect(floor).to.equal(false);
  });

});