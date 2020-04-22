import { Component, Input, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { FormGroup, FormControl } from '@angular/forms';

import { State } from '@app/app-reducer';
import { NotesActions, NotesTypes, NotesSelectors } from '@data/notes';
import { RouterTypes, RouterSelectors } from '@data/router';
import { createNotesFormValidator } from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

@Component({
  selector: 'notes-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnChanges {

  @Input() note: NotesTypes.Note;
  @Input() save: (note: NotesTypes.Note) => void;
  @Input() create: boolean;

  public notesSubscription: Subscription;
  public formValidator: FormGroup;

  ngOnChanges() {
    this.formValidator = createNotesFormValidator(this.note);
  }


  public saveFromFormValidator() {
    const note = {
      ...this.note,
      note: this.formValidator.value.essentailFields.note,
    };
    this.save(note);
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
