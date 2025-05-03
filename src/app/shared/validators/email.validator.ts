import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class EmailValidators {
  static emailFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const email = control.value;

      // Basic email format validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return { invalidEmailFormat: true };
      }

      // Domain validation
      const parts = email.split("@");
      if (parts.length !== 2 || !parts[1].includes(".")) {
        return { invalidDomain: true };
      }

      return null;
    };
  }
}
