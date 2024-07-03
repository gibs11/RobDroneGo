import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (!envFound) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

export default {
  /**
   * Your favorite port : optional change to 4000 by JRT
   */
  port: parseInt(process.env.PORT, 10) || 4000,

  /**
   * That long string from mlab
   */
  databaseURL: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test',

  /* Path api host  */
  pathApiHost: process.env.PATH_API_HOST || 'http://127.0.0.1:5000',

  /**
   * User management api host
   */
  userManagementApiHost: process.env.USER_MANAGEMENT_API_HOST || 'http://127.0.0.1:5005',

  /**
   * Your secret sauce
   */
  jwtSecret: process.env.JWT_SECRET || 'my sakdfho2390asjod$%jl)!sdjas0i secret',

  /**
   * Used by winston logger
   */
  logs: {
    level: process.env.LOG_LEVEL || 'info',
  },

  /**
   * API configs
   */
  api: {
    prefix: '/api',
    campus_api: '/campus',
    fleet_api: '/fleet',
    prolog_api: '/prolog',
    task_api: '/tasks',
  },

  controllers: {
    role: {
      name: 'RoleController',
      path: '../controllers/roleController',
    },
    building: {
      name: 'BuildingController',
      path: '../controllers/buildingController',
    },
    robisepType: {
      name: 'robisepTypeController',
      path: '../controllers/robisepTypeController',
    },
    robisep: {
      name: 'robisepController',
      path: '../controllers/robisepController',
    },
    floor: {
      name: 'FloorController',
      path: '../controllers/floorController',
    },
    elevator: {
      name: 'ElevatorController',
      path: '../controllers/elevatorController',
    },
    room: {
      name: 'RoomController',
      path: '../controllers/roomController',
    },
    passage: {
      name: 'PassageController',
      path: '../controllers/passageController',
    },
    prologFloorPlan: {
      name: 'PrologFloorPlanController',
      path: '../controllers/prologFloorPlanController',
    },
    prologCampus: {
      name: 'PrologCampusController',
      path: '../controllers/prologCampusController',
    },
    path: {
      name: 'PathController',
      path: '../controllers/pathController',
    },
    task: {
      name: 'TaskController',
      path: '../controllers/taskController',
    },
    prologTasks: {
      name: 'PrologTasksController',
      path: '../controllers/prologTasksController',
    },
  },

  repos: {
    role: {
      name: 'RoleRepo',
      path: '../repos/roleRepo',
    },
    user: {
      name: 'UserRepo',
      path: '../repos/userRepo',
    },
    robisepType: {
      name: 'robisepTypeRepo',
      path: '../repos/robisepTypeRepo',
    },
    building: {
      name: 'BuildingRepo',
      path: '../repos/buildingRepo',
    },
    robisep: {
      name: 'robisepRepo',
      path: '../repos/robisepRepo',
    },
    floor: {
      name: 'FloorRepo',
      path: '../repos/floorRepo',
    },
    elevator: {
      name: 'ElevatorRepo',
      path: '../repos/elevatorRepo',
    },
    room: {
      name: 'RoomRepo',
      path: '../repos/roomRepo',
    },
    passage: {
      name: 'PassageRepo',
      path: '../repos/passageRepo',
    },
    surveillanceTask: {
      name: 'SurveillanceTaskRepo',
      path: '../repos/task/surveillanceTaskRepo',
    },
    pickUpAndDeliveryTask: {
      name: 'PickUpAndDeliveryTaskRepo',
      path: '../repos/task/pickUpAndDeliveryTaskRepo',
    },
  },

  services: {
    role: {
      name: 'RoleService',
      path: '../services/ServicesImpl/roleService',
    },
    building: {
      name: 'BuildingService',
      path: '../services/ServicesImpl/buildingService',
    },
    robisepType: {
      name: 'RobisepTypeService',
      path: '../services/ServicesImpl/robisepTypeService',
    },
    floor: {
      name: 'FloorService',
      path: '../services/ServicesImpl/floorService',
    },
    robisep: {
      name: 'RobisepService',
      path: '../services/ServicesImpl/robisepService',
    },
    elevator: {
      name: 'ElevatorService',
      path: '../services/ServicesImpl/elevatorService',
    },
    elevatorPositionChecker: {
      name: 'ElevatorPositionCheckerService',
      path: '../domain/ServicesImpl/elevatorPositionChecker',
    },
    passagePositionChecker: {
      name: 'PassagePositionCheckerService',
      path: '../domain/ServicesImpl/passagePositionChecker',
    },
    roomPositionChecker: {
      name: 'RoomPositionCheckerService',
      path: '../domain/ServicesImpl/roomPositionChecker',
    },
    positionChecker: {
      name: 'PositionCheckerService',
      path: '../domain/ServicesImpl/positionChecker',
    },
    floorPlanJSONValidator: {
      name: 'FloorPlanJSONValidator',
      path: '../domain/ServicesImpl/floorPlanJSONValidator',
    },
    room: {
      name: 'RoomService',
      path: '../services/ServicesImpl/roomService',
    },
    doorPositionChecker: {
      name: 'DoorPositionChecker',
      path: '../domain/ServicesImpl/doorPositionChecker',
    },
    roomAreaChecker: {
      name: 'RoomAreaChecker',
      path: '../domain/ServicesImpl/roomAreaChecker',
    },
    passage: {
      name: 'PassageService',
      path: '../services/ServicesImpl/passageService',
    },
    prologFloorPlan: {
      name: 'PrologFloorPlanService',
      path: '../services/ServicesImpl/prologFloorPlanService',
    },
    prologCampus: {
      name: 'PrologCampusService',
      path: '../services/ServicesImpl/prologCampusService',
    },
    floorMapGenerator: {
      name: 'FloorMapGenerator',
      path: '../services/ServicesImpl/floorMapGenerator',
    },
    path: {
      name: 'PathService',
      path: '../services/ServicesImpl/pathService',
    },
    task: {
      name: 'TaskService',
      path: '../services/ServicesImpl/taskService',
    },
    prologTasks: {
      name: 'PrologTasksService',
      path: '../services/ServicesImpl/prologTasksService',
    },
  },

  factories: {
    robisep: {
      name: 'RobisepFactory',
      path: '../factories/robisepFactory',
    },
    floor: {
      name: 'FloorFactory',
      path: '../factories/floorFactory',
    },
    elevator: {
      name: 'ElevatorFactory',
      path: '../factories/elevatorFactory',
    },
    room: {
      name: 'RoomFactory',
      path: '../factories/roomFactory',
    },
    passage: {
      name: 'PassageBuilder',
      path: '../factories/passageBuilder',
    },
    task: {
      name: 'TaskFactory',
      path: '../factories/taskFactory',
    },
  },

  gateways: {
    path: {
      name: 'PathGateway',
      path: '../gateways/pathGateway',
    },
    user: {
      name: 'UserGateway',
      path: '../gateways/userGateway',
    },
    task: {
      name: 'TaskGateway',
      path: '../gateways/taskGateway',
    },
  },

  configurableValues: {
    building: {
      maxNameLength: 50,
      maxDescriptionLength: 255,
      maxCodeLength: 5,
    },
    robisepType: {
      designationMaxLenght: 25,
      brandMaxLength: 50,
      modelMaxLength: 100,
    },
    robisep: {
      nicknameMaxLength: 30,
      serialNumberMaxLength: 50,
      codeMaxLength: 30,
      descriptionMaxLength: 250,
    },
    floor: {
      minFloorPlanLength: 1,
      minFloorDescriptionLength: 1,
      maxFloorDescriptionLength: 250,
      // The minimum because there is the need for the minimum of building width plus another unit
      minFloorPlanWidth: 2,
      // The minimum because there is the need for the minimum of building height plus another unit
      minFloorPlanHeight: 2,
      // The number of necessary coordinates from the room
      numberOfRoomCoordinates: 2,
      // The increment of the length in the floor plan
      floorPlanLengthIncrement: 1,
      // The increment of the width in the floor plan
      floorPlanWidthIncrement: 1,
    },
    elevator: {
      maxBrandNameLength: 50,
      maxSerialNumberLength: 50,
      maxDescriptionLength: 250,
      maxModelLength: 50,
      minXPosition: 0,
      minYPosition: 0,
    },
    room: {
      nameMaxLength: 50,
      maxDescriptionLength: 250,
    },
    path: {
      prologIncrement: 1,
      urlPrefix: '/api',
      urlPaths: '/paths',
      urlPrologApi: '/prolog',
      urlOriginFloor: 'originFloor=',
      urlOriginCel: 'originCel=',
      urlDestinationFloor: 'destinationFloor=',
      urlDestinationCel: 'destinationCel=',
    },
    userManagement: {
      urlPrefix: '/api',
      urlUsers: '/Users',
      urlIds: '/ids',
      urlIamId: 'iamId=',
    },
    taskGateway: {
      urlPrefix: '/api',
      urlProlog: '/prolog',
      urlPermutations: '/taskSequencePermutation',
      urlGenetic: '/taskSequenceGeneticAlgorithm',
      urlRobisepId: 'robisepId',
    },
    phoneNumber: {
      formats: [
        // Portuguese phone number format
        /^(\+351)?9[1236]\d{7}$/,
      ],
    },
    task: {
      pickUpAndDeliveryTask: {
        descriptionMaxLength: 1000,
        confirmationCodeMinValue: 1000,
        confirmationCodeMaxValue: 999999,
      },
    },
  },
  userManagementApiToken:
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFKOGJkVF81N2JuR1pTZEI0djRPSCJ9.eyJpc3MiOiJodHRwczovL2Rldi01MWpsbWF4NW0xc2VicHBxLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2NThhMTQ1Mzk4YWE3NTUwNDU3ZWQxYjEiLCJhdWQiOlsiaHR0cHM6Ly9hcGkuYXV0aC5yb2Jkcm9uZWdvLmNvbSIsImh0dHBzOi8vZGV2LTUxamxtYXg1bTFzZWJwcHEuZXUuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTcwMzc3ODkzNywiZXhwIjoxNzA2MzcwOTM3LCJhenAiOiJxc0FLcjNIdmVueTFYTXV0c1N0ejV6ckViUWdNWDBxcSIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJwZXJtaXNzaW9ucyI6WyJtYW5hZ2U6YWRtaW4iLCJtYW5hZ2U6dXNlcnMiXX0.T283v5ZlYWIel02O5WqkSj2Rhb_CeK6kYIzi84XZ5VBB9uu9lzNetsoCtA77BUdodvs9Ua36e3ZhWCuqkoTi_1hrVV-dWVLiTg2LyL43RpnaTCUJ32IJoD_R034qYtDg8Cf7DPKhqm8ZFZ9kyrbBtF-6cbm8K3JVOXEp3sswrGFiWy3L3U0BTxNJoHAN9KM4HgjOxtSGtla8VHa1mZTcK4GRdkzjyjetBBRA9QyYjnk6njG0esz1pgim_AGCJSac9iaUvabD2gcdR8VF0OiTsUFa6MZj4UDNBCGwdcFZIMxgAWQYa3Im9dEGNkMWWafNYcUKcDX9CCnHy8Q9GTJihA',
  taskManagementApiToken:
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFKOGJkVF81N2JuR1pTZEI0djRPSCJ9.eyJpc3MiOiJodHRwczovL2Rldi01MWpsbWF4NW0xc2VicHBxLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2NTg4NWI2ODA4OTBjODcwMzg4OWVkYzQiLCJhdWQiOlsiaHR0cHM6Ly9hcGkuYXV0aC5yb2Jkcm9uZWdvLmNvbSIsImh0dHBzOi8vZGV2LTUxamxtYXg1bTFzZWJwcHEuZXUuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTcwMzc3OTgwMiwiZXhwIjoxNzA2MzcxODAyLCJhenAiOiJxc0FLcjNIdmVueTFYTXV0c1N0ejV6ckViUWdNWDBxcSIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJwZXJtaXNzaW9ucyI6WyJtYW5hZ2U6dGFza3MiXX0.ftJHh2D8dhubVgibbPpMhH6cYECyxiwuml04N23iXYH_fTmyw2IE7B_YN_6cFqkh2r9a0bzrj2b5Ia8CWPCij6HFbXLw2ls-fm9zE6pgA15-vtuIutofTovFMtOuYAF3AxQxr7XtgIKULJEgWSdOGGpwcYK28OK1J8G3xd4dTbCAVkhm2TwLk2pWh8bcaOIByUHzizQ7L91RqnHDqgkGLP3oHIg36fVzS-8QOXQ9jyl-7cUCSHW_jm0UEiunjNfN1ZPmG4uYdGV4jYKXKmvvQ3DHQ-o1LJTrTOtEN6mC6tYmzBtOb32Cb93zS7hlnlFgiZ27hvClPW5COWwBiLvS3Q',
};
