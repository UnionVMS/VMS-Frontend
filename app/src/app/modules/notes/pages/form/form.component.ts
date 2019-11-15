import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { FormGroup, FormControl } from '@angular/forms';

import { State } from '@app/app-reducer';
import { NotesActions, NotesInterfaces, NotesSelectors } from '@data/notes';
import { RouterInterfaces, RouterSelectors } from '@data/router';
import { createNotesFormValidator } from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

@Component({
  selector: 'notes-edit-page',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormPageComponent implements OnInit, OnDestroy {

  constructor(private store: Store<State>) { }

  public notesSubscription: Subscription;
  public note = {} as NotesInterfaces.Note;
  public save: () => void;
  public mergedRoute: RouterInterfaces.MergedRoute;
  public formValidator: FormGroup;

  mapStateToProps() {
    this.notesSubscription = this.store.select(NotesSelectors.getNoteByUrl).subscribe((note) => {
      if(typeof note !== 'undefined') {
        this.note = note;
      }
      this.formValidator = createNotesFormValidator(this.note);
    });
    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      if(typeof this.mergedRoute.params.noteId !== 'undefined') {
        this.store.dispatch(NotesActions.getSelectedNote());
      }
    });
  }

  mapDispatchToProps() {
    this.save = () => {
      const note = {
        ...this.note,
        user: this.formValidator.value.essentailFields.user,
        notes: this.formValidator.value.essentailFields.notes,
      };
      this.store.dispatch(NotesActions.saveNote({ note }));
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(NotesActions.getSelectedNote());
  }

  ngOnDestroy() {
    if(this.notesSubscription !== undefined) {
      this.notesSubscription.unsubscribe();
    }
  }

  isCreateOrUpdate() {
    return typeof this.mergedRoute.params.noteId === 'undefined' ? 'Create' : 'Edit';
  }

  isFormReady() {
    return this.isCreateOrUpdate() === 'Create' || Object.entries(this.note).length !== 0;
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
