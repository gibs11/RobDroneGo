import { UniqueEntityID } from "../../src/core/domain/UniqueEntityID";
import { Elevator } from "../../src/domain/elevator/elevator";
import { ElevatorDescription } from "../../src/domain/elevator/elevatorDescription";
import { ElevatorBrand } from "../../src/domain/elevator/elevatorBrand";
import { ElevatorModel } from "../../src/domain/elevator/elevatorModel";
import { ElevatorSerialNumber } from "../../src/domain/elevator/elevatorSerialNumber";
import { ElevatorPosition } from "../../src/domain/elevator/elevatorPosition";
import { Floor } from "../../src/domain/floor/floor";
import { FloorNumber } from "../../src/domain/floor/floorNumber";
import IElevatorDTO from "../../src/dto/IElevatorDTO";
import IElevatorOutDTO from "../../src/dto/out/IElevatorOutDTO";
import BuildingDataSource from "./buildingDataSource";
import FloorDataSource from "./floorDataSource";
import { ElevatorOrientation } from "../../src/domain/elevator/elevatorOrientation";

class ElevatorDataSource {


    static getElevatorAdto(): IElevatorOutDTO {
        return {
            domainId: '1',
            uniqueNumber: 1,
            description: 'Elevator 1',
            brand: 'Brand 1',
            model: 'Model 1',
            serialNumber: 'Serial 1',
            elevatorPosition: { xposition: 5, yposition: 8 },
            orientation: 'NORTH',
            building: BuildingDataSource.getBuildingAdto(),
            floors: [FloorDataSource.getFirstFloorOutDTO()]
        };
    }

    static getElevatorBdto(): IElevatorDTO {
        return {
            domainId: '2',
            uniqueNumber: 2,
            description: 'Elevator 2',
            elevatorPosition: { xposition: 5, yposition: 8 },
            orientation: 'NORTH',
            building: BuildingDataSource.getBuildingB().id.toString(),
            floors: [FloorDataSource.getSecondFloor().id.toString()]
        };
    }

    static getElevatorA(): Elevator {
        return Elevator.create({
            uniqueNumber: 1,
            description: ElevatorDescription.create('Elevator 1').getValue(),
            brand: ElevatorBrand.create('Brand 1').getValue(),
            model: ElevatorModel.create('Model 1').getValue(),
            serialNumber: ElevatorSerialNumber.create('Serial 1').getValue(),
            elevatorPosition: ElevatorPosition.create({ xposition: 5, yposition: 8 }).getValue(),
            orientation: ElevatorOrientation.NORTH,
            building: BuildingDataSource.getBuildingA(),
            floors: [FloorDataSource.getFirstFloor()]
        }, new UniqueEntityID('1')).getValue();
    }

    static getElevatorB(): Elevator {
        return Elevator.create({
            uniqueNumber: 1,
            description: ElevatorDescription.create('Elevator 2').getValue(),
            elevatorPosition: ElevatorPosition.create({ xposition: 5, yposition: 8 }).getValue(),
            orientation: ElevatorOrientation.NORTH,
            building: BuildingDataSource.getBuildingB(),
            floors: [FloorDataSource.getSecondFloor()]
        }, new UniqueEntityID('2')).getValue();
    }

    static getElevatorForProlog1() {
        return Elevator.create({
            uniqueNumber: 1,
            description: ElevatorDescription.create('Elevator 1 Prolog').getValue(),
            elevatorPosition: ElevatorPosition.create({ xposition: 3, yposition: 3 }).getValue(),
            orientation: ElevatorOrientation.NORTH,
            building: BuildingDataSource.buildingForProlog3(),
            floors: [FloorDataSource.floorForProlog3()]
        }, new UniqueEntityID('10')).getValue();
    }

}

export default ElevatorDataSource;