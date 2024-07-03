import { Inject, Service } from 'typedi';
import config from '../../config';
import IRobisepFactory from '../services/IFactories/IRobisepTypeFactory';
import { Robisep } from '../domain/robisep/Robisep';
import { RobisepNickname } from '../domain/robisep/RobisepNickname';
import { RobisepSerialNumber } from '../domain/robisep/RobisepSerialNumber';
import { RobisepCode } from '../domain/robisep/RobisepCode';
import { RobisepDescription } from '../domain/robisep/RobisepDescription';
import { UniqueEntityID } from '../core/domain/UniqueEntityID';
import IRobisepTypeRepo from '../services/IRepos/IRobisepTypeRepo';
import { RobisepState } from '../domain/robisep/RobisepState';
import IRoomRepo from '../services/IRepos/IRoomRepo';

@Service()
export default class RobisepFactory implements IRobisepFactory {
  constructor(
    @Inject(config.repos.robisepType.name) private robisepTypeRepo: IRobisepTypeRepo,
    @Inject(config.repos.room.name) private roomRepo: IRoomRepo,
  ) {}

  public async createRobisep(raw: any): Promise<Robisep> {
    // Robisep Nickname
    const robisepNicknameOrError = RobisepNickname.create(raw.nickname);
    if (robisepNicknameOrError.isFailure) {
      throw new TypeError(robisepNicknameOrError.errorMessage());
    }

    // Robisep Serial Number
    const robisepSerialNumberOrError = RobisepSerialNumber.create(raw.serialNumber);
    if (robisepSerialNumberOrError.isFailure) {
      throw new TypeError(robisepSerialNumberOrError.errorMessage());
    }

    // Robisep Code
    const robisepCodeOrError = RobisepCode.create(raw.code);
    if (robisepCodeOrError.isFailure) {
      throw new TypeError(robisepCodeOrError.errorMessage());
    }

    // Robisep Description
    let robisepDescription = null;
    if (raw.description) {
      robisepDescription = RobisepDescription.create(raw.description);
      if (robisepDescription.isFailure) {
        throw new TypeError(robisepDescription.errorMessage());
      }
    }

    // Robisep Repo
    const robisepType = await this.robisepTypeRepo.findByDomainId(raw.robisepTypeId);

    if (!robisepType) {
      throw new ReferenceError('RobisepType not found.');
    }

    // Room Repo
    const room = await this.roomRepo.findByDomainId(raw.roomId);

    if (!room) {
      throw new ReferenceError('Room not found.');
    }

    // Robisep
    const robisepOrError = Robisep.create(
      {
        nickname: robisepNicknameOrError.getValue(),
        serialNumber: robisepSerialNumberOrError.getValue(),
        code: robisepCodeOrError.getValue(),
        description: robisepDescription ? robisepDescription.getValue() : null,
        robisepType: robisepType,
        state: RobisepState.ACTIVE,
        roomId: room,
      },
      new UniqueEntityID(raw.domainId),
    );

    return robisepOrError.isSuccess ? robisepOrError.getValue() : null;
  }
}
