import IFloorOutDTO from './IFloorOutDTO';

interface CoordinatesDTO {
  x: number;
  y: number;
}
interface PassagePointDTO {
  floor: IFloorOutDTO;
  firstCoordinates: CoordinatesDTO;
  lastCoordinates: CoordinatesDTO;
}
export default interface IPassageOutDTO {
  domainId: string;
  passageStartPoint: PassagePointDTO;
  passageEndPoint: PassagePointDTO;
}
