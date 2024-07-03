import { Inject, Service } from 'typedi';
import IPositionChecker from '../IServices/IPositionChecker';
import IPassageRepo from '../../services/IRepos/IPassageRepo';
import { Floor } from '../floor/floor';
import config from '../../../config';

@Service()
export default class PassagePositionChecker implements IPositionChecker {
  constructor(@Inject(config.repos.passage.name) private passageRepo: IPassageRepo) {}
  public async isPositionAvailable(
    coordinateX: number,
    coordinateY: number,
    floor: Floor,
    id: string,
  ): Promise<boolean> {
    const isPositionAvailable = !(await this.passageRepo.isThereAPassageInFloorCoordinates(
      coordinateX,
      coordinateY,
      floor.id.toString(),
      id,
    ));

    if (isPositionAvailable) {
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }
}
