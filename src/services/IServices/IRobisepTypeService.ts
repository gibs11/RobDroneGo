import { Result } from '../../core/logic/Result';
import IRobisepTypeDTO from '../../dto/IRobisepTypeDTO';
import IRobisepTypeOutDTO from '../../dto/out/IRobisepTypeOutDTO';

export default interface IRobisepTypeService {
  createRobisepType(robisepTypeDTO: IRobisepTypeDTO): Promise<Result<IRobisepTypeOutDTO>>;
  listRobisepTypes(): Promise<IRobisepTypeOutDTO[]>;
}
