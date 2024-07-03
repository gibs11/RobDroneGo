import {UniqueEntityID} from "../../src/core/domain/UniqueEntityID";
import {Floor} from "../../src/domain/floor/floor";
import {FloorNumber} from "../../src/domain/floor/floorNumber";
import BuildingDataSource from "./buildingDataSource";
import IFloorOutDTO from "../../src/dto/out/IFloorOutDTO";
import {FloorPlan} from "../../src/domain/floor/floorPlan";
import IFloorDTO from "../../src/dto/IFloorDTO";

class FloorDataSource {
  static getFirstFloorOutDTO(): IFloorOutDTO {
    return {
      domainId: '1',
      floorNumber: 1,
      building: BuildingDataSource.getBuildingAdto(),
    }
  }

  static getFirstFloorDto(): IFloorDTO {
      return {
        domainId: '1',
        floorNumber: 1,
        buildingId: '1',
      }
  }

  static getSecondFloorOutDTO(): IFloorOutDTO {
    return {
      domainId: '2',
      floorNumber: 2,
      building: BuildingDataSource.getBuildingBdto(),
    }
  }

  static getThirdFloorOutDTO(): IFloorOutDTO {
    return {
      domainId: '3',
      floorNumber: 3,
      building: BuildingDataSource.getBuildingCdto(),
    }
  }

  static getFourthFloorOutDTO(): IFloorOutDTO {
    return {
      domainId: '4',
      floorNumber: 4,
      building: BuildingDataSource.getBuildingBdto(),
    }
  }

  static getFifthFloorOutDTO(): IFloorOutDTO {
    return {
      domainId: '5',
      floorNumber: 5,
      building: BuildingDataSource.getBuildingAdto(),
    }
  }

  static getFloorBuildingTOutDTO(): IFloorOutDTO {
    return {
      domainId: 'floor-building-t',
      floorNumber: 1,
      building: BuildingDataSource.getBuildingTdto(),
    }
  }

  static getFirstFloor(): Floor {
    return Floor.create({
      building: BuildingDataSource.getBuildingA(),
      floorNumber: FloorNumber.create(1).getValue(),
    }, new UniqueEntityID('1')).getValue();
  }

  static getSecondFloor(): Floor {
    return Floor.create({
      building: BuildingDataSource.getBuildingB(),
      floorNumber: FloorNumber.create(2).getValue(),
    }, new UniqueEntityID('2')).getValue();
  }

  static getThirdFloor(): Floor {
    return Floor.create({
      building: BuildingDataSource.getBuildingC(),
      floorNumber: FloorNumber.create(1).getValue(),
    }, new UniqueEntityID('3')).getValue();
  }

  static getFourthFloor(): Floor {
    return Floor.create({
      building: BuildingDataSource.getBuildingB(),
      floorNumber: FloorNumber.create(2).getValue(),
    }, new UniqueEntityID('4')).getValue();
  }

  static getFifthFloor(): Floor {
    return Floor.create({
      building: BuildingDataSource.getBuildingA(),
      floorNumber: FloorNumber.create(2).getValue(),
    }, new UniqueEntityID('5')).getValue();
  }

  static getFloorBuildingT(): Floor {
    return Floor.create({
      building: BuildingDataSource.getBuildingT(),
      floorNumber: FloorNumber.create(1).getValue(),
    }, new UniqueEntityID('floor-building-t')).getValue();
  }

  static floorForProlog1(): Floor {
    return Floor.create({
      building: BuildingDataSource.buildingForProlog1(),
      floorNumber: FloorNumber.create(-1).getValue(),
    }, new UniqueEntityID('prolog-floor-1')).getValue();
  }

  static floorForProlog2(): Floor {
    return Floor.create({
      building: BuildingDataSource.buildingForProlog2(),
      floorNumber: FloorNumber.create(-2).getValue(),
    }, new UniqueEntityID('prolog-floor-2')).getValue();
  }

  static floorForProlog3(): Floor {
    return Floor.create({
      building: BuildingDataSource.buildingForProlog3(),
      floorNumber: FloorNumber.create(3).getValue(),
    }, new UniqueEntityID('prolog-floor-3')).getValue();
  }

  static floorForProlog4(): Floor {
    return Floor.create({
      building: BuildingDataSource.buildingForProlog4(),
      floorNumber: FloorNumber.create(4).getValue(),
    }, new UniqueEntityID('prolog-floor-4')).getValue();
  }

  static floorWithFloorPlan(): Floor {
    return Floor.create({
      building: BuildingDataSource.getBuildingA(),
      floorNumber: FloorNumber.create(1).getValue(),
      floorPlan: FloorPlan.create('floor-plan').getValue(),
    }, new UniqueEntityID('floor-with-floor-plan')).getValue();
  }
}


export default FloorDataSource;