import "reflect-metadata";
import * as sinon from "sinon";
import { expect } from "chai";
import PathService from "../../../src/services/ServicesImpl/pathService";
import RoomDataSource from "../../datasource/RoomDataSource";
import FloorDataSource from "../../datasource/floorDataSource";

describe("PathService", () => {
  const sandbox = sinon.createSandbox();

  describe("getPaths", () => {
    // service
    let pathService: PathService;

    // stubs
    let floorRepoMock: any;
    let roomRepoMock: any;
    let pathGatewayMock: any;
    let loggerMock: any;
    let pathServiceMock: any;

    beforeEach(() => {
      floorRepoMock = {
        findByDomainId: sinon.stub()
      };

      roomRepoMock = {
        findByDomainId: sinon.stub()
      };

      pathGatewayMock = {
        getLowestCostPath: sinon.stub()
      };

      loggerMock = {
        error: sinon.stub()
      };

      pathServiceMock = {
        mapPathToOutDTO: sinon.stub(),
        convertFloorIdToBuildingCodeAndFloorNumber: sinon.stub(),
        convertFloorIdToBuildingCodeAndFloorNumberElevator: sinon.stub(),
        convertFloorIdToBuildingCodeAndFloorNumberCorridor: sinon.stub()
      };

      pathService = new PathService(
        floorRepoMock,
        roomRepoMock,
        pathGatewayMock,
        loggerMock
      );
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("should return a path", async () => {
      // Arrange
      const originFloorId = FloorDataSource.getFirstFloor().id.toString();
      const destFloorId = FloorDataSource.getSecondFloor().id.toString();
      const originRoomId = RoomDataSource.getRoomA().id.toString();
      const destRoomId = RoomDataSource.getRoomA().id.toString();

      const expectedResult = {
        path: "cell(5,2)",
        cost: "1"
      };

      // Mocks
      floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
      floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
      roomRepoMock.findByDomainId.onCall(0).resolves(RoomDataSource.getRoomA());
      roomRepoMock.findByDomainId.onCall(1).resolves(RoomDataSource.getRoomA());

      // Return value
      const pathAndCost = {
        path: ["cel(" + RoomDataSource.getRoomA().doorPosition.xPosition + "," + RoomDataSource.getRoomA().doorPosition.yPosition + ")"],
        cost: 1
      };

      // Result returns path and cost
      pathGatewayMock.getLowestCostPath.resolves({
        getValue: () => pathAndCost,
        error: null,
        isFailure: false,
      });

      // Act
      const result = await pathService.getLowestCostPath(originFloorId, originRoomId, destFloorId, destRoomId);

      // Assert
      expect(result.getValue()[0].path).to.equal(expectedResult.path);
      expect(result.getValue()[0].cost).to.equal(expectedResult.cost);
    });
  });
});