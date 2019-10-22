import { store } from '@/store';
import { ErrorTypes } from '@/core/error-types';

// Helpers
import arrayWrap from '@/utils/array-wrap';

export default class Errors {
  public errors: any = {};
  public errorTypes = ErrorTypes;
  /**
   * Set the errors object or field error messages.
   *
   * @param {Object|String} field
   * @param {Array|String|undefined} messages
   */
  public set(field: any, messages: string[] = []) {
    if (typeof field === 'object') {
      this.errors = { ...field };
    } else {
      // That construction is necessary for reactivity in components
      this.errors = { ...this.errors, [field]: arrayWrap(messages) };
    }
  }

  /**
   * Determine if there is an error for the given field.
   *
   * @param  {String} field
   * @return {Boolean}
   */
  public has(field: any) {
    return (field in this.errors);
  }

  /**
   * Determine if there are any errors.
   *
   * @return {Boolean}
   */
  public any(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  /**
   * Get the first error message for the given field.
   *
   * @param  {String} field
   * @return {String|undefined}
   */
  public get(field: any) {
    if (this.has(field)) {
      const error = this.getAll(field)[0];
      return store.state.translations[error] || this.errorTypes[error] || error;
    }
  }

  /**
   * Get all the error messages for the given field.
   *
   * @param  {String} field
   * @return {Array}
   */
  public getAll(field: any) {
    if ( this.has(field) ) {
      return arrayWrap(this.errors[field]);
    } else {
      return [];
    }
  }

  /**
   * Get the error message for the given fields.
   *
   * @param  {...String} fields
   * @return {Array}
   */
  public only(...fields: any[]) {
    const messages: any[] = [];

    for (const field of fields) {
      const message = this.get(field);

      if (message) {
        messages.push(message);
      }
    }

    return messages;
  }

  /**
   * Get all the errors in a flat array.
   *
   * @return {Array}
   */
  public flatten() {
    return Object.values(this.errors).reduce((a: any[], b: any) => a.concat(b), []);
  }

  /**
   * Clear one or all error fields.
   *
   * @param {String|undefined} field
   */
  public clear(field?: any) {
    const errors: any = {};

    if (field) {
      for (const key in this.errors) {
        if (key !== field) {
          errors[key] = [...this.errors[key]];
        }
      }
    }

    this.set(errors);
  }


}
