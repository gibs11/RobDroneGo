import { Inject, Service } from 'typedi';
import IPositionChecker from '../IServices/IPositionChecker';
import config from '../../../config';
import IRoomRepo from '../../services/IRepos/IRoomRepo';
import { Floor } from '../floor/floor';

@Service()
export default class RoomPositionChecker implements IPositionChecker {
  constructor(@Inject(config.repos.room.name) private roomRepo: IRoomRepo) {}
  public async isPositionAvailable(
    coordinateX: number,
    coordinateY: number,
    floor: Floor,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    id: string,
  ): Promise<boolean> {
    return await this.roomRepo.checkCellAvailability(coordinateX, coordinateY, floor);
  }
}
