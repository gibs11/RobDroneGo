import * as sinon from 'sinon';

import { PersonalName} from '../../../../src/domain/common/personalName';

describe('Personal Name', () => {

  describe('success when', () => {
    it('creating a valid Personal Name object', () => {
      // Arrange
      const personalNameString = 'Sample Personal Name';

      // Act
      const personalNameResult = PersonalName.create(personalNameString);

      // Assert
      sinon.assert.match(personalNameResult.isSuccess, true);

      const personalName = personalNameResult.getValue();
      sinon.assert.match(personalName.value, personalNameString);
    });
  });

  describe('failure when', () => {
    it('creating a Personal Name with a null or undefined value', () => {
      // Arrange
      const invalidPersonalNameString = null;

      // Act
      const personalNameResult = PersonalName.create(invalidPersonalNameString);

      // Assert
      sinon.assert.match(personalNameResult.isFailure, true);
      sinon.assert.match(personalNameResult.error, 'Personal Name is not a string');
    });

    it('creating a Personal Name with only whitespace as value', () => {
      // Arrange
      const invalidPersonalNameString = ' ';

      // Act
      const personalNameResult = PersonalName.create(invalidPersonalNameString);

      // Assert
      sinon.assert.match(personalNameResult.isFailure, true);
      sinon.assert.match(personalNameResult.error, 'Personal Name only contains whitespace.');
    });
  });
});
