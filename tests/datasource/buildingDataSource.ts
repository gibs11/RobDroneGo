import {Building} from "../../src/domain/building/building";
import {BuildingName} from "../../src/domain/building/buildingName";
import {BuildingDescription} from "../../src/domain/building/buildingDescription";
import {BuildingDimensions} from "../../src/domain/building/buildingDimensions";
import {BuildingCode} from "../../src/domain/building/buildingCode";
import IBuildingDTO from "../../src/dto/IBuildingDTO";
import {UniqueEntityID} from "../../src/core/domain/UniqueEntityID";

class BuildingDataSource {

  static getBuildingAdto(): IBuildingDTO {
    return {
      domainId: '1',
      buildingName: 'Building A',
      buildingDimensions: {width: 5, length: 10},
      buildingDescription: 'Description A',
      buildingCode: 'A',
    };
  }

  static getBuildingBdto(): IBuildingDTO {
    return {
      domainId: '2',
      buildingName: 'Building B',
      buildingDimensions: {width: 8, length: 12},
      buildingDescription: 'Description B',
      buildingCode: 'B',
    };
  }

  static getBuildingCdto(): IBuildingDTO {
    return {
      domainId: '3',
      buildingName: 'Building C',
      buildingDimensions: {width: 10, length: 15},
      buildingDescription: 'Description C',
      buildingCode: 'C',
    };
  }

  static getBuildingTdto(): IBuildingDTO {
    return {
      domainId: '16',
      buildingName: 'Building T',
      buildingDimensions: {width: 10, length: 10},
      buildingDescription: 'Isle of man TT',
      buildingCode: 'T',
    };
  }

  static getBuildingA(): Building {
    return Building.create({
      buildingName: BuildingName.create('Building A').getValue(),
      buildingDimensions: BuildingDimensions.create({width: 5, length: 10}).getValue(),
      buildingDescription: BuildingDescription.create('Description A').getValue(),
      buildingCode: BuildingCode.create('A').getValue(),
    }, new UniqueEntityID('1'))
      .getValue();
  }

  static getBuildingB(): Building {
    return Building.create({
      buildingName: BuildingName.create('Building B').getValue(),
      buildingDimensions: BuildingDimensions.create({width: 8, length: 12}).getValue(),
      buildingDescription: BuildingDescription.create('Description B').getValue(),
      buildingCode: BuildingCode.create('B').getValue(),
    }, new UniqueEntityID('2'))
      .getValue();
  }

  static getBuildingC(): Building {
    return Building.create({
      buildingName: BuildingName.create('Building C').getValue(),
      buildingDimensions: BuildingDimensions.create({width: 10, length: 15}).getValue(),
      buildingDescription: BuildingDescription.create('Description C').getValue(),
      buildingCode: BuildingCode.create('C').getValue(),
    }, new UniqueEntityID('3'))
      .getValue();
  }

  static getBuildingT(): Building {
    return Building.create({
      buildingName: BuildingName.create('Building T').getValue(),
      buildingDimensions: BuildingDimensions.create({width: 10, length: 10}).getValue(),
      buildingDescription: BuildingDescription.create('Isle of man TT').getValue(),
      buildingCode: BuildingCode.create('T').getValue(),
    }, new UniqueEntityID('16'))
      .getValue();
  }

  static buildingForProlog1(): Building {
    return Building.create({
      buildingName: BuildingName.create('B Prolog').getValue(),
      buildingDimensions: BuildingDimensions.create({width: 3, length: 3}).getValue(),
      buildingDescription: BuildingDescription.create('Description Prolog').getValue(),
      buildingCode: BuildingCode.create('PRL').getValue(),
    }, new UniqueEntityID('prolog1'))
      .getValue();
  }

  static buildingForProlog2(): Building {
    return Building.create({
      buildingName: BuildingName.create('C Prolog').getValue(),
      buildingDimensions: BuildingDimensions.create({width: 4, length: 4}).getValue(),
      buildingDescription: BuildingDescription.create('Description Prolog 2').getValue(),
      buildingCode: BuildingCode.create('PRO').getValue(),
    }, new UniqueEntityID('prolog2'))
      .getValue();
  }

  static buildingForProlog3(): Building {
    return Building.create({
      buildingName: BuildingName.create('D Prolog').getValue(),
      buildingDimensions: BuildingDimensions.create({width: 4, length: 4}).getValue(),
      buildingDescription: BuildingDescription.create('Description Prolog 3').getValue(),
      buildingCode: BuildingCode.create('PR3').getValue(),
    }, new UniqueEntityID('prolog3'))
      .getValue();
  }

  static buildingForProlog4(): Building {
    return Building.create({
      buildingName: BuildingName.create('E Prolog').getValue(),
      buildingDimensions: BuildingDimensions.create({width: 3, length: 3}).getValue(),
      buildingDescription: BuildingDescription.create('Description Prolog 4').getValue(),
      buildingCode: BuildingCode.create('PR4').getValue(),
    }, new UniqueEntityID('prolog4'))
      .getValue();
  }

}

export default BuildingDataSource;
