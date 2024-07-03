interface CoordinatesDTO {
  x: number;
  y: number;
}
interface PassagePointDTO {
  floorId: string;
  firstCoordinates: CoordinatesDTO;
  lastCoordinates: CoordinatesDTO;
}
export default interface IPassageDTO {
  domainId: string;
  passageStartPoint: PassagePointDTO;
  passageEndPoint: PassagePointDTO;
}
