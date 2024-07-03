import { Robisep } from '../../domain/robisep/Robisep';

export default interface IRobisepTypeFactory {
  /**
   * Creates a new floor.
   * @param raw
   */
  createRobisep(raw: any): Promise<Robisep>;
}
