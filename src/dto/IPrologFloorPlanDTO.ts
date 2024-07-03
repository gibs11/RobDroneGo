/**
 * Interface for the Floor DTO
 * floorPlanCells will receive an array of strings, each string representing a fact of type: m(col, row, value).
 * Value - Will take the following values:
 * 0 - Empty cell
 * 1 - Full cell
 */
export default interface IPrologFloorPlanDTO {
  floorPlanHeight: number;
  floorPlanWidth: number;
  floorPlanCells: string[];
}
