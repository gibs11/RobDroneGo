import { Robisep } from '../../domain/robisep/Robisep';
import { Repo } from '../../core/infra/Repo';

export default interface IRobisepRepo extends Repo<Robisep> {
  save(robisep: Robisep): Promise<Robisep>;
  findByDomainId(robisepId: string): Promise<Robisep>;
  findByNickname(nickname: string): Promise<Robisep[]>;
  findByCode(code: string): Promise<Robisep>;
  findARobisepTypeWithSameSerialNumber(serialNumber: string, robisepTypeId: string): Promise<Robisep>;
  findByTaskType(taskType: string[]): Promise<Robisep[]>;
  findAll(): Promise<Robisep[]>;
}
