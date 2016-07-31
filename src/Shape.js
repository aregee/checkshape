/**
 * Promise based validation of input
 *

const Shape = require('checkshape');
const s = new Shape({
  user_id: (userId) => userExists(userId),
  name: (name, {user_id}) => findUserByName(name).then((user) => user.id === user_id)
})

s.check(data).then(({result, errors}) => {})
*/

const {assign, isArray, toPlainObject} = require('lodash');

const isUsableObject = require('isusableobject');

class Shape {
  constructor(validations=[]) {
    this.validations = new Map();

    this.addValidations(validations);
  }

  addValidations(validations=[]) {
    if (isUsableObject(validations)) {
      validations = toPlainObject(validations);
      validations = Object.keys(validations).map((k) => ({key: k, validation: validations[k]}));
    }

    validations.forEach(({key, validation}) => {
      this.validations.set(key, validation);
    });

    return this;
  }

  addValidation({key, validation}) {
    this.validations.set(key, validation);
    return this;
  }

  merge(validator) {
    Array.from(validator.validation.keys()).forEach((k) => {
      this.validations.set(k, validator.validations.get(k));
    });

    return this;
  }

  errors(input={}) {
    const keys = Array.from(this.validations.keys());

    return Promise.all(
      keys.map((key) => {
        const result = this.validations.get(key)(input[key], input, key);

        if (result instanceof Promise) {
          return result.then((result) => {
            return {key, result};
          });
        } else if (result instanceof Shape) {
          return result.errors(input[key]).then((result) => {
            return {key, result};
          });
        } else {
          return {key, result};
        }
      })
    )
    .then((results) => results.filter(({result}) => {
      return result !== true;
    }))
    .then((errors) => {
      if (errors.length === 0) {
        return null;
      } else {
        return errors.reduce((all, {key, result}) => {
          return assign(all, {
            [key]: isUsableObject(result) ? toPlainObject(result) : result
          });
        }, {});
      }
    });
  }

  check(input={}) {
    return this.errors(input).then((errors) => ({result: !!errors, errors}));
  }
}

module.exports = Shape;
