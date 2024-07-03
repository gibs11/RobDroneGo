import { Request, Response } from 'express';

export default interface IPrologCampusController {
  /**
   * This method returns the facts of the campus to be used in prolog
   *
   * @returns the facts of the campus
   */
  prologCampusFacts(req: Request, res: Response);
}
