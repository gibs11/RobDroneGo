import { Result } from '../../core/logic/Result';

import IPrologCampusDTO from '../../dto/IPrologCampusDTO';

export default interface IPrologCampusService {
  /**
   * This method returns the facts of the campus to be used in prolog
   *
   * @returns the facts of the campus
   */
  prologCampusFacts(): Promise<Result<IPrologCampusDTO>>;
}
