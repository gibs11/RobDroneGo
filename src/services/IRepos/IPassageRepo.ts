import { Repo } from '../../core/infra/Repo';
import { Passage } from '../../domain/passage/passage';
import { Floor } from '../../domain/floor/floor';
import { Coordinates } from '../../domain/common/coordinates';

export default interface IPassageRepo extends Repo<Passage> {
  save(passage: Passage): Promise<Passage>;

  /**
   * Finds a passage by its id.
   *
   * @param passageId
   * @returns The passage found, or null if it does not exist.
   */
  findByDomainId(passageId: string): Promise<Passage>;
  /**
   * Finds a passage by its floors.
   *
   * @returns The passage found, or null if it does not exist.
   * @param startPointFloor
   * @param endPointFloor
   */
  findByFloors(startPointFloor: Floor, endPointFloor: Floor): Promise<Passage>;

  /**
   * Finds a passage by its positions.
   *
   * @returns The passage found, or null if it does not exist.
   * @param firstCoordinates
   * @param lastCoordinates
   */
  findByCoordinates(firstCoordinates: Coordinates, lastCoordinates: Coordinates): Promise<Passage>;

  /**
   * Finds a passage by its position coordinates.
   *
   * @param coordinateX - The x coordinate of the position.
   * @param coordinateY - The y coordinate of the position.
   * @returns The passage found, or null if it does not exist.
   */
  findByPassagePositionCoordinates(coordinateX: number, coordinateY: number): Promise<Passage>;

  /**
   * Finds all passages by a floor id.
   *
   * @param floorId - The id of the floor.
   * @returns A list of passages found.
   */
  findPassagesByFloorId(floorId: string): Promise<Passage[]>;

  /**
   * Checks if there are any passages between a floor and a building.
   * @param floorId
   * @param buildingId
   * @returns True if there are any passages between the floor and the building, false otherwise.
   */
  isTherePassageBetweenFloorAndBuilding(floorId: string, buildingId: string): Promise<boolean>;

  /**
   * Checks if there is any passage in a floor in the given coordinates.
   * @param coordinateX
   * @param coordinateY
   * @param floorId
   * @param passageId
   * @returns True if there is any passage in the given coordinates, false otherwise.
   */
  isThereAPassageInFloorCoordinates(
    coordinateX: number,
    coordinateY: number,
    floorId: string,
    passageId: string,
  ): Promise<boolean>;
  /**
   * Lists all passages between two buildings.
   * @param firstBuildingId
   * @param lastBuildingId
   * @returns A promise that resolves to an array of passages.
   */
  findPassagesBetweenBuildings(firstBuildingId: string, lastBuildingId: string): Promise<Passage[]>;

  /**
   * Lists all passages.
   * @returns A promise that resolves to an array of passages.
   */
  findAll(): Promise<Passage[]>;

  /**
   * Finds rooms by area
   *
   * @param initialX - Initial X position of the area
   * @param initialY - Initial Y position of the area
   * @param finalX - Final X position of the area
   * @param finalY - Final Y position of the area
   * @param floor - Floor where the area is located
   * @returns boolean - True if the area is available, false otherwise
   */
  checkIfPassageExistInArea(
    initialX: number,
    initialY: number,
    finalX: number,
    finalY: number,
    floor: Floor,
  ): Promise<boolean>;
}
