import {UniqueEntityID} from "../../src/core/domain/UniqueEntityID";
import {Room} from "../../src/domain/room/Room";
import {Floor} from "../../src/domain/floor/floor";
import {RoomName} from "../../src/domain/room/RoomName";
import {RoomDescription} from "../../src/domain/room/RoomDescription";
import {RoomCategory} from "../../src/domain/room/RoomCategory";
import {RoomDimensions} from "../../src/domain/room/RoomDimensions";
import {Position} from "../../src/domain/room/Position";
import {FloorNumber} from "../../src/domain/floor/floorNumber";
import BuildingDataSource from "./buildingDataSource";
import FloorDataSource from "./floorDataSource";
import IRoomOutDTO from "../../src/dto/out/IRoomOutDTO";
import {DoorOrientation} from "../../src/domain/room/DoorOrientation";
import floorDataSource from "./floorDataSource";

class RoomDataSource {

    static getRoomAdto(): IRoomOutDTO {
        return {
            domainId: '1',
            name: 'Room A',
            description: 'Description A',
            category: RoomCategory.OTHER,
            dimensions: {
                initialPosition: { xPosition: 0, yPosition: 0 },
                finalPosition: { xPosition: 4, yPosition: 4 },
            },
            doorPosition: { xPosition: 5, yPosition: 2 },
            doorOrientation: 'EAST',
            floor: FloorDataSource.getFirstFloorOutDTO(),
        };
    }

    static getRoomBdto(): IRoomOutDTO {
        return {
            domainId: '2',
            name: 'Room B',
            description: 'Description B',
            category: RoomCategory.OTHER,
            dimensions: {
                initialPosition: { xPosition: 6, yPosition: 6 },
                finalPosition: { xPosition: 10, yPosition: 10 },
            },
            doorPosition: { xPosition: 8, yPosition: 10 },
            doorOrientation: 'SOUTH',
            floor: FloorDataSource.getSecondFloorOutDTO(),
        };
    }

    static getRoomCdto(): IRoomOutDTO {
        return {
            domainId: '3',
            name: 'Room C',
            description: 'Description C',
            category: RoomCategory.OTHER,
            dimensions: {
                initialPosition: { xPosition: 11, yPosition: 11 },
                finalPosition: { xPosition: 15, yPosition: 15 },
            },
            doorPosition: { xPosition: 15, yPosition: 13 },
            doorOrientation: 'WEST',
            floor: FloorDataSource.getThirdFloorOutDTO(),
        };
    }

    static getRoomProlog1dto(): IRoomOutDTO {
        return {
            domainId: '10',
            name: 'Room Prolog 1',
            description: 'Description Prolog 1',
            category: RoomCategory.OTHER,
            dimensions: {
                initialPosition: { xPosition: 1, yPosition: 0 },
                finalPosition: { xPosition: 1, yPosition: 2 },
            },
            doorPosition: { xPosition: 1, yPosition: 1 },
            doorOrientation: 'EAST',
            floor: FloorDataSource.getFourthFloorOutDTO(),
        };
    }

    static getFirstRoomTdto(): IRoomOutDTO {
        return {
            domainId: '16',
            name: 'Room T1',
            description: 'Description T1',
            category: RoomCategory.AUDITORIUM,
            dimensions: {
                initialPosition: { xPosition: 0, yPosition: 0 },
                finalPosition: { xPosition: 1, yPosition: 1 },
            },
            doorPosition: { xPosition: 1, yPosition: 1 },
            doorOrientation: 'SOUTH',
            floor: FloorDataSource.getFloorBuildingTOutDTO(),
        };
    }

    static getSecondRoomTdto(): IRoomOutDTO {
        return {
            domainId: '17',
            name: 'Room T2',
            description: 'Description T2',
            category: RoomCategory.AUDITORIUM,
            dimensions: {
                initialPosition: { xPosition: 3, yPosition: 3 },
                finalPosition: { xPosition: 4, yPosition: 4 },
            },
            doorPosition: { xPosition: 4, yPosition: 4 },
            doorOrientation: 'SOUTH',
            floor: FloorDataSource.getFloorBuildingTOutDTO(),
        };
    }

