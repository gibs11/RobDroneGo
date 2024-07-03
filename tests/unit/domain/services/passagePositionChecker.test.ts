// import * as sinon from 'sinon';
// import { expect } from 'chai';
// import { Container } from 'typedi';
// import config from '../../../../config';
//
// import {Floor} from '../../../../src/domain/floor/floor';
//
//
// import PassagePositionChecker from '../../../../src/domain/ServicesImpl/passagePositionChecker';
// import PassageDataSource from '../../../datasource/passageDataSource';
// import { UniqueEntityID } from '../../../../src/core/domain/UniqueEntityID';
// import FloorDataSource from '../../../datasource/floorDataSource';
//
// describe('PassagePositionChecker', () =>{
//   const sandbox = sinon.createSandbox();
//
//   let loggerMock;
//   let passageRepoMock;
//
//   let positionCheckerService;
//
//   beforeEach(function () {
//     Container.reset();
//
//     loggerMock = {
//       error: sinon.stub(),
//     };
//     Container.set('logger', loggerMock);
//
//     passageRepoMock = {
//       findPassagesByFloorId: sinon.stub()
//     };
//     Container.set(config.repos.passage.name, passageRepoMock);
//
//     positionCheckerService = new PassagePositionChecker(passageRepoMock);
// });
//
// afterEach(function () {
//     sandbox.restore();
// });
//
// it('should return false if the position is not available (endpoint)', async () => {
//
//   // Arrange
//   passageRepoMock.findPassagesByFloorId.resolves([PassageDataSource.getFirstPassage()]);
//
//   // Act
//   const result = await positionCheckerService.isPositionAvailable(0, 4, FloorDataSource.getFirstFloor());
//
//   // Assert
//   expect(result).to.be.false;
// });
//
// it('should return true if the position is available', async () => {
//
//   // Arrange
//   passageRepoMock.findPassagesByFloorId.resolves([PassageDataSource.getFirstPassage()]);
//
//   // Act
//   const result = await positionCheckerService.isPositionAvailable(1, 1, FloorDataSource.getSecondFloor());
//
//   // Assert
//   expect(result).to.be.true;
// });
//
// it('should return true if the position is available (no passages on the floor)', async () => {
//
//   // Arrange
//   passageRepoMock.findPassagesByFloorId.resolves(null);
//
//   // Act
//   const result = await positionCheckerService.isPositionAvailable(1, 1, FloorDataSource.getFirstFloor());
//
//   // Assert
//   expect(result).to.be.true;
// });
//
// it('should return false if the position is not available (startpoint)', async () => {
//
//     // Arrange
//     passageRepoMock.findPassagesByFloorId.resolves([PassageDataSource.getFirstPassage()]);
//
//     // Act
//     const result = await positionCheckerService.isPositionAvailable(0, 2, FloorDataSource.getFirstFloor());
//
//     // Assert
//     expect(result).to.be.false;
//   });
// });