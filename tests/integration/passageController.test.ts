import "reflect-metadata";
import * as sinon from "sinon";
import { expect } from "chai";
import { Response, Request } from "express";
import { Container } from "typedi";
import { Result } from "../../src/core/logic/Result";
import IPassageService from "../../src/services/IServices/IPassageService";
import PassageController from "../../src/controllers/passageController";
import IPassageDTO from "../../src/dto/IPassageDTO";
import config from "../../config";
import { Passage } from "../../src/domain/passage/passage";
import { PassagePoint } from "../../src/domain/passage/passagePoint";
import PassageDataSource from "../datasource/passageDataSource";
import FloorDataSource from "../datasource/floorDataSource";
import { UniqueEntityID } from "../../src/core/domain/UniqueEntityID";
import BuildingDataSource from "../datasource/buildingDataSource";
import { Coordinates } from "../../src/domain/common/coordinates";

describe("PassageController", () => {
  const sandbox = sinon.createSandbox();
  let loggerMock;
  let floorRepoMock;
  let passageRepoMock;
  let passageBuilderMock;
  let positionCheckerServiceMock;
  let buildingRepoMock;

  describe("createPassage", function() {


    beforeEach(function() {
      Container.reset();
      loggerMock = {
        error: sinon.stub()
      };
      Container.set("logger", loggerMock);

      passageRepoMock = {
        findByDomainId: sinon.stub(),
        findByFloors: sinon.stub(),
        isTherePassageBetweenFloorAndBuilding: sinon.stub(),
        save: sinon.stub()
      };
      Container.set(config.repos.passage.name, passageRepoMock);

      floorRepoMock = {
        findByDomainId: sinon.stub()
      };
      Container.set(config.repos.floor.name, floorRepoMock);

      buildingRepoMock = {
        findByDomainId: sinon.stub()
      };
      Container.set(config.repos.building.name, buildingRepoMock);

      passageBuilderMock = {
        withStartPointFloor: sinon.stub().returnsThis(),
        withEndPointFloor: sinon.stub().returnsThis(),
        withPassageDTO: sinon.stub().returnsThis(),
        build: sinon.stub()
      };
      Container.set(config.factories.passage.name, passageBuilderMock);

      positionCheckerServiceMock = {
        isPositionAvailable: sinon.stub()
      };
      Container.set(config.services.positionChecker.name, positionCheckerServiceMock);

      let passageServiceClass = require("../../src/services/ServicesImpl/passageService").default;
      let passageServiceInstance = Container.get(passageServiceClass);
      Container.set(config.services.passage.name, passageServiceInstance);
    });

    afterEach(function() {
      sandbox.restore();
      sinon.restore();
    });

    describe("success", function() {
      it("PassageController unit test using PassageService stub", async function() {
        // Arrange
        let requestBody = {
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
          }
        };
        let request = {
          body: requestBody
        };
        let response = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };

        let passageServiceInstance = Container.get(config.services.passage.name);

        // Stub passageService.createPassage
        sinon.stub(passageServiceInstance, "createPassage").returns(Result.ok<IPassageDTO>({
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
          }
        }));

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act
        await controller.createPassage(request as Request, response as Response);

        // Assert
        sinon.assert.calledOnce(response.json);
        sinon.assert.calledWith(response.json, sinon.match({
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
          }
        }));
      });
      it("PassageController + PassageService integration test", async function() {
        // Arrange
        let requestBody = {
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
          }
        };
        let request: Partial<Request> = {
          body: requestBody
        };
        let response: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };

        let passageServiceInstance = Container.get(config.services.passage.name);

        // Stub repo methods
        passageRepoMock.findByDomainId.resolves(null);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
        passageRepoMock.findByFloors.resolves(null);
        positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
        positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);
        positionCheckerServiceMock.isPositionAvailable.onCall(2).resolves(true);
        positionCheckerServiceMock.isPositionAvailable.onCall(3).resolves(true);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(1).resolves(false);

        let passage = Passage.create({
          passageStartPoint: PassagePoint.create({
            floor: FloorDataSource.getFirstFloor(),
            firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
          }).getValue(),
          passageEndPoint: PassagePoint.create({
            floor: FloorDataSource.getSecondFloor(),
            firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
          }).getValue()
        }, new UniqueEntityID("1")).getValue();

        passageBuilderMock.build.resolves(passage);

        passageRepoMock.save.resolves(passage);

        let passageServiceSpy = sinon.spy(passageServiceInstance, "createPassage");

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act
        await controller.createPassage(request as Request, response as Response);

        // Assert
        sinon.assert.calledOnce(response.json);
        sinon.assert.calledWith(response.json, sinon.match({
          domainId: passage.id.toString(),
          passageStartPoint: {
            firstCoordinates: {
              x: requestBody.passageStartPoint.firstCoordinates.x,
              y: requestBody.passageStartPoint.firstCoordinates.y
            },
            lastCoordinates: {
              x: requestBody.passageStartPoint.lastCoordinates.x,
              y: requestBody.passageStartPoint.lastCoordinates.y
            }
          },
          passageEndPoint: {
            firstCoordinates: {
              x: requestBody.passageEndPoint.firstCoordinates.x,
              y: requestBody.passageEndPoint.firstCoordinates.y
            },
            lastCoordinates: {
              x: requestBody.passageEndPoint.lastCoordinates.x,
              y: requestBody.passageEndPoint.lastCoordinates.y
            }
          }
        }));

        sinon.assert.calledOnce(passageServiceSpy);
        sinon.assert.calledWith(passageServiceSpy, sinon.match({
          domainId: passage.id.toString(),
          passageStartPoint: {
            firstCoordinates: {
              x: requestBody.passageStartPoint.firstCoordinates.x,
              y: requestBody.passageStartPoint.firstCoordinates.y
            },
            lastCoordinates: {
              x: requestBody.passageStartPoint.lastCoordinates.x,
              y: requestBody.passageStartPoint.lastCoordinates.y
            }
          },
          passageEndPoint: {
            firstCoordinates: {
              x: requestBody.passageEndPoint.firstCoordinates.x,
              y: requestBody.passageEndPoint.firstCoordinates.y
            },
            lastCoordinates: {
              x: requestBody.passageEndPoint.lastCoordinates.x,
              y: requestBody.passageEndPoint.lastCoordinates.y
            }
          }
        }));
      });
    });
    describe("failure", function() {
      it("PassageController should return 409 if passage already exists with domainId", async function() {
        // Arrange
        let requestBody = {
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
          }
        };
        let request: Partial<Request> = {
          body: requestBody
        };
        let response: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };

        passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());

        let passageServiceInstance = Container.get(config.services.passage.name);

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act
        await controller.createPassage(<Request>request, <Response>response);

        // Assert
        sinon.assert.calledOnce(response.status);
        sinon.assert.calledWith(response.status, 409);
        sinon.assert.calledOnce(response.send);
        sinon.assert.calledWith(response.send, sinon.match({message:"Passage already exists."}));
      });

      it("PassageController should return 404 if the floor of the passage start point does not exist", async function() {
        // Arrange
        let requestBody = {
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
          }
        };
        let request: Partial<Request> = {
          body: requestBody
        };
        let response: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };

        passageRepoMock.findByDomainId.resolves(null);
        floorRepoMock.findByDomainId.onCall(0).resolves(null);

        let passageServiceInstance = Container.get(config.services.passage.name);

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act
        await controller.createPassage(<Request>request, <Response>response);

        // Assert
        sinon.assert.calledOnce(response.status);
        sinon.assert.calledWith(response.status, 404);
        sinon.assert.calledOnce(response.send);
        sinon.assert.calledWith(response.send,
          sinon.match({message: 'Start Point Floor not found.'})
        );
      });
      it("PassageController should return 404 if the floor of the passage end point does not exist", async function() {
        // Arrange
        let requestBody = {
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
          }
        };
        let request: Partial<Request> = {
          body: requestBody
        };
        let response: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };

        passageRepoMock.findByDomainId.resolves(null);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(null);

        let passageServiceInstance = Container.get(config.services.passage.name);

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act
        await controller.createPassage(<Request>request, <Response>response);

        // Assert
        sinon.assert.calledOnce(response.status);
        sinon.assert.calledWith(response.status, 404);
        sinon.assert.calledOnce(response.send);
        sinon.assert.calledWith(response.send,
          sinon.match({message: 'End Point Floor not found.'})
          );
      });

      it("PassageController should return 400 if passage buildings are the same", async function() {
        // Arrange
        let requestBody = {
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
          },
          passageEndPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
          }
        };
        let request: Partial<Request> = {
          body: requestBody
        };
        let response: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };

        passageRepoMock.findByDomainId.resolves(null);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getFirstFloor());

        let passageServiceInstance = Container.get(config.services.passage.name);

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act
        await controller.createPassage(<Request>request, <Response>response);

        // Assert
        sinon.assert.calledOnce(response.status);
        sinon.assert.calledWith(response.status, 400);
        sinon.assert.calledOnce(response.send);
        sinon.assert.calledWith(response.send,
          sinon.match({message: 'You can\'t create a passage between floors of the same building.'}) 
          );
      });

      it("PassageController should return 409 if passage already exists with passage floors", async function() {
        // Arrange
        let requestBody = {
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
          },
          passageEndPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
          }
        };
        let request: Partial<Request> = {
          body: requestBody
        };
        let response: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };
        let passage = PassageDataSource.getPassageA();
        passageRepoMock.findByDomainId.resolves(null);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getFirstFloor());
        passageRepoMock.findByFloors.resolves(passage);

        let passageServiceInstance = Container.get(config.services.passage.name);

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act
        await controller.createPassage(<Request>request, <Response>response);

        // Assert
        sinon.assert.calledOnce(response.status);
        sinon.assert.calledWith(response.status, 409);
        sinon.assert.calledOnce(response.send);
        sinon.assert.calledWith(response.send,
          sinon.match({message: "Passage already exists between the selected floors."})
          );
      });

      it("PassageController should return 400 if passage positions are occupied startPoint firstCoordinates", async function() {
        // Arrange
        let requestBody = {
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0
            },
            lastCoordinates: {
              x: 0,
              y: 1
            }
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0
            },
            lastCoordinates: {
              x: 1,
              y: 0
            }
          }
        };
        let request: Partial<Request> = {
          body: requestBody
        };
        let response: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };
        let passage = PassageDataSource.getPassageA();
        passageRepoMock.findByDomainId.resolves(null);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
        passageRepoMock.findByFloors.resolves(null);
        positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(false);
        positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);
        positionCheckerServiceMock.isPositionAvailable.onCall(2).resolves(true);
        positionCheckerServiceMock.isPositionAvailable.onCall(3).resolves(true);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(1).resolves(false);

        let passageServiceInstance = Container.get(config.services.passage.name);

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act
        await controller.createPassage(<Request>request, <Response>response);

        // Assert
        sinon.assert.calledOnce(response.status);
        sinon.assert.calledWith(response.status, 400);
        sinon.assert.calledOnce(response.send);
        sinon.assert.calledWith(response.send, 
          sinon.match({message: "Coordinates (" + requestBody.passageStartPoint.firstCoordinates.x + "," + requestBody.passageStartPoint.firstCoordinates.y + ") are occupied."})
        );
        });

      it("PassageController should return 400 if passage positions are occupied startPoint lastCoordinates", async function() {
        // Arrange
        let requestBody = {
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0
            },
            lastCoordinates: {
              x: 0,
              y: 1
            }
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0
            },
            lastCoordinates: {
              x: 1,
              y: 0
            }
          }
        };
        let request: Partial<Request> = {
          body: requestBody
        };
        let response: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };
        let passage = PassageDataSource.getPassageA();
        passageRepoMock.findByDomainId.resolves(null);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
        passageRepoMock.findByFloors.resolves(null);
        positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
        positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(false);
        positionCheckerServiceMock.isPositionAvailable.onCall(2).resolves(true);
        positionCheckerServiceMock.isPositionAvailable.onCall(3).resolves(true);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(1).resolves(false);

        let passageServiceInstance = Container.get(config.services.passage.name);

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act
        await controller.createPassage(<Request>request, <Response>response);

        // Assert
        sinon.assert.calledOnce(response.status);
        sinon.assert.calledWith(response.status, 400);
        sinon.assert.calledOnce(response.send);
        sinon.assert.calledWith(response.send,
          sinon.match({message: "Coordinates (" + requestBody.passageStartPoint.lastCoordinates.x + "," + requestBody.passageStartPoint.lastCoordinates.y + ") are occupied."})
          );
      });

      it("PassageController should return 400 if passage positions are occupied endPoint firstCoordinates", async function() {
        // Arrange
        let requestBody = {
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0
            },
            lastCoordinates: {
              x: 0,
              y: 1
            }
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0
            },
            lastCoordinates: {
              x: 1,
              y: 0
            }
          }
        };
        let request: Partial<Request> = {
          body: requestBody
        };
        let response: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };
        let passage = PassageDataSource.getPassageA();
        passageRepoMock.findByDomainId.resolves(null);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
        passageRepoMock.findByFloors.resolves(null);
        positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
        positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);
        positionCheckerServiceMock.isPositionAvailable.onCall(2).resolves(false);
        positionCheckerServiceMock.isPositionAvailable.onCall(3).resolves(true);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(1).resolves(false);

        let passageServiceInstance = Container.get(config.services.passage.name);

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act
        await controller.createPassage(<Request>request, <Response>response);

        // Assert
        sinon.assert.calledOnce(response.status);
        sinon.assert.calledWith(response.status, 400);
        sinon.assert.calledOnce(response.send);
        sinon.assert.calledWith(response.send,
          sinon.match({message: "Coordinates (" + requestBody.passageEndPoint.firstCoordinates.x + "," + requestBody.passageEndPoint.firstCoordinates.y + ") are occupied."})
          );
      });

      it("PassageController should return 400 if passage positions are occupied endPoint lastCoordinates", async function() {
        // Arrange
        let requestBody = {
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0
            },
            lastCoordinates: {
              x: 0,
              y: 1
            }
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0
            },
            lastCoordinates: {
              x: 1,
              y: 0
            }
          }
        };
        let request: Partial<Request> = {
          body: requestBody
        };
        let response: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };
        let passage = PassageDataSource.getPassageA();
        passageRepoMock.findByDomainId.resolves(null);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
        passageRepoMock.findByFloors.resolves(null);
        positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
        positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);
        positionCheckerServiceMock.isPositionAvailable.onCall(2).resolves(true);
        positionCheckerServiceMock.isPositionAvailable.onCall(3).resolves(false);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(1).resolves(false);

        let passageServiceInstance = Container.get(config.services.passage.name);

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act
        await controller.createPassage(<Request>request, <Response>response);

        // Assert
        sinon.assert.calledOnce(response.status);
        sinon.assert.calledWith(response.status, 400);
        sinon.assert.calledOnce(response.send);
        sinon.assert.calledWith(response.send,
          sinon.match({message: "Coordinates (" + requestBody.passageEndPoint.lastCoordinates.x + "," + requestBody.passageEndPoint.lastCoordinates.y + ") are occupied."})
          );
      });

      it("PassageController should return 400 if there's already a passage from one floor to one building", async function() {
        // Arrange
        let requestBody = {
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
          }
        };
        let request: Partial<Request> = {
          body: requestBody
        };
        let response: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };

        passageRepoMock.findByDomainId.resolves(null);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
        passageRepoMock.findByFloors.resolves(null);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(true);

        let passageServiceInstance = Container.get(config.services.passage.name);

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act
        await controller.createPassage(<Request>request, <Response>response);

        // Assert
        sinon.assert.calledOnce(response.status);
        sinon.assert.calledWith(response.status, 409);
        sinon.assert.calledOnce(response.send);
        sinon.assert.calledWith(response.send,
          sinon.match({message: "There is already a passage from the floor " + FloorDataSource.getFirstFloor().building.code.value + FloorDataSource.getFirstFloor().floorNumber.value + " to the building " + FloorDataSource.getSecondFloor().building.code.value + '.'})
          );
      });
      it("PassageController should return 400 if there's already a passage from one floor to one building reverse", async function() {
        // Arrange
        let requestBody = {
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
          },
          passageEndPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
          }
        };
        let request: Partial<Request> = {
          body: requestBody
        };
        let response: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };

        passageRepoMock.findByDomainId.resolves(null);
        floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
        floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
        passageRepoMock.findByFloors.resolves(null);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
        passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(1).resolves(true);

        let passageServiceInstance = Container.get(config.services.passage.name);

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act
        await controller.createPassage(<Request>request, <Response>response);

        // Assert
        sinon.assert.calledOnce(response.status);
        sinon.assert.calledWith(response.status, 409);
        sinon.assert.calledOnce(response.send);
        sinon.assert.calledWith(response.send,
          sinon.match({message: "There is already a passage from the floor " + FloorDataSource.getSecondFloor().building.code.value + FloorDataSource.getSecondFloor().floorNumber.value + " to the building " + FloorDataSource.getFirstFloor().building.code.value + '.'})
          );
      });
      it("PassageController should return 503 if there's a database error", async function() {
        // Arrange
        let requestBody = {
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
          },
          passageEndPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
          }
        };
        let request: Partial<Request> = {
          body: requestBody
        };
        let response: Partial<Response> = {
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };

        passageRepoMock.findByDomainId.rejects(new Error("Database error."));

        let passageServiceInstance = Container.get(config.services.passage.name);

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act
        await controller.createPassage(<Request>request, <Response>response);

        // Assert
        sinon.assert.calledOnce(response.status);
        sinon.assert.calledWith(response.status, 503);
        sinon.assert.calledOnce(response.send);
        sinon.assert.calledWith(response.send, sinon.match({message:"Database error."}));
      });
      it("PassageController should return 400 if there's a TypeError error", async function() {
        // Arrange
        let requestBody = {
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
          },
          passageEndPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
          }
        };
        let request: Partial<Request> = {
          body: requestBody
        };
        let response: Partial<Response> = {
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };

        passageRepoMock.findByDomainId.rejects(new TypeError("Invalid Input."));

        let passageServiceInstance = Container.get(config.services.passage.name);

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act

        await controller.createPassage(<Request>request, <Response>response);

        // Assert
        sinon.assert.calledOnce(response.status);
        sinon.assert.calledWith(response.status, 400);
        sinon.assert.calledOnce(response.send);
        sinon.assert.calledWith(response.send, sinon.match({message:"Invalid Input."}));
      });
      it("PassageController should return 401 if there's a unauthorized error", async function() {
        // Arrange
        let requestBody = {
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
          },
          passageEndPoint: {
            floorId: FloorDataSource.getFirstFloor().id.toString(),
            firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
            lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
          }
        };
        let request: Partial<Request> = {
          body: requestBody
        };
        let response: Partial<Response> = {
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };

        let passageServiceInstance = Container.get(config.services.passage.name);

        sinon.stub(passageServiceInstance, "createPassage").throws(new Error("You are not authorized to perform this action"));

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act
        try {
          await controller.createPassage(<Request>request, <Response>response);
        } catch (error) {
          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 401);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send, sinon.match({message:"Unauthorized error."}));
        }
      });
    });
  });
  describe("listPassagesBetweenBuildings", function() {
    beforeEach(function() {
      Container.reset();
      loggerMock = {
        error: sinon.stub()
      };
      Container.set("logger", loggerMock);

      passageRepoMock = {
        findPassagesBetweenBuildings: sinon.stub()
      };
      Container.set(config.repos.passage.name, passageRepoMock);

      floorRepoMock = {
        findByDomainId: sinon.stub()
      };
      Container.set(config.repos.floor.name, floorRepoMock);

      buildingRepoMock = {
        findByDomainId: sinon.stub()
      };
      Container.set(config.repos.building.name, buildingRepoMock);

      positionCheckerServiceMock = {
        isPositionAvailable: sinon.stub()
      };
      Container.set(config.services.positionChecker.name, positionCheckerServiceMock);

      passageBuilderMock = {
        build: sinon.stub()
      };
      Container.set(config.factories.passage.name, passageBuilderMock);

      let passageServiceClass = require("../../src/services/ServicesImpl/passageService").default;
      let passageServiceInstance = Container.get(passageServiceClass);
      Container.set(config.services.passage.name, passageServiceInstance);
    });

    afterEach(function() {
      sandbox.restore();
    });

    it("PassageController unit test using PassageService stub", async function() {
      // Arrange
      let request: Partial<Request> = {
        query: {
          firstBuildingId: "1",
          lastBuildingId: "2"
        }
      };
      let response: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy()
      };

      let passageServiceInstance = Container.get(config.services.passage.name);

      // Stub
      sinon.stub(passageServiceInstance, "listPassagesBetweenBuildings").returns(Result.ok<IPassageDTO[]>([PassageDataSource.getPassageADTO()]));

      const controller = new PassageController(passageServiceInstance as IPassageService);

      // Act
      await controller.listPassagesBetweenBuildings(<Request>request, <Response>response);

      // Assert
      sinon.assert.calledOnce(response.json);
      sinon.assert.calledWith(response.json, sinon.match([PassageDataSource.getPassageADTO()]));
    });

    it("PassageController + PassageService integration test", async function() {
      // Arrange
      let request: Partial<Request> = {
        query: {
          firstBuildingId: "1",
          lastBuildingId: "2"
        }
      };
      let response: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy()
      };

      // Stub repo methods
      buildingRepoMock.findByDomainId.onCall(0).resolves(BuildingDataSource.getBuildingA());
      buildingRepoMock.findByDomainId.onCall(1).resolves(BuildingDataSource.getBuildingB());

      let passage = Passage.create({
        passageStartPoint: PassagePoint.create({
          floor: FloorDataSource.getFirstFloor(),
          firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
          lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
        }).getValue(),
        passageEndPoint: PassagePoint.create({
          floor: FloorDataSource.getSecondFloor(),
          firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
          lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
        }).getValue()
      }, new UniqueEntityID("1")).getValue();

      passageRepoMock.findPassagesBetweenBuildings.resolves([passage]);

      let passageServiceInstance = Container.get(config.services.passage.name);
      let passageServiceSpy = sinon.spy(passageServiceInstance, "listPassagesBetweenBuildings");
      const controller = new PassageController(passageServiceInstance as IPassageService);

      // Act
      await controller.listPassagesBetweenBuildings(<Request>request, <Response>response);

      const dto = PassageDataSource.getPassageADTO();

      // Assert
      sinon.assert.calledOnce(response.json);
      sinon.assert.match(passage.id.toString(), dto.domainId);
      sinon.assert.match(passage.startPoint.floor.id.toString(), dto.passageStartPoint.floorId);
      sinon.assert.match(passage.startPoint.firstCoordinates.x, dto.passageStartPoint.firstCoordinates.x);
      sinon.assert.match(passage.startPoint.firstCoordinates.y, dto.passageStartPoint.firstCoordinates.y);
      sinon.assert.match(passage.startPoint.lastCoordinates.x, dto.passageStartPoint.lastCoordinates.x);
      sinon.assert.match(passage.startPoint.lastCoordinates.y, dto.passageStartPoint.lastCoordinates.y);
      sinon.assert.match(passage.endPoint.floor.id.toString(), dto.passageEndPoint.floorId);
      sinon.assert.match(passage.endPoint.firstCoordinates.x, dto.passageEndPoint.firstCoordinates.x);
      sinon.assert.match(passage.endPoint.firstCoordinates.y, dto.passageEndPoint.firstCoordinates.y);
      sinon.assert.match(passage.endPoint.lastCoordinates.x, dto.passageEndPoint.lastCoordinates.x);
      sinon.assert.match(passage.endPoint.lastCoordinates.y, dto.passageEndPoint.lastCoordinates.y);
      sinon.assert.calledOnce(passageServiceSpy);
    });
    it("PassageController should return 404 if firstBuildingId not found", async function() {
      // Arrange
      let request: Partial<Request> = {
        query: {
          firstBuildingId: "1",
          lastBuildingId: "2"
        }
      };
      let response: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy()
      };

      buildingRepoMock.findByDomainId.onCall(0).resolves(null);

      let passageServiceInstance = Container.get(config.services.passage.name);
      const controller = new PassageController(passageServiceInstance as IPassageService);

      // Act
      await controller.listPassagesBetweenBuildings(<Request>request, <Response>response);

      // Assert
      sinon.assert.calledOnce(response.status);
      sinon.assert.calledWith(response.status, 404);
      sinon.assert.calledOnce(response.send);
      sinon.assert.calledWith(response.send,
        sinon.match({message: "First Building not found."})
        );
    });
    it("PassageController should return 404 if lastBuildingId not found", async function() {
      // Arrange
      let request: Partial<Request> = {
        query: {
          firstBuildingId: "1",
          lastBuildingId: "2"
        }
      };
      let response: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy()
      };

      buildingRepoMock.findByDomainId.onCall(0).resolves(BuildingDataSource.getBuildingA());
      buildingRepoMock.findByDomainId.onCall(1).resolves(null);

      let passageServiceInstance = Container.get(config.services.passage.name);
      const controller = new PassageController(passageServiceInstance as IPassageService);

      // Act
      await controller.listPassagesBetweenBuildings(<Request>request, <Response>response);

      // Assert
      sinon.assert.calledOnce(response.status);
      sinon.assert.calledWith(response.status, 404);
      sinon.assert.calledOnce(response.send);
      sinon.assert.calledWith(response.send,
        sinon.match({message:"Last Building not found."})
        );
    });
    it("PassageController should return 503 if there's a database error", async function() {
      // Arrange
      let request: Partial<Request> = {
        query: {
          firstBuildingId: "1",
          lastBuildingId: "2"
        }
      };
      let response: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy()
      };

      buildingRepoMock.findByDomainId.rejects(new Error("Database error."));

      let passageServiceInstance = Container.get(config.services.passage.name);
      const controller = new PassageController(passageServiceInstance as IPassageService);

      // Act
      await controller.listPassagesBetweenBuildings(<Request>request, <Response>response);
      // Assert
      sinon.assert.calledOnce(response.status);
      sinon.assert.calledWith(response.status, 503);
      sinon.assert.calledOnce(response.send);
      sinon.assert.calledWith(response.send,
        sinon.match({message:"Database error."})
        );
    });
    it("PassageController should return 401 if there's a unauthorized error", async function() {
      // Arrange
      let request: Partial<Request> = {
        query: {
          firstBuildingId: "1",
          lastBuildingId: "2"
        }
      };
      let response: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy()
      };

      let passageServiceInstance = Container.get(config.services.passage.name);
      sinon.stub(passageServiceInstance, "listPassagesBetweenBuildings").throws(new Error("You are not authorized to perform this action"));

      const controller = new PassageController(passageServiceInstance as IPassageService);

      // Act
        await controller.listPassagesBetweenBuildings(<Request>request, <Response>response);
        // Assert
        sinon.assert.calledOnce(response.status);
        sinon.assert.calledWith(response.status, 401);
        sinon.assert.calledOnce(response.send);
        sinon.assert.calledWith(response.send, "You are not authorized to perform this action");
    });
  });
  describe("listPassages", function() {
    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };
      Container.set("logger", loggerMock);
      
      passageRepoMock = {
        findAll: sinon.stub(),
      };
      Container.set(config.repos.passage.name, passageRepoMock);

      Container.set(config.factories.passage.name, passageBuilderMock);
      Container.set(config.services.positionChecker.name, positionCheckerServiceMock);
      Container.set(config.repos.floor.name, floorRepoMock);
      Container.set(config.repos.building.name, buildingRepoMock);


      let passageServiceClass = require("../../src/services/ServicesImpl/passageService").default;
      let passageServiceInstance = Container.get(passageServiceClass);
      Container.set(config.services.passage.name, passageServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Passage Controller unit test using PassageService stub results in a valid passage list', async ()=>{
      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      let passageServiceInstance = Container.get(config.services.passage.name);

      // Stub
      sinon.stub(passageServiceInstance, 'listPassages').returns(Result.ok<IPassageDTO[]>([PassageDataSource.getPassageADTO()]));

      const controller = new PassageController(passageServiceInstance as IPassageService);

      // Act
      await controller.listPassages(<Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(res.json, sinon.match([PassageDataSource.getPassageADTO()]));      
    });

    it('PassageController + PassageService integration test valid passage list', async () => {
      //Arrange
      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      let passage = Passage.create({
        passageStartPoint: PassagePoint.create({
          floor: FloorDataSource.getFirstFloor(),
          firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
          lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
        }).getValue(),
        passageEndPoint: PassagePoint.create({
          floor: FloorDataSource.getSecondFloor(),
          firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
          lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
        }).getValue()
      }, new UniqueEntityID("1")).getValue();

      //Stub repo methods
      passageRepoMock.findAll.resolves([passage]);

      let passageServiceInstance = Container.get(config.services.passage.name);
      const passageServiceSpy = sinon.spy(passageServiceInstance, 'listPassages');

      const controller = new PassageController(passageServiceInstance as IPassageService);

      //Act
      await controller.listPassages(<Response>res);

      const dto = PassageDataSource.getPassageADTO();

      //Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.match(passage.startPoint.floor.id.toString(), dto.passageStartPoint.floorId);
      sinon.assert.match(passage.startPoint.firstCoordinates.x, dto.passageStartPoint.firstCoordinates.x);
      sinon.assert.match(passage.startPoint.firstCoordinates.y, dto.passageStartPoint.firstCoordinates.y);
      sinon.assert.match(passage.startPoint.lastCoordinates.x, dto.passageStartPoint.lastCoordinates.x);
      sinon.assert.match(passage.startPoint.lastCoordinates.y, dto.passageStartPoint.lastCoordinates.y);
      sinon.assert.match(passage.endPoint.floor.id.toString(), dto.passageEndPoint.floorId);
      sinon.assert.match(passage.endPoint.firstCoordinates.x, dto.passageEndPoint.firstCoordinates.x);
      sinon.assert.match(passage.endPoint.firstCoordinates.y, dto.passageEndPoint.firstCoordinates.y);
      sinon.assert.match(passage.endPoint.lastCoordinates.x, dto.passageEndPoint.lastCoordinates.x);
      sinon.assert.match(passage.endPoint.lastCoordinates.y, dto.passageEndPoint.lastCoordinates.y);
      sinon.assert.calledOnce(passageServiceSpy);
    });

    it('PassageController should return 401 when user is not authorized', async() => {
      //Arrange
      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      let passageServiceInstance = Container.get(config.services.passage.name);
      sinon.stub(passageServiceInstance, 'listPassages').throws(new Error('You are not authorized to perform this action'));

      const controller = new PassageController(passageServiceInstance as IPassageService);

      //Act
      try{
        await controller.listPassages(<Response>res);
      }catch(error){
        //Assert
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 401);
        sinon.assert.calledOnce(res.send);
        sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
      }
    });

    it('PassageController should return 503 when there is a database error', async() => {
      //Arrange
      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      passageRepoMock.findAll.rejects(new Error('Database error.'));

      let passageServiceInstance = Container.get(config.services.passage.name);
      const controller = new PassageController(passageServiceInstance as IPassageService);

      //Act
      await controller.listPassages(<Response>res);

      //Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 503);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({message:'Database error.'}));
    });
  });
  describe("editPassage", function() {
    beforeEach(function() {
      Container.reset();
      loggerMock = {
        error: sinon.stub()
      };
      Container.set("logger", loggerMock);

      passageRepoMock = {
        findPassagesBetweenBuildings: sinon.stub(),
        findByDomainId: sinon.stub(),
        findByFloors: sinon.stub(),
        isTherePassageBetweenFloorAndBuilding: sinon.stub(),
        save: sinon.stub()
      };
      Container.set(config.repos.passage.name, passageRepoMock);

      floorRepoMock = {
        findByDomainId: sinon.stub()
      };
      Container.set(config.repos.floor.name, floorRepoMock);

      buildingRepoMock = {
        findByDomainId: sinon.stub()
      };
      Container.set(config.repos.building.name, buildingRepoMock);

      positionCheckerServiceMock = {
        isPositionAvailable: sinon.stub()
      };
      Container.set(config.services.positionChecker.name, positionCheckerServiceMock);

      passageBuilderMock = {
        build: sinon.stub()
      };
      Container.set(config.factories.passage.name, passageBuilderMock);

      let passageServiceClass = require("../../src/services/ServicesImpl/passageService").default;
      let passageServiceInstance = Container.get(passageServiceClass);
      Container.set(config.services.passage.name, passageServiceInstance);
    });

    afterEach(function() {
      sandbox.restore();
    });

    describe("is successful", function() {
      it("in unit test using PassageService stub", async function() {
        // Arrange
        let requestBody = {
          passageStartPoint: {
            floorId: FloorDataSource.getThirdFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 3
            },
            lastCoordinates: {
              x: 0,
              y: 2
            }
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0
            },
            lastCoordinates: {
              x: 1,
              y: 0
            }
          }
        };
        let request: Partial<Request> = {
          params: {
            id: "1"
          },
          body: requestBody
        };

        let response: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy()
        };

        let passageServiceInstance = Container.get(config.services.passage.name);

        // Stub the editPassage method in the PassageService
        sinon.stub(passageServiceInstance, "editPassage").returns(Result.ok<IPassageDTO>({
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getThirdFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 3
            },
            lastCoordinates: {
              x: 0,
              y: 2
            }
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0
            },
            lastCoordinates: {
              x: 1,
              y: 0
            }
          }
        }));

        const controller = new PassageController(passageServiceInstance as IPassageService);

        // Act
        await controller.editPassage(<Request>request, <Response>response);

        // Assert
        sinon.assert.calledOnce(response.json);
        sinon.assert.calledWith(response.json, sinon.match({
          domainId: "1",
          passageStartPoint: {
            floorId: FloorDataSource.getThirdFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 3
            },
            lastCoordinates: {
              x: 0,
              y: 2
            }
          },
          passageEndPoint: {
            floorId: FloorDataSource.getSecondFloor().id.toString(),
            firstCoordinates: {
              x: 0,
              y: 0
            },
            lastCoordinates: {
              x: 1,
              y: 0
            }
          }
        }));
      });
      describe("in integration test", async function() {
        it("with a full update", async function() {
          // Arrange
          let requestBody = {
            passageStartPoint: {
              floorId: FloorDataSource.getThirdFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 0
              },
              lastCoordinates: {
                x: 1,
                y: 0
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getThirdFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);
          floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(1).resolves(false);
          passageRepoMock.findByFloors.onCall(1).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(2).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(3).resolves(true);

          const startFirstCoordsProps = {
            x: requestBody.passageStartPoint.firstCoordinates.x,
            y: requestBody.passageStartPoint.firstCoordinates.y
          };
          const startLastCoordsProps = {
            x: requestBody.passageStartPoint.lastCoordinates.x,
            y: requestBody.passageStartPoint.lastCoordinates.y
          };
          const endFirstCoordsProps = {
            x: requestBody.passageEndPoint.firstCoordinates.x,
            y: requestBody.passageEndPoint.firstCoordinates.y
          };
          const endLastCoordsProps = {
            x: requestBody.passageEndPoint.lastCoordinates.x,
            y: requestBody.passageEndPoint.lastCoordinates.y
          };

          passageRepoMock.save.resolves(Passage.create({
            passageStartPoint: PassagePoint.create({
              floor: FloorDataSource.getThirdFloor(),
              firstCoordinates: Coordinates.create(startFirstCoordsProps).getValue(),
              lastCoordinates: Coordinates.create(startLastCoordsProps).getValue()
            }).getValue(),
            passageEndPoint: PassagePoint.create({
              floor: FloorDataSource.getSecondFloor(),
              firstCoordinates: Coordinates.create(endFirstCoordsProps).getValue(),
              lastCoordinates: Coordinates.create(endLastCoordsProps).getValue()
            }).getValue()
          }, new UniqueEntityID(passageId)).getValue());

          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          const dto = {
            domainId: passageId,
            passageStartPoint: {
              floorId: FloorDataSource.getThirdFloor().id.toString(),
              firstCoordinates: {
                x: requestBody.passageStartPoint.firstCoordinates.x,
                y: requestBody.passageStartPoint.firstCoordinates.y
              },
              lastCoordinates: {
                x: requestBody.passageStartPoint.lastCoordinates.x,
                y: requestBody.passageStartPoint.lastCoordinates.y
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: requestBody.passageEndPoint.firstCoordinates.x,
                y: requestBody.passageEndPoint.firstCoordinates.y
              },
              lastCoordinates: {
                x: requestBody.passageEndPoint.lastCoordinates.x,
                y: requestBody.passageEndPoint.lastCoordinates.y
              }
            }
          } as IPassageDTO;


          // Assert
          sinon.assert.calledOnce(response.json);
          sinon.assert.match(passageId, dto.domainId);
          sinon.assert.match(FloorDataSource.getThirdFloor().id.toString(), dto.passageStartPoint.floorId);
          sinon.assert.match(requestBody.passageStartPoint.firstCoordinates.x, dto.passageStartPoint.firstCoordinates.x);
          sinon.assert.match(requestBody.passageStartPoint.firstCoordinates.y, dto.passageStartPoint.firstCoordinates.y);
          sinon.assert.match(requestBody.passageStartPoint.lastCoordinates.x, dto.passageStartPoint.lastCoordinates.x);
          sinon.assert.match(requestBody.passageStartPoint.lastCoordinates.y, dto.passageStartPoint.lastCoordinates.y);
          sinon.assert.match(FloorDataSource.getSecondFloor().id.toString(), dto.passageEndPoint.floorId);
          sinon.assert.match(requestBody.passageEndPoint.firstCoordinates.x, dto.passageEndPoint.firstCoordinates.x);
          sinon.assert.match(requestBody.passageEndPoint.firstCoordinates.y, dto.passageEndPoint.firstCoordinates.y);
          sinon.assert.match(requestBody.passageEndPoint.lastCoordinates.x, dto.passageEndPoint.lastCoordinates.x);
          sinon.assert.match(requestBody.passageEndPoint.lastCoordinates.y, dto.passageEndPoint.lastCoordinates.y);
        });
        it("updating only start point floor", async function() {
          // Arrange
          let requestBody = {
            passageStartPoint: {
              floorId: FloorDataSource.getThirdFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getThirdFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);

          const startFirstCoordsProps = {
            x: requestBody.passageStartPoint.firstCoordinates.x,
            y: requestBody.passageStartPoint.firstCoordinates.y
          };
          const startLastCoordsProps = {
            x: requestBody.passageStartPoint.lastCoordinates.x,
            y: requestBody.passageStartPoint.lastCoordinates.y
          };

          passageRepoMock.save.resolves(Passage.create({
            passageStartPoint: PassagePoint.create({
              floor: FloorDataSource.getThirdFloor(),
              firstCoordinates: Coordinates.create(startFirstCoordsProps).getValue(),
              lastCoordinates: Coordinates.create(startLastCoordsProps).getValue()
            }).getValue(),
            passageEndPoint: PassagePoint.create({
              floor: FloorDataSource.getSecondFloor(),
              firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
              lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
            }).getValue()
          }, new UniqueEntityID(passageId)).getValue());

          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          const dto = {
            domainId: passageId,
            passageStartPoint: {
              floorId: FloorDataSource.getThirdFloor().id.toString(),
              firstCoordinates: {
                x: requestBody.passageStartPoint.firstCoordinates.x,
                y: requestBody.passageStartPoint.firstCoordinates.y
              },
              lastCoordinates: {
                x: requestBody.passageStartPoint.lastCoordinates.x,
                y: requestBody.passageStartPoint.lastCoordinates.y
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: PassageDataSource.getPassagePointB().firstCoordinates.x,
                y: PassageDataSource.getPassagePointB().firstCoordinates.y
              },
              lastCoordinates: {
                x: PassageDataSource.getPassagePointB().lastCoordinates.x,
                y: PassageDataSource.getPassagePointB().lastCoordinates.y
              }
            }
          } as IPassageDTO;

          // Assert
          sinon.assert.calledOnce(response.json);
          sinon.assert.match(passageId, dto.domainId);
          sinon.assert.match(FloorDataSource.getThirdFloor().id.toString(), dto.passageStartPoint.floorId);
          sinon.assert.match(requestBody.passageStartPoint.firstCoordinates.x, dto.passageStartPoint.firstCoordinates.x);
          sinon.assert.match(requestBody.passageStartPoint.firstCoordinates.y, dto.passageStartPoint.firstCoordinates.y);
          sinon.assert.match(requestBody.passageStartPoint.lastCoordinates.x, dto.passageStartPoint.lastCoordinates.x);
          sinon.assert.match(requestBody.passageStartPoint.lastCoordinates.y, dto.passageStartPoint.lastCoordinates.y);
          sinon.assert.match(FloorDataSource.getSecondFloor().id.toString(), dto.passageEndPoint.floorId);
          sinon.assert.match(PassageDataSource.getPassagePointB().firstCoordinates.x, dto.passageEndPoint.firstCoordinates.x);
          sinon.assert.match(PassageDataSource.getPassagePointB().firstCoordinates.y, dto.passageEndPoint.firstCoordinates.y);
          sinon.assert.match(PassageDataSource.getPassagePointB().lastCoordinates.x, dto.passageEndPoint.lastCoordinates.x);
          sinon.assert.match(PassageDataSource.getPassagePointB().lastCoordinates.y, dto.passageEndPoint.lastCoordinates.y);
        });
        it("updating only end point floor", async function() {
          // Arrange
          let requestBody = {
            passageEndPoint: {
              floorId: FloorDataSource.getThirdFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getThirdFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);

          const endFirstCoordsProps = {
            x: requestBody.passageEndPoint.firstCoordinates.x,
            y: requestBody.passageEndPoint.firstCoordinates.y
          };
          const endLastCoordsProps = {
            x: requestBody.passageEndPoint.lastCoordinates.x,
            y: requestBody.passageEndPoint.lastCoordinates.y
          };

          passageRepoMock.save.resolves(Passage.create({
            passageStartPoint: PassagePoint.create({
              floor: FloorDataSource.getFirstFloor(),
              firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
              lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
            }).getValue(),
            passageEndPoint: PassagePoint.create({
              floor: FloorDataSource.getThirdFloor(),
              firstCoordinates: Coordinates.create(endFirstCoordsProps).getValue(),
              lastCoordinates: Coordinates.create(endLastCoordsProps).getValue()
            }).getValue()
          }, new UniqueEntityID(passageId)).getValue());

          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          const dto = {
            domainId: passageId,
            passageStartPoint: {
              floorId: FloorDataSource.getFirstFloor().id.toString(),
              firstCoordinates: {
                x: PassageDataSource.getPassagePointA().firstCoordinates.x,
                y: PassageDataSource.getPassagePointA().firstCoordinates.y
              },
              lastCoordinates: {
                x: PassageDataSource.getPassagePointA().lastCoordinates.x,
                y: PassageDataSource.getPassagePointA().lastCoordinates.y
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getThirdFloor().id.toString(),
              firstCoordinates: {
                x: requestBody.passageEndPoint.firstCoordinates.x,
                y: requestBody.passageEndPoint.firstCoordinates.y
              },
              lastCoordinates: {
                x: requestBody.passageEndPoint.lastCoordinates.x,
                y: requestBody.passageEndPoint.lastCoordinates.y
              }
            }
          } as IPassageDTO;

          // Assert
          sinon.assert.calledOnce(response.json);
          sinon.assert.match(passageId, dto.domainId);
          sinon.assert.match(FloorDataSource.getFirstFloor().id.toString(), dto.passageStartPoint.floorId);
          sinon.assert.match(PassageDataSource.getPassagePointA().firstCoordinates.x, dto.passageStartPoint.firstCoordinates.x);
          sinon.assert.match(PassageDataSource.getPassagePointA().firstCoordinates.y, dto.passageStartPoint.firstCoordinates.y);
          sinon.assert.match(PassageDataSource.getPassagePointA().lastCoordinates.x, dto.passageStartPoint.lastCoordinates.x);
          sinon.assert.match(PassageDataSource.getPassagePointA().lastCoordinates.y, dto.passageStartPoint.lastCoordinates.y);
          sinon.assert.match(FloorDataSource.getThirdFloor().id.toString(), dto.passageEndPoint.floorId);
          sinon.assert.match(requestBody.passageEndPoint.firstCoordinates.x, dto.passageEndPoint.firstCoordinates.x);
          sinon.assert.match(requestBody.passageEndPoint.firstCoordinates.y, dto.passageEndPoint.firstCoordinates.y);
          sinon.assert.match(requestBody.passageEndPoint.lastCoordinates.x, dto.passageEndPoint.lastCoordinates.x);
          sinon.assert.match(requestBody.passageEndPoint.lastCoordinates.y, dto.passageEndPoint.lastCoordinates.y);
        });
        it("updating only start point coordinates", async function() {
          // Arrange
          let requestBody = {
            passageStartPoint: {
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);

          const startFirstCoordsProps = {
            x: requestBody.passageStartPoint.firstCoordinates.x,
            y: requestBody.passageStartPoint.firstCoordinates.y
          };
          const startLastCoordsProps = {
            x: requestBody.passageStartPoint.lastCoordinates.x,
            y: requestBody.passageStartPoint.lastCoordinates.y
          };

          passageRepoMock.save.resolves(Passage.create({
            passageStartPoint: PassagePoint.create({
              floor: FloorDataSource.getFirstFloor(),
              firstCoordinates: Coordinates.create(startFirstCoordsProps).getValue(),
              lastCoordinates: Coordinates.create(startLastCoordsProps).getValue()
            }).getValue(),
            passageEndPoint: PassagePoint.create({
              floor: FloorDataSource.getSecondFloor(),
              firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
              lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
            }).getValue()
          }, new UniqueEntityID(passageId)).getValue());

          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          const dto = {
            domainId: passageId,
            passageStartPoint: {
              floorId: FloorDataSource.getFirstFloor().id.toString(),
              firstCoordinates: {
                x: requestBody.passageStartPoint.firstCoordinates.x,
                y: requestBody.passageStartPoint.firstCoordinates.y
              },
              lastCoordinates: {
                x: requestBody.passageStartPoint.lastCoordinates.x,
                y: requestBody.passageStartPoint.lastCoordinates.y
              }
            }
          };

          // Assert
          sinon.assert.calledOnce(response.json);
          sinon.assert.match(passageId, dto.domainId);
          sinon.assert.match(FloorDataSource.getFirstFloor().id.toString(), dto.passageStartPoint.floorId);
          sinon.assert.match(requestBody.passageStartPoint.firstCoordinates.x, dto.passageStartPoint.firstCoordinates.x);
          sinon.assert.match(requestBody.passageStartPoint.firstCoordinates.y, dto.passageStartPoint.firstCoordinates.y);
          sinon.assert.match(requestBody.passageStartPoint.lastCoordinates.x, dto.passageStartPoint.lastCoordinates.x);
          sinon.assert.match(requestBody.passageStartPoint.lastCoordinates.y, dto.passageStartPoint.lastCoordinates.y);
        });
        it("updating only end point coordinates", async function() {
          // Arrange
          let requestBody = {
            passageEndPoint: {
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);

          const endFirstCoordsProps = {
            x: requestBody.passageEndPoint.firstCoordinates.x,
            y: requestBody.passageEndPoint.firstCoordinates.y
          };
          const endLastCoordsProps = {
            x: requestBody.passageEndPoint.lastCoordinates.x,
            y: requestBody.passageEndPoint.lastCoordinates.y
          };

          passageRepoMock.save.resolves(Passage.create({
            passageStartPoint: PassagePoint.create({
              floor: FloorDataSource.getFirstFloor(),
              firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
              lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
            }).getValue(),
            passageEndPoint: PassagePoint.create({
              floor: FloorDataSource.getSecondFloor(),
              firstCoordinates: Coordinates.create(endFirstCoordsProps).getValue(),
              lastCoordinates: Coordinates.create(endLastCoordsProps).getValue()
            }).getValue()
          }, new UniqueEntityID(passageId)).getValue());

          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          const dto = {
            domainId: passageId,
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: requestBody.passageEndPoint.firstCoordinates.x,
                y: requestBody.passageEndPoint.firstCoordinates.y
              },
              lastCoordinates: {
                x: requestBody.passageEndPoint.lastCoordinates.x,
                y: requestBody.passageEndPoint.lastCoordinates.y
              }
            }
          };

          // Assert
          sinon.assert.calledOnce(response.json);
          sinon.assert.match(passageId, dto.domainId);
          sinon.assert.match(FloorDataSource.getSecondFloor().id.toString(), dto.passageEndPoint.floorId);
          sinon.assert.match(requestBody.passageEndPoint.firstCoordinates.x, dto.passageEndPoint.firstCoordinates.x);
          sinon.assert.match(requestBody.passageEndPoint.firstCoordinates.y, dto.passageEndPoint.firstCoordinates.y);
          sinon.assert.match(requestBody.passageEndPoint.lastCoordinates.x, dto.passageEndPoint.lastCoordinates.x);
          sinon.assert.match(requestBody.passageEndPoint.lastCoordinates.y, dto.passageEndPoint.lastCoordinates.y);
        });
        it("if no data is provided return the same passage", async function() {
          // Arrange
          let requestBody = {};

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          const passage = PassageDataSource.getPassageA();
          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(passage);
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);

          passageRepoMock.save.resolves(passage);

          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          const dto = {
            domainId: passageId,
            passageStartPoint: {
              floorId: FloorDataSource.getFirstFloor().id.toString(),
              firstCoordinates: {
                x: PassageDataSource.getPassagePointA().firstCoordinates.x,
                y: PassageDataSource.getPassagePointA().firstCoordinates.y
              },
              lastCoordinates: {
                x: PassageDataSource.getPassagePointA().lastCoordinates.x,
                y: PassageDataSource.getPassagePointA().lastCoordinates.y
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: PassageDataSource.getPassagePointB().firstCoordinates.x,
                y: PassageDataSource.getPassagePointB().firstCoordinates.y
              },
              lastCoordinates: {
                x: PassageDataSource.getPassagePointB().lastCoordinates.x,
                y: PassageDataSource.getPassagePointB().lastCoordinates.y
              }
            }
          } as IPassageDTO;

          // Assert
          sinon.assert.calledOnce(response.json);
          sinon.assert.match(passageId, dto.domainId);
          sinon.assert.match(FloorDataSource.getFirstFloor().id.toString(), dto.passageStartPoint.floorId);
          sinon.assert.match(PassageDataSource.getPassagePointA().firstCoordinates.x, dto.passageStartPoint.firstCoordinates.x);
          sinon.assert.match(PassageDataSource.getPassagePointA().firstCoordinates.y, dto.passageStartPoint.firstCoordinates.y);
          sinon.assert.match(PassageDataSource.getPassagePointA().lastCoordinates.x, dto.passageStartPoint.lastCoordinates.x);
          sinon.assert.match(PassageDataSource.getPassagePointA().lastCoordinates.y, dto.passageStartPoint.lastCoordinates.y);
          sinon.assert.match(FloorDataSource.getSecondFloor().id.toString(), dto.passageEndPoint.floorId);
          sinon.assert.match(PassageDataSource.getPassagePointB().firstCoordinates.x, dto.passageEndPoint.firstCoordinates.x);
          sinon.assert.match(PassageDataSource.getPassagePointB().firstCoordinates.y, dto.passageEndPoint.firstCoordinates.y);
          sinon.assert.match(PassageDataSource.getPassagePointB().lastCoordinates.x, dto.passageEndPoint.lastCoordinates.x);
          sinon.assert.match(PassageDataSource.getPassagePointB().lastCoordinates.y, dto.passageEndPoint.lastCoordinates.y);
        });
        it("if startpoint floor not provided, use the existing one", async function() {
          // Arrange
          let requestBody = {
            passageStartPoint: {
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 0
              },
              lastCoordinates: {
                x: 1,
                y: 0
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          const passage = PassageDataSource.getPassageA();
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(passage);
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
          floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(2).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(3).resolves(true);

          const startFirstCoordsProps = {
            x: requestBody.passageStartPoint.firstCoordinates.x,
            y: requestBody.passageStartPoint.firstCoordinates.y
          };
          const startLastCoordsProps = {
            x: requestBody.passageStartPoint.lastCoordinates.x,
            y: requestBody.passageStartPoint.lastCoordinates.y
          };
          const endFirstCoordsProps = {
            x: requestBody.passageEndPoint.firstCoordinates.x,
            y: requestBody.passageEndPoint.firstCoordinates.y
          };
          const endLastCoordsProps = {
            x: requestBody.passageEndPoint.lastCoordinates.x,
            y: requestBody.passageEndPoint.lastCoordinates.y
          };

          passageRepoMock.save.resolves(Passage.create({
            passageStartPoint: PassagePoint.create({
              floor: FloorDataSource.getFirstFloor(),
              firstCoordinates: Coordinates.create(startFirstCoordsProps).getValue(),
              lastCoordinates: Coordinates.create(startLastCoordsProps).getValue()
            }).getValue(),
            passageEndPoint: PassagePoint.create({
              floor: FloorDataSource.getSecondFloor(),
              firstCoordinates: Coordinates.create(endFirstCoordsProps).getValue(),
              lastCoordinates: Coordinates.create(endLastCoordsProps).getValue()
            }).getValue()
          }, new UniqueEntityID(passageId)).getValue());

          let passageServiceInstance = Container.get(config.services.passage.name);

          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          const dto = {
            domainId: passageId,
            passageStartPoint: {
              floorId: FloorDataSource.getFirstFloor().id.toString(),
              firstCoordinates: {
                x: requestBody.passageStartPoint.firstCoordinates.x,
                y: requestBody.passageStartPoint.firstCoordinates.y
              },
              lastCoordinates: {
                x: requestBody.passageStartPoint.lastCoordinates.x,
                y: requestBody.passageStartPoint.lastCoordinates.y
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: requestBody.passageEndPoint.firstCoordinates.x,
                y: requestBody.passageEndPoint.firstCoordinates.y
              },
              lastCoordinates: {
                x: requestBody.passageEndPoint.lastCoordinates.x,
                y: requestBody.passageEndPoint.lastCoordinates.y
              }
            }
          } as IPassageDTO;

          // Assert
          sinon.assert.calledOnce(response.json);
          sinon.assert.match(passageId, dto.domainId);
          sinon.assert.match(FloorDataSource.getFirstFloor().id.toString(), dto.passageStartPoint.floorId);
          sinon.assert.match(requestBody.passageStartPoint.firstCoordinates.x, dto.passageStartPoint.firstCoordinates.x);
          sinon.assert.match(requestBody.passageStartPoint.firstCoordinates.y, dto.passageStartPoint.firstCoordinates.y);
          sinon.assert.match(requestBody.passageStartPoint.lastCoordinates.x, dto.passageStartPoint.lastCoordinates.x);
          sinon.assert.match(requestBody.passageStartPoint.lastCoordinates.y, dto.passageStartPoint.lastCoordinates.y);
          sinon.assert.match(FloorDataSource.getSecondFloor().id.toString(), dto.passageEndPoint.floorId);
          sinon.assert.match(requestBody.passageEndPoint.firstCoordinates.x, dto.passageEndPoint.firstCoordinates.x);
          sinon.assert.match(requestBody.passageEndPoint.firstCoordinates.y, dto.passageEndPoint.firstCoordinates.y);
          sinon.assert.match(requestBody.passageEndPoint.lastCoordinates.x, dto.passageEndPoint.lastCoordinates.x);
          sinon.assert.match(requestBody.passageEndPoint.lastCoordinates.y, dto.passageEndPoint.lastCoordinates.y);
        });
        it("if endpoint floor not provided, use the existing one", async function() {
          // Arrange
          let requestBody = {
            passageStartPoint: {
              floorId: FloorDataSource.getFirstFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 0
              },
              lastCoordinates: {
                x: 1,
                y: 0
              }
            },
            passageEndPoint: {
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          const passage = PassageDataSource.getPassageA();
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(passage);
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
          floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(2).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(3).resolves(true);

          const startFirstCoordsProps = {
            x: requestBody.passageStartPoint.firstCoordinates.x,
            y: requestBody.passageStartPoint.firstCoordinates.y
          };
          const startLastCoordsProps = {
            x: requestBody.passageStartPoint.lastCoordinates.x,
            y: requestBody.passageStartPoint.lastCoordinates.y
          };
          const endFirstCoordsProps = {
            x: requestBody.passageEndPoint.firstCoordinates.x,
            y: requestBody.passageEndPoint.firstCoordinates.y
          };
          const endLastCoordsProps = {
            x: requestBody.passageEndPoint.lastCoordinates.x,
            y: requestBody.passageEndPoint.lastCoordinates.y
          };

          passageRepoMock.save.resolves(Passage.create({
            passageStartPoint: PassagePoint.create({
              floor: FloorDataSource.getFirstFloor(),
              firstCoordinates: Coordinates.create(startFirstCoordsProps).getValue(),
              lastCoordinates: Coordinates.create(startLastCoordsProps).getValue()
            }).getValue(),
            passageEndPoint: PassagePoint.create({
              floor: FloorDataSource.getSecondFloor(),
              firstCoordinates: Coordinates.create(endFirstCoordsProps).getValue(),
              lastCoordinates: Coordinates.create(endLastCoordsProps).getValue()
            }).getValue()
          }, new UniqueEntityID(passageId)).getValue());

          let passageServiceInstance = Container.get(config.services.passage.name);

          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          const dto = {
            domainId: passageId,
            passageStartPoint: {
              floorId: FloorDataSource.getFirstFloor().id.toString(),
              firstCoordinates: {
                x: requestBody.passageStartPoint.firstCoordinates.x,
                y: requestBody.passageStartPoint.firstCoordinates.y
              },
              lastCoordinates: {
                x: requestBody.passageStartPoint.lastCoordinates.x,
                y: requestBody.passageStartPoint.lastCoordinates.y
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: requestBody.passageEndPoint.firstCoordinates.x,
                y: requestBody.passageEndPoint.firstCoordinates.y
              },
              lastCoordinates: {
                x: requestBody.passageEndPoint.lastCoordinates.x,
                y: requestBody.passageEndPoint.lastCoordinates.y
              }
            }
          } as IPassageDTO;

          // Assert
          sinon.assert.calledOnce(response.json);
          sinon.assert.match(passageId, dto.domainId);
          sinon.assert.match(FloorDataSource.getFirstFloor().id.toString(), dto.passageStartPoint.floorId);
          sinon.assert.match(requestBody.passageStartPoint.firstCoordinates.x, dto.passageStartPoint.firstCoordinates.x);
          sinon.assert.match(requestBody.passageStartPoint.firstCoordinates.y, dto.passageStartPoint.firstCoordinates.y);
          sinon.assert.match(requestBody.passageStartPoint.lastCoordinates.x, dto.passageStartPoint.lastCoordinates.x);
          sinon.assert.match(requestBody.passageStartPoint.lastCoordinates.y, dto.passageStartPoint.lastCoordinates.y);
          sinon.assert.match(FloorDataSource.getSecondFloor().id.toString(), dto.passageEndPoint.floorId);
          sinon.assert.match(requestBody.passageEndPoint.firstCoordinates.x, dto.passageEndPoint.firstCoordinates.x);
          sinon.assert.match(requestBody.passageEndPoint.firstCoordinates.y, dto.passageEndPoint.firstCoordinates.y);
          sinon.assert.match(requestBody.passageEndPoint.lastCoordinates.x, dto.passageEndPoint.lastCoordinates.x);
          sinon.assert.match(requestBody.passageEndPoint.lastCoordinates.y, dto.passageEndPoint.lastCoordinates.y);
        });
        it("if starpoint coordinates not provided, use the existing ones", async function() {
          // Arrange
          let requestBody = {
            passageStartPoint: {
              floorId: FloorDataSource.getFirstFloor().id.toString()
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 0
              },
              lastCoordinates: {
                x: 1,
                y: 0
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          const passage = PassageDataSource.getPassageA();
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(passage);
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
          floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(2).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(3).resolves(true);

          const startFirstCoordsProps = {
            x: PassageDataSource.getPassagePointA().firstCoordinates.x,
            y: PassageDataSource.getPassagePointA().firstCoordinates.y
          };
          const startLastCoordsProps = {
            x: PassageDataSource.getPassagePointA().lastCoordinates.x,
            y: PassageDataSource.getPassagePointA().lastCoordinates.y
          };
          const endFirstCoordsProps = {
            x: requestBody.passageEndPoint.firstCoordinates.x,
            y: requestBody.passageEndPoint.firstCoordinates.y
          };
          const endLastCoordsProps = {
            x: requestBody.passageEndPoint.lastCoordinates.x,
            y: requestBody.passageEndPoint.lastCoordinates.y
          };

          passageRepoMock.save.resolves(Passage.create({
            passageStartPoint: PassagePoint.create({
              floor: FloorDataSource.getFirstFloor(),
              firstCoordinates: Coordinates.create(startFirstCoordsProps).getValue(),
              lastCoordinates: Coordinates.create(startLastCoordsProps).getValue()
            }).getValue(),
            passageEndPoint: PassagePoint.create({
              floor: FloorDataSource.getSecondFloor(),
              firstCoordinates: Coordinates.create(endFirstCoordsProps).getValue(),
              lastCoordinates: Coordinates.create(endLastCoordsProps).getValue()
            }).getValue()
          }, new UniqueEntityID(passageId)).getValue());

          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          const dto = {
            domainId: passageId,
            passageStartPoint: {
              floorId: FloorDataSource.getFirstFloor().id.toString(),
              firstCoordinates: {
                x: PassageDataSource.getPassagePointA().firstCoordinates.x,
                y: PassageDataSource.getPassagePointA().firstCoordinates.y
              },
              lastCoordinates: {
                x: PassageDataSource.getPassagePointA().lastCoordinates.x,
                y: PassageDataSource.getPassagePointA().lastCoordinates.y
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: requestBody.passageEndPoint.firstCoordinates.x,
                y: requestBody.passageEndPoint.firstCoordinates.y
              },
              lastCoordinates: {
                x: requestBody.passageEndPoint.lastCoordinates.x,
                y: requestBody.passageEndPoint.lastCoordinates.y
              }
            }
          } as IPassageDTO;

          // Assert
          sinon.assert.calledOnce(response.json);
          sinon.assert.match(passageId, dto.domainId);
          sinon.assert.match(FloorDataSource.getFirstFloor().id.toString(), dto.passageStartPoint.floorId);
          sinon.assert.match(PassageDataSource.getPassagePointA().firstCoordinates.x, dto.passageStartPoint.firstCoordinates.x);
          sinon.assert.match(PassageDataSource.getPassagePointA().firstCoordinates.y, dto.passageStartPoint.firstCoordinates.y);
          sinon.assert.match(PassageDataSource.getPassagePointA().lastCoordinates.x, dto.passageStartPoint.lastCoordinates.x);
          sinon.assert.match(PassageDataSource.getPassagePointA().lastCoordinates.y, dto.passageStartPoint.lastCoordinates.y);
          sinon.assert.match(FloorDataSource.getSecondFloor().id.toString(), dto.passageEndPoint.floorId);
          sinon.assert.match(requestBody.passageEndPoint.firstCoordinates.x, dto.passageEndPoint.firstCoordinates.x);
          sinon.assert.match(requestBody.passageEndPoint.firstCoordinates.y, dto.passageEndPoint.firstCoordinates.y);
          sinon.assert.match(requestBody.passageEndPoint.lastCoordinates.x, dto.passageEndPoint.lastCoordinates.x);
          sinon.assert.match(requestBody.passageEndPoint.lastCoordinates.y, dto.passageEndPoint.lastCoordinates.y);
        });
        it("if endpoint coordinates not provided, use the existing ones", async function() {
          // Arrange
          let requestBody = {
            passageStartPoint: {
              floorId: FloorDataSource.getFirstFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 0
              },
              lastCoordinates: {
                x: 1,
                y: 0
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString()
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          const passage = PassageDataSource.getPassageA();
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(passage);
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
          floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(2).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(3).resolves(true);

          const startFirstCoordsProps = {
            x: requestBody.passageStartPoint.firstCoordinates.x,
            y: requestBody.passageStartPoint.firstCoordinates.y
          };
          const startLastCoordsProps = {
            x: requestBody.passageStartPoint.lastCoordinates.x,
            y: requestBody.passageStartPoint.lastCoordinates.y
          };
          const endFirstCoordsProps = {
            x: PassageDataSource.getPassagePointB().firstCoordinates.x,
            y: PassageDataSource.getPassagePointB().firstCoordinates.y
          };
          const endLastCoordsProps = {
            x: PassageDataSource.getPassagePointB().lastCoordinates.x,
            y: PassageDataSource.getPassagePointB().lastCoordinates.y
          };

          passageRepoMock.save.resolves(Passage.create({
            passageStartPoint: PassagePoint.create({
              floor: FloorDataSource.getFirstFloor(),
              firstCoordinates: Coordinates.create(startFirstCoordsProps).getValue(),
              lastCoordinates: Coordinates.create(startLastCoordsProps).getValue()
            }).getValue(),
            passageEndPoint: PassagePoint.create({
              floor: FloorDataSource.getSecondFloor(),
              firstCoordinates: Coordinates.create(endFirstCoordsProps).getValue(),
              lastCoordinates: Coordinates.create(endLastCoordsProps).getValue()
            }).getValue()
          }, new UniqueEntityID(passageId)).getValue());

          let passageServiceInstance = Container.get(config.services.passage.name);

          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          const dto = {
            domainId: passageId,
            passageStartPoint: {
              floorId: FloorDataSource.getFirstFloor().id.toString(),
              firstCoordinates: {
                x: requestBody.passageStartPoint.firstCoordinates.x,
                y: requestBody.passageStartPoint.firstCoordinates.y
              },
              lastCoordinates: {
                x: requestBody.passageStartPoint.lastCoordinates.x,
                y: requestBody.passageStartPoint.lastCoordinates.y
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: PassageDataSource.getPassagePointB().firstCoordinates.x,
                y: PassageDataSource.getPassagePointB().firstCoordinates.y
              },
              lastCoordinates: {
                x: PassageDataSource.getPassagePointB().lastCoordinates.x,
                y: PassageDataSource.getPassagePointB().lastCoordinates.y
              }
            }
          } as IPassageDTO;

          // Assert
          sinon.assert.calledOnce(response.json);
          sinon.assert.match(passageId, dto.domainId);
          sinon.assert.match(FloorDataSource.getFirstFloor().id.toString(), dto.passageStartPoint.floorId);
          sinon.assert.match(requestBody.passageStartPoint.firstCoordinates.x, dto.passageStartPoint.firstCoordinates.x);
          sinon.assert.match(requestBody.passageStartPoint.firstCoordinates.y, dto.passageStartPoint.firstCoordinates.y);
          sinon.assert.match(requestBody.passageStartPoint.lastCoordinates.x, dto.passageStartPoint.lastCoordinates.x);
          sinon.assert.match(requestBody.passageStartPoint.lastCoordinates.y, dto.passageStartPoint.lastCoordinates.y);
          sinon.assert.match(FloorDataSource.getSecondFloor().id.toString(), dto.passageEndPoint.floorId);
          sinon.assert.match(PassageDataSource.getPassagePointB().firstCoordinates.x, dto.passageEndPoint.firstCoordinates.x);
          sinon.assert.match(PassageDataSource.getPassagePointB().firstCoordinates.y, dto.passageEndPoint.firstCoordinates.y);
          sinon.assert.match(PassageDataSource.getPassagePointB().lastCoordinates.x, dto.passageEndPoint.lastCoordinates.x);
          sinon.assert.match(PassageDataSource.getPassagePointB().lastCoordinates.y, dto.passageEndPoint.lastCoordinates.y);
        });
        it("is failure where passage does not exist", async function() {
          // Arrange
          let requestBody = {
            passageStartPoint: {
              floorId: FloorDataSource.getThirdFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 0
              },
              lastCoordinates: {
                x: 1,
                y: 0
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(null);

          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 404);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send,
            sinon.match({message:"Passage not found."})
            );
        });
        it("is failure when start point floor does not exist", async function() {
          // Arrange
          let requestBody = {
            passageStartPoint: {
              floorId: FloorDataSource.getThirdFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 0
              },
              lastCoordinates: {
                x: 1,
                y: 0
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          floorRepoMock.findByDomainId.onCall(0).resolves(null);

          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 404);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send,
            sinon.match({message:"Start Point Floor not found."})
            );
        });
        it("is failure when isTherePassageBetweenFloorAndBuilding returns true for start point", async function() {
// Arrange
          let requestBody = {
            passageStartPoint: {
              floorId: FloorDataSource.getThirdFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 0
              },
              lastCoordinates: {
                x: 1,
                y: 0
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getThirdFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(true);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 409);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send,
            sinon.match({message:"There is already a passage from the floor " + FloorDataSource.getThirdFloor().building.code.value + FloorDataSource.getThirdFloor().floorNumber.value + " to the building " + FloorDataSource.getSecondFloor().building.code.value + '.'})
            );
        });
        it("is failure when findByFloors returns a passage for start point", async function() {
// Arrange
          let requestBody = {
            passageStartPoint: {
              floorId: FloorDataSource.getThirdFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 0
              },
              lastCoordinates: {
                x: 1,
                y: 0
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getThirdFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(PassageDataSource.getPassageA());

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 409);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send,
            sinon.match({message:"Passage already exists between the selected floors."})
            );
        });
        it("is failure when isPositionAvailable returns false for start point", async function() {
// Arrange
          let requestBody = {
            passageStartPoint: {
              floorId: FloorDataSource.getThirdFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 0
              },
              lastCoordinates: {
                x: 1,
                y: 0
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getThirdFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(false);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 400);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send,
            sinon.match({message:"Coordinates (" + requestBody.passageStartPoint.firstCoordinates.x + "," + requestBody.passageStartPoint.firstCoordinates.y + ") are occupied."})
            );
        });
        it("is failure when end point floor is not found", async function() {
// Arrange
          let requestBody = {
            passageEndPoint: {
              floorId: FloorDataSource.getThirdFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };

          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          floorRepoMock.findByDomainId.onCall(0).resolves(null);

          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Act
          await controller.editPassage(<Request>request, <Response>response);
          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 404);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send,
            sinon.match({message:"End Point Floor not found."})
            );
        });
        it("is failure when isTherePassageBetweenFloorAndBuilding returns true for end point", async function() {
// Arrange
          let requestBody = {
            passageStartPoint: {
              floorId: FloorDataSource.getThirdFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getFirstFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 0
              },
              lastCoordinates: {
                x: 1,
                y: 0
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getThirdFloor());
          floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getFirstFloor());
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(2).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(3).resolves(true);
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(1).resolves(true);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 409);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send,
            sinon.match({message:"There is already a passage from the floor " + FloorDataSource.getFirstFloor().building.code.value + FloorDataSource.getFirstFloor().floorNumber.value + " to the building " + FloorDataSource.getThirdFloor().building.code.value + '.'})
            );
        });
        it("is failure when findByFloors returns a passage for end point", async function() {
// Arrange
          let requestBody = {
            passageEndPoint: {
              floorId: FloorDataSource.getFirstFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            },
            passageStartPoint: {
              floorId: FloorDataSource.getThirdFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 0
              },
              lastCoordinates: {
                x: 1,
                y: 0
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());
          floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getThirdFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);
          passageRepoMock.findByFloors.onCall(1).resolves(PassageDataSource.getPassageA())

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 409);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send,
            sinon.match({message:"Passage already exists between the selected floors."})
            );
        });
        it("is failure when isPositionAvailable returns false for end point", async function() {
// Arrange
          let requestBody = {
            passageStartPoint: {
              floorId: FloorDataSource.getThirdFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 0
              },
              lastCoordinates: {
                x: 1,
                y: 0
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getThirdFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(2).resolves(false);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 400);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send,
            sinon.match({message:"Coordinates (" + requestBody.passageEndPoint.firstCoordinates.x + "," + requestBody.passageEndPoint.firstCoordinates.y + ") are occupied."})
            );
        });
        it("is failure when floors belong to the same building (startpoint)", async function() {
          // Arrange
          let requestBody = {
            passageStartPoint: {
              floorId: FloorDataSource.getFourthFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFourthFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 400);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send,
            sinon.match({message:"You can't create a passage between floors of the same building."})
            );
        });
        it("is failure when floors belong to the same building (endpoint)", async function() {
          // Arrange
          let requestBody = {
            passageEndPoint: {
              floorId: FloorDataSource.getFifthFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFifthFloor());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 400);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send,
            sinon.match({message:"You can't create a passage between floors of the same building."})
            );
        });
        it("is failure when updateStartPoint returns a failure", async function() {
          // Arrange
          let requestBody = {
            passageStartPoint: {
              firstCoordinates: {
                x: 0.2,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 400);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send,
            sinon.match({message:"Coordinates must be integer numbers."})
            );
        });
        it("is failure when updateEndPoint returns a failure", async function() {
          // Arrange
          let requestBody = {
            passageEndPoint: {
              firstCoordinates: {
                x: 0.2,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Stub repo methods
          passageRepoMock.findByDomainId.resolves(PassageDataSource.getPassageA());
          passageRepoMock.isTherePassageBetweenFloorAndBuilding.onCall(0).resolves(false);
          passageRepoMock.findByFloors.onCall(0).resolves(null);
          positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
          positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 400);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send,
            sinon.match({message:"Coordinates must be integer numbers."})
            );
        });
        it("is failure when a 503 database error occurs", async function() {
// Arrange
          let requestBody = {
            passageStartPoint: {
              floorId: FloorDataSource.getFirstFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 0
              },
              lastCoordinates: {
                x: 1,
                y: 0
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Stub repo methods
          passageRepoMock.findByDomainId.rejects(new Error("Database error"));

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 503);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send,
            sinon.match({message:"Database error"})
            );
        });
        it("is failure when a 400 typeerror occurs" , async function() {
          // Arrange
          let requestBody = {
            passageStartPoint: {
              floorId: FloorDataSource.getFirstFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 0
              },
              lastCoordinates: {
                x: 1,
                y: 0
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          let passageServiceInstance = Container.get(config.services.passage.name);
          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Stub repo methods
          passageRepoMock.findByDomainId.rejects(new TypeError("Invalid Input."));

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 400);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send,
            sinon.match({message:"Invalid Input."})
            );
        });
        it("is failure when a 401 unauthorized error occurs", async function() {

          let requestBody = {
            passageStartPoint: {
              floorId: FloorDataSource.getFirstFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 3
              },
              lastCoordinates: {
                x: 0,
                y: 2
              }
            },
            passageEndPoint: {
              floorId: FloorDataSource.getSecondFloor().id.toString(),
              firstCoordinates: {
                x: 0,
                y: 0
              },
              lastCoordinates: {
                x: 1,
                y: 0
              }
            }
          };

          let request: Partial<Request> = {
            body: requestBody
          };
          const passageId = "1";
          request.params = {
            id: "1"
          };
          let response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
          };
          let passageServiceInstance = Container.get(config.services.passage.name);
          sinon.stub(passageServiceInstance, "editPassage").throws(new Error("You are not authorized to perform this action"));

          const controller = new PassageController(passageServiceInstance as IPassageService);

          // Act
          await controller.editPassage(<Request>request, <Response>response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 401);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send, "You are not authorized to perform this action");
        });
      });
    });
  });
});
