import { Service, Inject } from 'typedi';
import IPositionChecker from '../IServices/IPositionChecker';
import config from '../../../config';
import { Floor } from '../floor/floor';

@Service()
export default class PositionChecker implements IPositionChecker {
  constructor(
    @Inject(config.services.roomPositionChecker.name) private roomPositionChecker: IPositionChecker,
    @Inject(config.services.elevatorPositionChecker.name) private elevatorPositionChecker: IPositionChecker,
    @Inject(config.services.passagePositionChecker.name) private passagePositionChecker: IPositionChecker,
    @Inject('logger') private logger,
  ) {}
  public async isPositionAvailable(
    coordinateX: number,
    coordinateY: number,
    floor: Floor,
    id: string,
  ): Promise<boolean> {
    return (
      (await this.roomPositionChecker.isPositionAvailable(coordinateX, coordinateY, floor, id)) &&
      (await this.elevatorPositionChecker.isPositionAvailable(coordinateX, coordinateY, floor, id)) &&
      (await this.passagePositionChecker.isPositionAvailable(coordinateX, coordinateY, floor, id))
    );
  }
}
