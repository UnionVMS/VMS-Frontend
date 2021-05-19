import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export default class MyErrorStateMatcher implements ErrorStateMatcher {

  private errorMessages: ReadonlyArray<string> | undefined;

  constructor(errorMessages: ReadonlyArray<string> | undefined) {
    this.errorMessages = errorMessages;
  }

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return typeof this.errorMessages !== 'undefined' && this.errorMessages.length > 0;
    // return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
