import { UniqueEntityID } from '../../src/core/domain/UniqueEntityID';
import { Robisep } from '../../src/domain/robisep/Robisep';
import RobisepTypeDataSource from './robisepTypeDataSource';
import { RobisepNickname } from '../../src/domain/robisep/RobisepNickname';
import { RobisepSerialNumber } from '../../src/domain/robisep/RobisepSerialNumber';
import { RobisepCode } from '../../src/domain/robisep/RobisepCode';
import { RobisepDescription } from '../../src/domain/robisep/RobisepDescription';
import IRobisepOutDTO from '../../src/dto/out/IRobisepOutDTO';
import { RobisepState } from '../../src/domain/robisep/RobisepState';
import { RobisepTypeMap } from '../../src/mappers/RobisepTypeMap';
import RoomDataSource from './RoomDataSource';
import { RoomMap } from '../../src/mappers/RoomMap';

class RobisepDataSource {
  static getRobisepADTO(): IRobisepOutDTO {
    return {
      domainId: '1',
      nickname: 'Robisep A',
      serialNumber: '123456789',
      code: 'A',
      description: 'Description A',
      robisepType: RobisepTypeMap.toDTO(RobisepTypeDataSource.getRobisepTypeA()),
      state: 'ACTIVE',
      room: RoomMap.toDTO(RoomDataSource.getFirstRoomT()),
    };
  }

  static getRobisepBDTO(): IRobisepOutDTO {
    return {
      domainId: '2',
      nickname: 'Robisep B',
      serialNumber: '987654321',
      code: 'B',
      description: 'Description B',
      robisepType: RobisepTypeMap.toDTO(RobisepTypeDataSource.getRobisepTypeB()),
      state: 'ACTIVE',
      room: RoomMap.toDTO(RoomDataSource.getFirstRoomT()),
    };
  }

  static getRobisepCDTO(): IRobisepOutDTO {
    return {
      domainId: '3',
      nickname: 'Robisep C',
      serialNumber: '123456789',
      code: 'C',
      description: 'Description C',
      robisepType: RobisepTypeMap.toDTO(RobisepTypeDataSource.getRobisepTypeC()),
      state: 'ACTIVE',
      room: RoomMap.toDTO(RoomDataSource.getFirstRoomT()),
    };
  }

  static getRobisepA(): Robisep {
    return Robisep.create(
      {
        nickname: RobisepNickname.create('Robisep A').getValue(),
        serialNumber: RobisepSerialNumber.create('123456789').getValue(),
        code: RobisepCode.create('A').getValue(),
        description: RobisepDescription.create('Description A').getValue(),
        robisepType: RobisepTypeDataSource.getRobisepTypeA(),
        state: RobisepState.ACTIVE,
        roomId: RoomDataSource.getFirstRoomT(),
      },
      new UniqueEntityID('1'),
    ).getValue();
  }

  static getRobisepB(): Robisep {
    return Robisep.create(
      {
        nickname: RobisepNickname.create('Robisep B').getValue(),
        serialNumber: RobisepSerialNumber.create('987654321').getValue(),
        code: RobisepCode.create('B').getValue(),
        description: RobisepDescription.create('Description B').getValue(),
        robisepType: RobisepTypeDataSource.getRobisepTypeB(),
        state: RobisepState.ACTIVE,
        roomId: RoomDataSource.getFirstRoomT(),
      },
      new UniqueEntityID('2'),
    ).getValue();
  }

  static getRobisepC(): Robisep {
    return Robisep.create(
      {
        nickname: RobisepNickname.create('Robisep C').getValue(),
        serialNumber: RobisepSerialNumber.create('123456789').getValue(),
        code: RobisepCode.create('C').getValue(),
        description: RobisepDescription.create('Description C').getValue(),
        robisepType: RobisepTypeDataSource.getRobisepTypeC(),
        state: RobisepState.ACTIVE,
        roomId: RoomDataSource.getFirstRoomT(),
      },
      new UniqueEntityID('3'),
    ).getValue();
  }
}

export default RobisepDataSource;
