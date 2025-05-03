import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";

export class PasswordValidators {
  static passwordMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const formGroup = group as FormGroup;
      const password = formGroup.get("password");
      const confirmPassword = formGroup.get("confirmPassword");

      if (!password || !confirmPassword) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ mismatch: true });
        return { mismatch: true };
      }

      return null;
    };
  }

  static specialCharactersValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const invalidChars = ["(", ")", "!", "*", "'"];
      const value = control.value;
      const hasInvalidChar = invalidChars.some((char) => value.includes(char));

      return hasInvalidChar ? { invalidSpecialCharacters: true } : null;
    };
  }
}
