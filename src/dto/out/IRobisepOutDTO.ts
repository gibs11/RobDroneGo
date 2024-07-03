import IRobisepTypeOutDTO from './IRobisepTypeOutDTO';
import IRoomOutDTO from './IRoomOutDTO';

export default interface IRobisepOutDTO {
  domainId: string;
  nickname: string;
  serialNumber: string;
  code: string;
  description?: string;
  robisepType: IRobisepTypeOutDTO;
  room: IRoomOutDTO;
  state?: string;
}
