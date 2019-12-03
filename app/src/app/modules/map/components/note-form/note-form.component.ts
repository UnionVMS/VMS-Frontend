import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { NotesActions, NotesInterfaces, NotesSelectors } from '@data/notes';
import { createNotesFormValidator } from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

@Component({
  selector: 'map-note-form',
  templateUrl: './note-form.component.html',
  styleUrls: ['./note-form.component.scss']
})
export class NoteFormComponent implements OnInit {
  public save: () => void;
  public formValidator: FormGroup;

  ngOnInit() {
    this.formValidator = createNotesFormValidator();
  }

  getErrors(path: string[]) {
    const errors = this.formValidator.get(path).errors;
    return errors === null ? [] : Object.keys(errors);
  }

  errorMessage(error: string) {
    if(error === 'maxlength') {
      return 'Text can not be longer then 255 characters.';
    }

    return errorMessage(error);
  }
}
