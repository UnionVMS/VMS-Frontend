import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { formatDate } from '@app/helpers/helpers';

import { State } from '@app/app-reducer';
import { AssetActions } from '@data/asset';
import { NotesActions, NotesInterfaces, NotesSelectors } from '@data/notes';
import { NotificationsInterfaces, NotificationsActions } from '@data/notifications';
import { RouterInterfaces, RouterSelectors } from '@data/router';

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

  mapStateToProps() {
    this.notesSubscription = this.store.select(NotesSelectors.getNoteByUrl).subscribe((note) => {
      if(typeof note !== 'undefined') {
        this.note = note;
      }
    });
    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      if(typeof this.mergedRoute.params.assetId !== 'undefined') {
        this.store.dispatch(AssetActions.getSelectedAsset());
      }
    });
  }

  mapDispatchToProps() {
    this.save = () => {
       const formValidation = this.validateForm();
       if(formValidation === true) {
      this.store.dispatch(NotesActions.saveNote({ note: this.note }));
       } else {
        console.warn("Validation error");
       }
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(NotesActions.getSelectedNotes());
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

  validateForm(){
    return true;
  }
}
