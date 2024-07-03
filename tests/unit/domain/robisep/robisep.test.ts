import * as sinon from "sinon";
import { expect } from "chai";

import { UniqueEntityID } from "../../../../src/core/domain/UniqueEntityID";
import { Robisep } from "../../../../src/domain/robisep/Robisep";
import { RobisepNickname } from "../../../../src/domain/robisep/RobisepNickname";
import { RobisepSerialNumber } from "../../../../src/domain/robisep/RobisepSerialNumber";
import { RobisepCode } from "../../../../src/domain/robisep/RobisepCode";
import { RobisepDescription } from "../../../../src/domain/robisep/RobisepDescription";
import { RobisepType } from "../../../../src/domain/robisepType/RobisepType";
import { RobisepState } from "../../../../src/domain/robisep/RobisepState";
import {Room} from "../../../../src/domain/room/Room";


describe("Robisep", () => {
  // Craete sinon sandbox for isolated test
  const sandbox = sinon.createSandbox();

  // RobisepType
  let robisepTypeMock: RobisepType;
  let roomMock: Room;

  beforeEach(() => {
    robisepTypeMock = sandbox.createStubInstance(RobisepType);
    roomMock = sandbox.createStubInstance(Room);
  });

  afterEach(() => {
    sandbox.restore();
    sinon.restore();
  });

  it("should create a valid Robisep object, passing a Robisep id, nickname, serialNumber, code, description", () => {

    // Arrange
    const nickname = RobisepNickname.create("Sample nickname");
    const serialNumber = RobisepSerialNumber.create("Sample serialNumber");
    const code = RobisepCode.create("Sample code");
    const description = RobisepDescription.create("Sample description");

    const validRobisepProps = {
      nickname: nickname.getValue(),
      serialNumber: serialNumber.getValue(),
      code: code.getValue(),
      description: description.getValue(),
      robisepType: robisepTypeMock,
      state: RobisepState.ACTIVE,
      roomId: roomMock
    };
    const robisepId = new UniqueEntityID();

    // Act
    const robisepResult = Robisep.create(validRobisepProps, robisepId);

    // Assert
    sinon.assert.match(robisepResult.isSuccess, true);

    const robisep = robisepResult.getValue();
    sinon.assert.match(robisep.id, robisepId);
    sinon.assert.match(robisep.nickname, nickname.getValue());
    sinon.assert.match(robisep.serialNumber, serialNumber.getValue());
    sinon.assert.match(robisep.code, code.getValue());
    sinon.assert.match(robisep.description, description.getValue());
  });


  it("should create a valid Robisep object, without passing a Robisep id", () => {

    // Arrange
    const nickname = RobisepNickname.create("Sample nickname");
    const serialNumber = RobisepSerialNumber.create("Sample serialNumber");
    const code = RobisepCode.create("Sample code");
    const description = RobisepDescription.create("Sample description");

    const validRobisepProps = {
      nickname: nickname.getValue(),
      serialNumber: serialNumber.getValue(),
      code: code.getValue(),
      description: description.getValue(),
      robisepType: robisepTypeMock,
      roomId: roomMock,
      state: RobisepState.ACTIVE
    };

    // Act
    const robisepResult = Robisep.create(validRobisepProps);

    // Assert
    sinon.assert.match(robisepResult.isSuccess, true);
  });


  it("should not create a valid Robisep object - null designation", () => {

    // Arrange
    const serialNumber = RobisepSerialNumber.create("Sample serialNumber");
    const code = RobisepCode.create("Sample code");
    const description = RobisepDescription.create("Sample description");

    const validRobisepProps = {
      nickname: null,
      serialNumber: serialNumber.getValue(),
      code: code.getValue(),
      description: description.getValue(),
      robisepType: robisepTypeMock,
      roomId: roomMock,
      state: RobisepState.ACTIVE
    };
    const robisepId = new UniqueEntityID();

    // Act
    const robisepResult = Robisep.create(validRobisepProps, robisepId);

    // Assert
    sinon.assert.match(robisepResult.isFailure, true);
  });


  it("should not create a valid Robisep object - null brand", () => {

    // Arrange
    const nickname = RobisepNickname.create("Sample nickname");
    const code = RobisepCode.create("Sample code");
    const description = RobisepDescription.create("Sample description");

    const validRobisepProps = {
      nickname: nickname.getValue(),
      serialNumber: null,
      code: code.getValue(),
      description: description.getValue(),
      robisepType: robisepTypeMock,
      roomId: roomMock,
      state: RobisepState.ACTIVE
    };
    const robisepId = new UniqueEntityID();

    // Act
    const robisepResult = Robisep.create(validRobisepProps, robisepId);

    // Assert
    sinon.assert.match(robisepResult.isFailure, true);
  });


  it("should not create a valid Robisep object - null model", () => {

    // Arrange
    const nickname = RobisepNickname.create("Sample nickname");
    const serialNumber = RobisepSerialNumber.create("Sample serialNumber");
    const description = RobisepDescription.create("Sample description");

    const validRobisepProps = {
      nickname: nickname.getValue(),
      serialNumber: serialNumber.getValue(),
      code: null,
      description: description.getValue(),
      robisepType: robisepTypeMock,
      roomId: roomMock,
      state: RobisepState.ACTIVE
    };
    const robisepId = new UniqueEntityID();

    // Act
    const robisepResult = Robisep.create(validRobisepProps, robisepId);

    // Assert
    sinon.assert.match(robisepResult.isFailure, true);
  });


  it("should create a valid Robisep object - null Description", () => {

    // Arrange
    const nickname = RobisepNickname.create("Sample nickname");
    const serialNumber = RobisepSerialNumber.create("Sample serialNumber");
    const code = RobisepCode.create("Sample code");

    const validRobisepProps = {
      nickname: nickname.getValue(),
      serialNumber: serialNumber.getValue(),
      code: code.getValue(),
      description: null,
      robisepType: robisepTypeMock,
      roomId: roomMock,
      state: RobisepState.ACTIVE
    };
    const robisepId = new UniqueEntityID();

    // Act
    const robisepResult = Robisep.create(validRobisepProps, robisepId);

    // Assert
    sinon.assert.match(robisepResult.isFailure, false);
  });


  it("should not create a valid Robisep object - null robisepTypeId", () => {

    // Arrange
    const nickname = RobisepNickname.create("Sample nickname");
    const serialNumber = RobisepSerialNumber.create("Sample serialNumber");
    const code = RobisepCode.create("Sample code");
    const description = RobisepDescription.create("some description");

    const validRobisepProps = {
      nickname: nickname.getValue(),
      serialNumber: serialNumber.getValue(),
      code: code.getValue(),
      description: description.getValue(),
      robisepType: null,
      roomId: roomMock,
      state: RobisepState.ACTIVE
    };
    const robisepId = new UniqueEntityID();

    // Act
    const robisepResult = Robisep.create(validRobisepProps, robisepId);

    // Assert
    sinon.assert.match(robisepResult.isFailure, true);
  });

  it("should change the Robisep state to INACTIVE", () => {

    // Arrange
    const nickname = RobisepNickname.create("Sample nickname");
    const serialNumber = RobisepSerialNumber.create("Sample serialNumber");
    const code = RobisepCode.create("Sample code");
    const description = RobisepDescription.create("Sample description");

    const validRobisepProps = {
      nickname: nickname.getValue(),
      serialNumber: serialNumber.getValue(),
      code: code.getValue(),
      description: description.getValue(),
      robisepType: robisepTypeMock,
      roomId: roomMock,
      state: RobisepState.ACTIVE
    };
    const robisepId = new UniqueEntityID();

    // Act
    const robisep = Robisep.create(validRobisepProps, robisepId).getValue();

    // Act
    robisep.disable();

    // Assert
    sinon.assert.match(robisep.state, RobisepState.ACTIVE);
  });

  it("should throw an error if the state was already \"INACTIVE\"", () => {

    // Arrange
    const nickname = RobisepNickname.create("Sample nickname");
    const serialNumber = RobisepSerialNumber.create("Sample serialNumber");
    const code = RobisepCode.create("Sample code");
    const description = RobisepDescription.create("Sample description");

    const validRobisepProps = {
      nickname: nickname.getValue(),
      serialNumber: serialNumber.getValue(),
      code: code.getValue(),
      description: description.getValue(),
      robisepType: robisepTypeMock,
      roomId: roomMock,
      state: RobisepState.ACTIVE

    };

    // Act
    const robisep = Robisep.create(validRobisepProps).getValue();
    robisep.disable();

    // Assert
    expect(() => robisep.disable()).to.throw("The robisep is already disabled.");
  });
});
