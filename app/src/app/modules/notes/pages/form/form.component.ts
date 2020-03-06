import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { State } from '@app/app-reducer';
import { NotesActions, NotesInterfaces, NotesSelectors } from '@data/notes';
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
  public save: (note: NotesInterfaces.Note, redirect: boolean) => void;
  public mergedRoute: RouterInterfaces.MergedRoute;

  mapStateToProps() {
    this.notesSubscription = this.store.select(NotesSelectors.getNoteByUrl).subscribe((note) => {
      if(typeof note !== 'undefined') {
        this.note = note;
      }
    });
    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      if(typeof this.mergedRoute.params.noteId !== 'undefined') {
        this.store.dispatch(NotesActions.getSelectedNote());
      }
    });
  }

  mapDispatchToProps() {
    this.save = (note: NotesInterfaces.Note, redirect: boolean) => {
      this.store.dispatch(NotesActions.saveNote({ note, redirect }));
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

  isCreate() {
    return typeof this.mergedRoute.params.noteId === 'undefined';
  }

  isFormReady() {
    return this.isCreate() || Object.entries(this.note).length !== 0;
  }
}
