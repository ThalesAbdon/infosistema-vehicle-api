import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function MaxCurrentYear(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'MaxCurrentYear',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const currentYear = new Date().getFullYear();
          return typeof value === 'number' && value <= currentYear;
        },
        defaultMessage(args: ValidationArguments) {
          const currentYear = new Date().getFullYear();
          return `O campo "${args.property}" não pode ser maior que ${currentYear}`;
        },
      },
    });
  };
}
