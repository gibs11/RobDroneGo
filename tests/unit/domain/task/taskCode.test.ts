import * as sinon from 'sinon';

import {TaskCode} from "../../../../src/domain/task/taskCode";

  describe('Task Code', () => {

  describe('success when', () => {
    it('creating a valid task code', () => {
      // Arrange
      const taskCodeNumber = 1;

      // Act
      const taskCodeResult = TaskCode.create(taskCodeNumber);

      // Assert
      sinon.assert.match(taskCodeResult.isSuccess, true);

      const taskCode = taskCodeResult.getValue();

      sinon.assert.match(taskCode.value, taskCodeNumber);
    });
  });

  describe('failure when', () => {
    it('creating a task code object with null or undefined value', () => {
      // Arrange
      const taskCodeNumber = null;

      // Act
      const taskCodeResult = TaskCode.create(taskCodeNumber);

      // Assert
      sinon.assert.match(taskCodeResult.isFailure, true);
      sinon.assert.match(taskCodeResult.error, 'Task code is not a number.');
    });

    it('creating a task code object with decimal value', () => {
      // Arrange
      const taskCodeNumber = 1234.56;

      // Act
      const taskCodeResult = TaskCode.create(taskCodeNumber);

      // Assert
      sinon.assert.match(taskCodeResult.isFailure, true);
      sinon.assert.match(taskCodeResult.error, 'Task code must be an integer.');
    });

    it('creating a negative task code object', () => {
      // Arrange
      const taskCodeNumber = -123;

      // Act
      const taskCodeResult = TaskCode.create(taskCodeNumber);

      // Assert
      sinon.assert.match(taskCodeResult.isFailure, true);
      sinon.assert.match(taskCodeResult.error, 'Task code is negative.');
    });
  });
});
