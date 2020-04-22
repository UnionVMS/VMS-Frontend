import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';

import { State } from '@app/app-reducer';
import { AssetActions, AssetTypes, AssetSelectors } from '@data/asset';
import { RouterTypes, RouterSelectors } from '@data/router';
import { NotesActions, NotesTypes, NotesSelectors } from '@data/notes';
import { formatUnixtime } from '@app/helpers/datetime-formatter';

@Component({
  selector: 'notes-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class NotesListComponent implements OnInit, OnDestroy {
  constructor(private store: Store<State>) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public mergedRoute: RouterTypes.MergedRoute;
  public asset: AssetTypes.Asset;
  public notes: ReadonlyArray<{ note: NotesTypes.Note, searchableString: string }>;
  public save: (note: NotesTypes.Note, redirect: boolean) => void;

  public searchString = '';
  public filteredNotes: ReadonlyArray<NotesTypes.Note>;

  mapStateToProps() {
    this.store.select(NotesSelectors.getNotes).pipe(takeUntil(this.unmount$)).subscribe((notes) => {
      this.notes = notes.map(note => ({
        ...note,
        createdOnFormatted: formatUnixtime(note.createdOn)
      })).map(note => {
        return {
          note,
          searchableString: note.createdBy + ' ' + note.createdOnFormatted + ' ' + note.note
        };
      });
      this.filteredNotes = this.notes
        .filter(note => note.searchableString.indexOf(this.searchString) !== -1)
        .map(note => note.note);
    });
    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      if(typeof this.mergedRoute.params.assetId !== 'undefined') {
        this.store.dispatch(AssetActions.getSelectedAsset());
      }
    });
    this.store.select(AssetSelectors.getSelectedAsset).pipe(takeUntil(this.unmount$)).subscribe(asset => {
      if(typeof this.asset === 'undefined') {
        this.store.dispatch(NotesActions.getNotesForSelectedAsset());
      }
      console.warn(asset);
      this.asset = asset;
    });
  }

  mapDispatchToProps() {
    this.save = (note: NotesTypes.Note) => {
      this.store.dispatch(NotesActions.saveNote({ note, redirect: false }));
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  searchNotes(searchString: string) {
    this.filteredNotes = this.notes
      .filter(note => note.searchableString.indexOf(searchString) !== -1)
      .map(note => note.note);
  }
}
