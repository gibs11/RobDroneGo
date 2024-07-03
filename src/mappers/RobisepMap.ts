import { Mapper } from '../core/infra/Mapper';
import IRobisepOutDto from '../dto/out/IRobisepOutDTO';
import { Robisep } from '../domain/robisep/Robisep';
import { RobisepState } from '../domain/robisep/RobisepState';
import { RobisepNickname } from '../domain/robisep/RobisepNickname';
import { RobisepSerialNumber } from '../domain/robisep/RobisepSerialNumber';
import { RobisepCode } from '../domain/robisep/RobisepCode';
import { UniqueEntityID } from '../core/domain/UniqueEntityID';
import { Container } from 'typedi';
import RobisepTypeRepo from '../repos/robisepTypeRepo';
import { RobisepDescription } from '../domain/robisep/RobisepDescription';
import { RobisepTypeMap } from './RobisepTypeMap';
import RoomRepo from '../repos/roomRepo';
import { RoomMap } from './RoomMap';

export class RobisepMap extends Mapper<Robisep> {
  public static toDTO(robisep: Robisep): IRobisepOutDto {
    const robisepDTO: IRobisepOutDto = {
      domainId: robisep.id.toString(),
      nickname: robisep.nickname.value,
      serialNumber: robisep.serialNumber.value,
      code: robisep.code.value,
      robisepType: RobisepTypeMap.toDTO(robisep.robisepType),
      room: RoomMap.toDTO(robisep.roomId),
    };
    // Optional fields
    if (robisep.description) {
      robisepDTO.description = robisep.description.value;
    }

    if (robisep.state) {
      robisepDTO.state = RobisepState[robisep.state];
    }

    return robisepDTO;
  }

  public static async toDomain(robisep: any): Promise<Robisep> {
    // Robisep Nickname
    const robisepNicknameOrError = RobisepNickname.create(robisep.nickname);
    if (robisepNicknameOrError.isFailure) {
      throw new TypeError(robisepNicknameOrError.errorMessage());
    }

    // Robisep Serial Number
    const robisepSerialNumberOrError = RobisepSerialNumber.create(robisep.serialNumber);
    if (robisepSerialNumberOrError.isFailure) {
      throw new TypeError(robisepSerialNumberOrError.errorMessage());
    }

    // Robisep Code
    const robisepCodeOrError = RobisepCode.create(robisep.code);
    if (robisepCodeOrError.isFailure) {
      throw new TypeError(robisepCodeOrError.errorMessage());
    }

    // Robisep Description
    let robisepDescription = null;
    if (robisep.description) {
      robisepDescription = RobisepDescription.create(robisep.description);
      if (robisepDescription.isFailure) {
        throw new TypeError(robisepDescription.errorMessage());
      }
    }

    // Robisep State
    let robisepState: RobisepState = null;
    for (const state in RobisepState) {
      if (RobisepState[state] === robisep.state) {
        robisepState = RobisepState[state];
      }
    }

    if (!robisepState) {
      throw new TypeError('Invalid state.');
    }

    // Robisep Repo
    const robisepTypeRepo = Container.get(RobisepTypeRepo);
    const robisepType = await robisepTypeRepo.findByDomainId(robisep.robisepTypeId);

    if (!robisepType) {
      throw new TypeError('Robisep not found.');
    }

    // Room Repo
    const roomRepo = Container.get(RoomRepo);
    const room = await roomRepo.findByDomainId(robisep.roomId);

    if (!room) {
      throw new TypeError('Room not found.');
    }

    // Robisep
    const robisepOrError = Robisep.create(
      {
        nickname: robisepNicknameOrError.getValue(),
        serialNumber: robisepSerialNumberOrError.getValue(),
        code: robisepCodeOrError.getValue(),
        description: robisepDescription ? robisepDescription.getValue() : null,
        robisepType: robisepType,
        state: robisepState,
        roomId: room,
      },
      new UniqueEntityID(robisep.domainId),
    );

    return robisepOrError.isSuccess ? robisepOrError.getValue() : null;
  }

  public static toPersistence(robisep: Robisep): any {
    const persistenceRobisep: any = {
      domainId: robisep.id.toString(),
      nickname: robisep.nickname.value,
      serialNumber: robisep.serialNumber.value,
      code: robisep.code.value,
      state: RobisepState[robisep.state],
      robisepTypeId: robisep.robisepType.id.toString(),
      roomId: robisep.roomId.id.toString(),
    };

    // Optional fields
    if (robisep.description) {
      persistenceRobisep.description = robisep.description.value;
    }

    return persistenceRobisep;
  }
}