    static getRoomA(): Room {
        return Room.create({
            name: RoomName.create('Room A').getValue(),
            description: RoomDescription.create('Description A').getValue(),
            category: RoomCategory.OTHER,
            dimensions: RoomDimensions.create(
                Position.create(0, 0).getValue(),
                Position.create(4, 4).getValue()
            ).getValue(),
            doorPosition: Position.create(5, 2).getValue(),
            doorOrientation: DoorOrientation.EAST,
            floor: Floor.create({
                building: BuildingDataSource.getBuildingA(),
                floorNumber: FloorNumber.create(1).getValue()
        }, new UniqueEntityID('1')).getValue()
        }, new UniqueEntityID('1')).getValue();
    }

    static getRoomB(): Room {
        return Room.create({
            name: RoomName.create('Room B').getValue(),
            description: RoomDescription.create('Description B').getValue(),
            category: RoomCategory.OTHER,
            dimensions: RoomDimensions.create(
                Position.create(4, 4).getValue(),
                Position.create(6, 6).getValue()
            ).getValue(),
            doorPosition: Position.create(6, 6).getValue(),
            doorOrientation: DoorOrientation.SOUTH,
            floor: Floor.create({
                building: BuildingDataSource.getBuildingB(),
                floorNumber: FloorNumber.create(2).getValue()
            }, new UniqueEntityID('2')).getValue()
        }, new UniqueEntityID('2')).getValue();
    }

    static getRoomC(): Room {
        return Room.create({
            name: RoomName.create('Room C').getValue(),
            description: RoomDescription.create('Description C').getValue(),
            category: RoomCategory.OTHER,
            dimensions: RoomDimensions.create(
                Position.create(11, 11).getValue(),
                Position.create(15, 15).getValue()
            ).getValue(),
            doorPosition: Position.create(15, 13).getValue(),
            doorOrientation: DoorOrientation.WEST,
            floor: Floor.create({
                building: BuildingDataSource.getBuildingC(),
                floorNumber: FloorNumber.create(3).getValue()
            }, new UniqueEntityID('3')).getValue()
        }, new UniqueEntityID('3')).getValue();
    }

    static getFirstRoomT(): Room {
        return Room.create({
            name: RoomName.create('Room T1').getValue(),
            description: RoomDescription.create('Description T1').getValue(),
            category: RoomCategory.AUDITORIUM,
            dimensions: RoomDimensions.create(
                Position.create(0, 0).getValue(),
                Position.create(1, 1).getValue()
            ).getValue(),
            doorPosition: Position.create(1, 1).getValue(),
            doorOrientation: DoorOrientation.SOUTH,
            floor: FloorDataSource.getFloorBuildingT()
        }, new UniqueEntityID('16')).getValue();
    }

    static getSecondRoomT(): Room {
        return Room.create({
            name: RoomName.create('Room T2').getValue(),
            description: RoomDescription.create('Description T2').getValue(),
            category: RoomCategory.AUDITORIUM,
            dimensions: RoomDimensions.create(
              Position.create(3, 3).getValue(),
              Position.create(4, 4).getValue()
            ).getValue(),
            doorPosition: Position.create(4, 4).getValue(),
            doorOrientation: DoorOrientation.SOUTH,
            floor: FloorDataSource.getFloorBuildingT()
        }, new UniqueEntityID('17')).getValue();
    }

    static getRoomProlog1(): Room {
        return Room.create({
                name: RoomName.create('Room Prolog 1').getValue(),
                description: RoomDescription.create('Description Prolog 1').getValue(),
                category: RoomCategory.OTHER,
                dimensions: RoomDimensions.create(
                    Position.create(1, 0).getValue(),
                    Position.create(1, 2).getValue()
                ).getValue(),
                doorPosition: Position.create(1, 1).getValue(),
                doorOrientation: DoorOrientation.EAST,
                floor: floorDataSource.floorForProlog4()
            },
            new UniqueEntityID('10')
        ).getValue();
    }
}

export default RoomDataSource;
