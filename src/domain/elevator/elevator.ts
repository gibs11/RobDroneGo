import { AggregateRoot } from '../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../core/domain/UniqueEntityID';

import { Guard } from '../../core/logic/Guard';
import { FailureType, Result } from '../../core/logic/Result';
import { Building } from '../building/building';
import { Floor } from '../floor/floor';
import { ElevatorPosition } from './elevatorPosition';
import { ElevatorBrand } from './elevatorBrand';
import { ElevatorSerialNumber } from './elevatorSerialNumber';
import { ElevatorDescription } from './elevatorDescription';
import { ElevatorModel } from './elevatorModel';
import { ElevatorOrientation } from './elevatorOrientation';

interface ElevatorProps {
  uniqueNumber: number;
  brand?: ElevatorBrand;
  model?: ElevatorModel;
  serialNumber?: ElevatorSerialNumber;
  description?: ElevatorDescription;
  elevatorPosition: ElevatorPosition;
  orientation: ElevatorOrientation;
  building: Building;
  floors: Floor[];
}

export class Elevator extends AggregateRoot<ElevatorProps> {
  /**
   *
   * Update the brand of the elevator.
   *
   * @param brand  The brand of the elevator.
   * @returns
   */
  updateBrand(brand: string): Result<void> {
    if (this.props.model == null || this.props.model == undefined) {
      throw new TypeError('Model is required when brand is provided.');
    }

    const brandOrError = ElevatorBrand.create(brand);
    if (brandOrError.isFailure) {
      throw new TypeError('Elevator brand is invalid.');
    }

    this.brand = brandOrError.getValue();
    return Result.ok<void>();
  }

  /**
   *
   * Update the model of the elevator.
   *
   * @param model  The model of the elevator.
   * @returns
   */
  updateModel(model: string): Result<void> {
    const modelOrError = ElevatorModel.create(model);
    if (modelOrError.isFailure) {
      throw new TypeError('Elevator model is invalid.');
    }

    this.model = modelOrError.getValue();
    return Result.ok<void>();
  }

  /**
   *
   * Update the serial number of the elevator.
   *
   * @param serialNumber  The serial number of the elevator.
   * @returns
   */
  updateSerialNumber(serialNumber: string): Result<void> {
    const serialNumberOrError = ElevatorSerialNumber.create(serialNumber);
    if (serialNumberOrError.isFailure) {
      throw new TypeError('Elevator serial number is invalid.');
    }

    this.serialNumber = serialNumberOrError.getValue();
    return Result.ok<void>();
  }

  /**
   *
   * Update the description of the elevator.
   *
   * @param description  The description of the elevator.
   * @returns
   */
  updateDescription(description: string): Result<void> {
    const descriptionOrError = ElevatorDescription.create(description);
    if (descriptionOrError.isFailure) {
      throw new TypeError('Elevator description is invalid.');
    }

    this.description = descriptionOrError.getValue();
    return Result.ok<void>();
  }

  /**
   *
   * Update the position of the elevator.
   *
   * @param xposition  The x position of the elevator.
   * @param yposition  The y position of the elevator.
   * @returns
   */
  updatePosition(xposition: number, yposition: number): Result<void> {
    const positionOrError = ElevatorPosition.create({ xposition, yposition });
    if (positionOrError.isFailure) {
      throw new TypeError('Elevator position is invalid.');
    }

    this.elevatorPosition = positionOrError.getValue();
    return Result.ok<void>();
  }

  /**
   *
   * Update the floors of the elevator.
   *
   * @param floors  The floors of the elevator.
   * @returns
   */
  updateFloors(floors: Floor[]): Result<void> {
    //Check if floors are from building
    for (const floor of floors) {
      if (floor.building.code.value != this.props.building.code.value) {
        throw new TypeError('Floor is not from the same building.');
      }
    }

    this.floors = floors;
    return Result.ok<void>();
  }

  /**
   *
   * Update the orientation of the elevator.
   *
   * @param orientation  The orientation of the elevator.
   * @returns
   */
  updateOrientation(orientation: ElevatorOrientation): Result<void> {
    // Check if orientation is valid
    if (!orientation) {
      throw new TypeError('Invalid Door Orientation.');
    }

    this.orientation = orientation;
    return Result.ok<void>();
  }

  get id(): UniqueEntityID {
    return this._id;
  }

  get uniqueNumber(): number {
    return this.props.uniqueNumber;
  }

  get brand(): ElevatorBrand {
    return this.props.brand;
  }

  get model(): ElevatorModel {
    return this.props.model;
  }

  get serialNumber(): ElevatorSerialNumber {
    return this.props.serialNumber;
  }

  get description(): ElevatorDescription {
    return this.props.description;
  }

  get position(): ElevatorPosition {
    return this.props.elevatorPosition;
  }

  get building(): Building {
    return this.props.building;
  }

  get floors(): Floor[] {
    return this.props.floors;
  }

  get orientation(): ElevatorOrientation {
    return this.props.orientation;
  }

  private set brand(brand: ElevatorBrand) {
    this.props.brand = brand;
  }

  private set model(model: ElevatorModel) {
    this.props.model = model;
  }

  private set serialNumber(serialNumber: ElevatorSerialNumber) {
    this.props.serialNumber = serialNumber;
  }

  private set description(description: ElevatorDescription) {
    this.props.description = description;
  }

  private set elevatorPosition(elevatorPosition: ElevatorPosition) {
    this.props.elevatorPosition = elevatorPosition;
  }

  private set floors(floors: Floor[]) {
    this.props.floors = floors;
  }

  private set orientation(orientation: ElevatorOrientation) {
    this.props.orientation = orientation;
  }

  private constructor(props: ElevatorProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: ElevatorProps, id?: UniqueEntityID): Result<Elevator> {
    const guardedProps = [];

    // Required props
    guardedProps.push({ argument: props.uniqueNumber, argumentName: 'uniqueNumber' });
    guardedProps.push({ argument: props.elevatorPosition, argumentName: 'elevatorPosition' });
    guardedProps.push({ argument: props.building, argumentName: 'building' });
    guardedProps.push({ argument: props.floors, argumentName: 'floors' });

    //Optional props
    if (props.brand) {
      guardedProps.push({ argument: props.brand, argumentName: 'brand' });
      if (props.model) {
        guardedProps.push({ argument: props.model, argumentName: 'model' });
      } else {
        return Result.fail<Elevator>('Model is required when brand is provided.', FailureType.InvalidInput);
      }
    }
    if (props.description) {
      guardedProps.push({ argument: props.description, argumentName: 'description' });
    }
    if (props.serialNumber) {
      guardedProps.push({ argument: props.serialNumber, argumentName: 'serialNumber' });
    }

    // Check if orientation is valid
    if (!props.orientation) {
      return Result.fail<Elevator>('Invalid Door Orientation.', FailureType.InvalidInput);
    } else {
      guardedProps.push({ argument: props.orientation, argumentName: 'orientation' });
    }

    // Assure that the props are not null or undefined.
    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
    if (!guardResult.succeeded) {
      return Result.fail<Elevator>(guardResult.message, FailureType.InvalidInput);
    }
    const elevator = new Elevator(
      {
        ...props,
      },
      id,
    );

    // If all the checks pass, return the elevator.
    return Result.ok<Elevator>(elevator);
  }
}
