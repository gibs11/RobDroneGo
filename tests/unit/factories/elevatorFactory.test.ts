import { expect } from 'chai';
import * as sinon from 'sinon';


import ElevatorFactory from '../../../src/factories/elevatorFactory';
import BuildingDataSource from "../../datasource/buildingDataSource";
import IElevatorDTO from '../../../src/dto/IElevatorDTO';
import { Elevator } from '../../../src/domain/elevator/elevator';
import { ElevatorPosition } from '../../../src/domain/elevator/elevatorPosition';
import { Floor } from '../../../src/domain/floor/floor';
import { FloorNumber } from '../../../src/domain/floor/floorNumber';
import { ElevatorOrientation } from '../../../src/domain/elevator/elevatorOrientation';



describe('elevatorFactory', () => {
    // Create sinon sandbox for isolating tests
    const sandbox = sinon.createSandbox();


    let buildingRepoMock;
    let elevatorRepoMock;
    let floorRepoMock;
    let floorFactory;

    let floorDataSource1;
    let floorDataSource2;


    beforeEach(() => {

        buildingRepoMock = {
            findByDomainId: sinon.stub(),
        }

        floorRepoMock = {
            findByDomainId: sinon.stub(),
        }

        elevatorRepoMock = {
            findByDomainId: sinon.stub(),
        }

        floorFactory = new ElevatorFactory(buildingRepoMock, floorRepoMock, elevatorRepoMock);


        floorDataSource1 = Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue();

        floorDataSource2 = Floor.create({floorNumber: FloorNumber.create(2).getValue(), building: BuildingDataSource.getBuildingA()}).getValue();
            
        
    });


    afterEach(() => {
        sandbox.restore();
        sinon.restore();
    });

    describe('createElevator', () => {

        it ('should create an elevator', async () => {


            const elevatorDTO: IElevatorDTO = {
                domainId: '1a',
                uniqueNumber: 1,
                brand: 'brand',
                model: 'model',
                description: 'description',
                serialNumber: 'serialNumber',
                elevatorPosition: {
                    xposition: 2,
                    yposition: 3
                },
                orientation: 'NORTH',
                building: BuildingDataSource.getBuildingA().id.toString(),
                floors: [floorDataSource1, floorDataSource1]
            }

            const building = BuildingDataSource.getBuildingA();

            buildingRepoMock.findByDomainId.resolves(building);

            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            elevatorRepoMock.findByDomainId.resolves(null);

            const elevator = await floorFactory.createElevator(elevatorDTO);

            expect(elevator).to.be.not.null;
            expect(elevator.building).to.be.equal(building);
            expect(elevator.position.xposition).to.be.equal(2);
            expect(elevator.position.yposition).to.be.equal(3);
            expect(elevator.brand.value).to.be.equal('brand');
            expect(elevator.model.value).to.be.equal('model');
            expect(elevator.description.value).to.be.equal('description');
            expect(elevator.serialNumber.value).to.be.equal('serialNumber');
            expect(elevator.floors).to.be.not.null;
            expect(elevator.floors.length).to.be.equal(2);
            expect(elevator.floors[0]).to.be.equal(floorDataSource1);
            expect(elevator.floors[1]).to.be.equal(floorDataSource1);
        });

        it ('should throw an error if the building does not exist', async () => {


            const elevatorDTO: IElevatorDTO = {
                domainId: '1',
                uniqueNumber: 1,
                brand: 'brand',
                model: 'model',
                description: 'description',
                elevatorPosition: {
                    xposition: 2,
                    yposition: 3
                },
                orientation: 'NORTH',
                building: BuildingDataSource.getBuildingA().id.toString(),
                floors: [floorDataSource1]
            }

            buildingRepoMock.findByDomainId.resolves(null);

            elevatorRepoMock.findByDomainId.resolves(null);

            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            let error = null;
            try {
                await floorFactory.createElevator(elevatorDTO);
            } catch (e) {
                error = e;
            }

            expect(error).to.be.not.null;
            expect(error.message).to.be.equal('The building does not exist.');

        });

        it ('should throw an error if the elevator xposition is invalid', async () => {

                const elevatorDTO: IElevatorDTO = {
                    domainId: '1',
                    uniqueNumber: 1,
                    elevatorPosition: {
                        xposition: -2,
                        yposition: 3
                    },
                    orientation: 'NORTH',
                    building: BuildingDataSource.getBuildingA().id.toString(),
                    floors: [floorDataSource1]
                }

                const building = BuildingDataSource.getBuildingA();

                buildingRepoMock.findByDomainId.resolves(building);

                floorRepoMock.findByDomainId.resolves(floorDataSource1);

                elevatorRepoMock.findByDomainId.resolves(null);

                let error = null;
                try {
                    await floorFactory.createElevator(elevatorDTO);
                } catch (e) {
                    error = e;
                }

                expect(error).to.be.not.null;
                expect(error.message).to.be.equal('Elevator positions must be greater than 0');

        });

        it ('should throw an error if the elevator yposition is invalid', async () => {

                const elevatorDTO: IElevatorDTO = {
                    domainId: '1',
                    uniqueNumber: 1,
                    elevatorPosition: {
                        xposition: 2,
                        yposition: -3
                    },
                    orientation: 'NORTH',
                    building: BuildingDataSource.getBuildingA().id.toString(),
                    floors: [floorDataSource1]
                }

                const building = BuildingDataSource.getBuildingA();

                buildingRepoMock.findByDomainId.resolves(building);

                elevatorRepoMock.findByDomainId.resolves(null);

                floorRepoMock.findByDomainId.resolves(floorDataSource1);

                let error = null;
                try {
                    await floorFactory.createElevator(elevatorDTO);
                } catch (e) {
                    error = e;
                }

                expect(error).to.be.not.null;
                expect(error.message).to.be.equal('Elevator positions must be greater than 0');

        });

        it ('should throw an error if floor does not exist', async () => {
                
            const elevatorDTO: IElevatorDTO = {
                domainId: '1',
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: 2,
                    yposition: 3
                },
                orientation: 'NORTH',
                building: BuildingDataSource.getBuildingA().id.toString(),
                floors: [floorDataSource1]
            }
    
            const building = BuildingDataSource.getBuildingA();
    
            buildingRepoMock.findByDomainId.resolves(building);

            elevatorRepoMock.findByDomainId.resolves(null);
    
            floorRepoMock.findByDomainId.resolves(null);
    
            let error = null;
            try {
                await floorFactory.createElevator(elevatorDTO);
            } catch (e) {
                error = e;
            }
    
            expect(error).to.be.not.null;
            expect(error.message).to.be.equal('The floor does not exist.');
    
        });

        it ('should throw an error with brand without model', async () => {
                    
                try{
                    const elevatorDTO: IElevatorDTO = {
                        domainId: '1',
                        uniqueNumber: 1,
                        elevatorPosition: {
                            xposition: 2,
                            yposition: 3
                        },
                        orientation: 'NORTH',
                        brand: 'brand',
                        building: BuildingDataSource.getBuildingA().id.toString(),
                        floors: [floorDataSource1]
                    }
            
                    const building = BuildingDataSource.getBuildingA();
            
                    buildingRepoMock.findByDomainId.resolves(building);

                    elevatorRepoMock.findByDomainId.resolves(null);
            
                    floorRepoMock.findByDomainId.resolves(floorDataSource1);
            
                    await floorFactory.createElevator(elevatorDTO);
                } catch (e) {
                    expect(e).to.be.not.null;
                    expect(e.message).to.be.equal('Model required if Brand is provided.');
                }
        
        });

        it('should throw an error with invalid model without brand', async () => {
                        
            try{
                const elevatorDTO: IElevatorDTO = {
                    domainId: '1',
                    uniqueNumber: 1,
                    elevatorPosition: {
                        xposition: 2,
                        yposition: 3
                    },
                    orientation: 'NORTH',
                    model: 'model',
                    building: BuildingDataSource.getBuildingA().id.toString(),
                    floors: [floorDataSource1]
                }
        
                const building = BuildingDataSource.getBuildingA();
        
                buildingRepoMock.findByDomainId.resolves(building);

                elevatorRepoMock.findByDomainId.resolves(null);
        
                floorRepoMock.findByDomainId.resolves(floorDataSource1);
        
                await floorFactory.createElevator(elevatorDTO);
            } catch (e) {
                expect(e).to.be.not.null;
                expect(e.message).to.be.equal('Brand required if Model is provided.');
            }
            
        });

        it('should throw an error with invalid model with brand', async () => {
                                
            try {
                const elevatorDTO: IElevatorDTO = {
                    domainId: '1',
                    uniqueNumber: 1,
                    elevatorPosition: {
                        xposition: 2,
                        yposition: 3
                    },
                    orientation: 'NORTH',
                    brand: 'brand',
                    building: BuildingDataSource.getBuildingA().id.toString(),
                    floors: [floorDataSource1]
                }
        
                const building = BuildingDataSource.getBuildingA();
        
                buildingRepoMock.findByDomainId.resolves(building);

                elevatorRepoMock.findByDomainId.resolves(null);
        
                floorRepoMock.findByDomainId.resolves(floorDataSource1);
        
                await floorFactory.createElevator(elevatorDTO);
            } catch (e) {
                expect(e).to.be.not.null;
                expect(e.message).to.be.equal('Model required if Brand is provided.');
            }
                
        });

        it('should throw an error with invalid description', async () => {
                                        
            try {
                const elevatorDTO: IElevatorDTO = {
                    domainId: '1',
                    uniqueNumber: 1,
                    elevatorPosition: {
                        xposition: 2,
                        yposition: 3
                    },
                    orientation: 'NORTH',
                    description: '',
                    building: BuildingDataSource.getBuildingA().id.toString(),
                    floors: [floorDataSource1]
                }
        
                const building = BuildingDataSource.getBuildingA();
        
                buildingRepoMock.findByDomainId.resolves(building);

                elevatorRepoMock.findByDomainId.resolves(null);
        
                floorRepoMock.findByDomainId.resolves(floorDataSource1);
        
                await floorFactory.createElevator(elevatorDTO);
            } catch (e) {
                expect(e).to.be.not.null;
                expect(e.message).to.be.equal('Elevator description cannot be empty.');
            }
                        
        });

        it('should throw an error with invalid serial Number', async () => {
                                                    
            try {
                const elevatorDTO: IElevatorDTO = {
                    domainId: '1',
                    uniqueNumber: 1,
                    elevatorPosition: {
                        xposition: 2,
                        yposition: 3
                    },
                    orientation: 'NORTH',
                    serialNumber: '!',
                    building: BuildingDataSource.getBuildingA().id.toString(),
                    floors: [floorDataSource1]
                }
        
                const building = BuildingDataSource.getBuildingA();
        
                buildingRepoMock.findByDomainId.resolves(building);

                elevatorRepoMock.findByDomainId.resolves(null);
        
                floorRepoMock.findByDomainId.resolves(floorDataSource1);
        
                await floorFactory.createElevator(elevatorDTO);
            } catch (e) {
                expect(e).to.be.not.null;
                expect(e.message).to.be.equal('Elevator Serial Number can only contain alphanumeric characters and spaces.');
            } 
                        
        });

        it('should throw an error with invalid brand', async () => {
                                                                
            try {
                const elevatorDTO: IElevatorDTO = {
                    domainId: '1',
                    uniqueNumber: 1,
                    elevatorPosition: {
                        xposition: 2,
                        yposition: 3
                    },
                    orientation: 'NORTH',
                    brand: '!',
                    building: BuildingDataSource.getBuildingA().id.toString(),
                    floors: [floorDataSource1]
                }
        
                const building = BuildingDataSource.getBuildingA();
        
                buildingRepoMock.findByDomainId.resolves(building);

                elevatorRepoMock.findByDomainId.resolves(null);
        
                floorRepoMock.findByDomainId.resolves(floorDataSource1);
        
                await floorFactory.createElevator(elevatorDTO);
            } catch (e) {
                expect(e).to.be.not.null;
                expect(e.message).to.be.equal('Elevator Brand can only contain alphanumeric characters and spaces.');
            } 
                                    
        });

        it('should throw an error with already existing elevator', async () => {

            try {
                const elevatorDTO: IElevatorDTO = {
                    domainId: '123a',
                    uniqueNumber: 1,
                    elevatorPosition: {
                        xposition: 2,
                        yposition: 3
                    },
                    orientation: 'NORTH',
                    brand: '',
                    building: BuildingDataSource.getBuildingA().id.toString(),
                    floors: [floorDataSource1]
                }

                const building = BuildingDataSource.getBuildingA();

                let elevatorInstance = Elevator.create({
                    uniqueNumber: 1,
                    elevatorPosition: ElevatorPosition.create({xposition: 1 , yposition: 1}).getValue(),
                    orientation: ElevatorOrientation.NORTH,
                    building: BuildingDataSource.getBuildingA(),
                    floors: [Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue(), Floor.create({floorNumber: FloorNumber.create(2).getValue(), building: BuildingDataSource.getBuildingA()}).getValue()]
                }).getValue();

                buildingRepoMock.findByDomainId.resolves(building);

                elevatorRepoMock.findByDomainId.resolves(elevatorInstance);

                floorRepoMock.findByDomainId.resolves(floorDataSource1);

                await floorFactory.createElevator(elevatorDTO);
            } catch (e) {
                expect(e).to.be.not.null;
                expect(e.message).to.be.equal('The domainId for this elevator is not unique.');
            }

        });

        it('should throw an error with invalid model', async () => {
                                                                            
            try {
                const elevatorDTO: IElevatorDTO = {
                    domainId: '1',
                    uniqueNumber: 1,
                    elevatorPosition: {
                        xposition: 2,
                        yposition: 3
                    },
                    orientation: 'NORTH',
                    model: '!',
                    building: BuildingDataSource.getBuildingA().id.toString(),
                    floors: [floorDataSource1]
                }
            
                const building = BuildingDataSource.getBuildingA();
            
                buildingRepoMock.findByDomainId.resolves(building);
    
                elevatorRepoMock.findByDomainId.resolves(null);
            
                floorRepoMock.findByDomainId.resolves(floorDataSource1);
            
                await floorFactory.createElevator(elevatorDTO);
            } catch (e) {
                expect(e).to.be.not.null;
                expect(e.message).to.be.equal('Elevator Model can only contain alphanumeric characters and spaces.');
            } 
                                                
        });
        
        it('should throw an error with invalid model with valid brand', async () => {
                                                                                        
            try {
                const elevatorDTO: IElevatorDTO = {
                    domainId: '1',
                    uniqueNumber: 1,
                    elevatorPosition: {
                        xposition: 2,
                        yposition: 3
                    },
                    orientation: 'NORTH',
                    brand: 'brand',
                    model: '!',
                    building: BuildingDataSource.getBuildingA().id.toString(),
                    floors: [floorDataSource1]
                }
                
                const building = BuildingDataSource.getBuildingA();
                
                buildingRepoMock.findByDomainId.resolves(building);
        
                elevatorRepoMock.findByDomainId.resolves(null);
                
                floorRepoMock.findByDomainId.resolves(floorDataSource1);
                
                await floorFactory.createElevator(elevatorDTO);
            } catch (e) {
                expect(e).to.be.not.null;
                expect(e.message).to.be.equal('Elevator Model can only contain alphanumeric characters and spaces.');
            } 
                                                            
        });

        it('should throw an error with invalid description', async () => {                                                                                           
            try {
                const elevatorDTO: IElevatorDTO = {
                    domainId: '1',
                    uniqueNumber: 1,
                    elevatorPosition: {
                        xposition: 2,
                        yposition: 3
                    },
                    orientation: 'NORTH',
                    description: '!',
                    building: BuildingDataSource.getBuildingA().id.toString(),
                    floors: [floorDataSource1]
                }
                    
                const building = BuildingDataSource.getBuildingA();
                    
                buildingRepoMock.findByDomainId.resolves(building);
            
                elevatorRepoMock.findByDomainId.resolves(null);
                    
                floorRepoMock.findByDomainId.resolves(floorDataSource1);
                    
                await floorFactory.createElevator(elevatorDTO);
            } catch (e) {
                expect(e).to.be.not.null;
                expect(e.message).to.be.equal('Elevator Description can only contain alphanumeric characters and spaces.');
            } 
                                                                            
        });


    });
        

});