import Errors from '@/core/form/error';
import { FormInterfaces } from '@/core/interfaces/form-interfaces';
import { BadRequest } from '@/core/services/response-errors/bad-request';

import deepCopy from '@/utils/deep-copy';

class Form implements FormInterfaces.Form {
  public errors = new Errors();
  public data = {} as FormInterfaces.Data;

  protected validators = [] as FormInterfaces.Validator[];

  /**
   * @param {Object} data vue v-model connection
   * @param {Object} validators validators
   */
  constructor(data: FormInterfaces.Data, validators: FormInterfaces.Validator[]) {
    this.data = deepCopy(data);
    this.validators = [...validators];
  }

  /**
   * Получить значение поля
   * @param key string
   */
  public get(key: string): any {
    return this.data[key];
  }

  /**
   * Установить значение поля
   * @param {string} key
   * @param {any} value
   */
  public set(key: any, value: any): Form {
    this.data[key] = value;
    this.getErrorsForField(key);

    return this;
  }

  /**
   * Проверка формы.
   * По умолчанию проверяет есть ли ошибки в объекте ошибок.
   * Если передан массив хтмл элементов, то бегает по ним.
   * Смотрит есть ли соотвествующие валидаторы и проверяет эти поля.
   */
  public isValid(): boolean {
    this.onChange();
    return !this.errors.any();
  }

  /**
   * Прогоняем все валидаторы
   */
  public onChange = (): void => {
    for (const key in this.data) {
      if (key in this.data) {
        this.getErrorsForField(key);
      }
    }
  }

  public getErrorsForField = (field: string): void => {
    if (field) {
      this.errors.clear(field);

      const validators = this.validators
        .filter((element: FormInterfaces.Validator) => element.fieldName === field);

      if (validators.length > 0) {
        for (const validator of validators) {
          if ( !validator.isValid(this.get(field)) ) {
            this.errors.set(field, [validator.message]);

            break;
          }
        }
      }
    }
  }

  /**
   * Обертка для перехвата ошибок от бэкенда.
   */
  public send = (action: Promise<any>): void => {
    action.catch((e: any) => {
      this.catchValidationError(e);
      throw e;
    });
  }

  /**
   * Если обернуть запрос нет возможности, то принимаем ошибку вручную
   */
  public catchValidationError = (e: any): void => {
    if (e instanceof BadRequest) {
      const errors: FormInterfaces.ValidationArray = e.getValidation() as FormInterfaces.ValidationArray;
      for (const key in errors) {
        if (key in this.data && errors.hasOwnProperty(key)) {
          this.errors.set(key, errors[key]);
        }
      }
    }
  }
}

export default Form;
