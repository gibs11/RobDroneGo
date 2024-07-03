// remove by JRT : import uuid from 'uuid/v4';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const uuid = require('uuid').v4;

import { Identifier } from './Identifier';

export class UniqueEntityID extends Identifier<string | number> {
  constructor(id?: string | number) {
    super(id ? id : generateUniqueId());
  }
}

function generateUniqueId(): string {
  const uuidWithoutHyphens = uuid().replace(/-/g, '');

  // Generate a random lowercase letter (a-z)
  const randomLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26));

  // Prepend the random letter to the UUID without hyphens
  const startsWithRandomLetter = randomLetter + uuidWithoutHyphens.substr(1);

  return startsWithRandomLetter;
}
