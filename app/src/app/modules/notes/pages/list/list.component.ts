import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject } from 'rxjs';
import { take, takeUntil, first } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';

import { State } from '@app/app-reducer';
import { AssetActions, AssetTypes, AssetSelectors } from '@data/asset';
import { RouterTypes, RouterSelectors } from '@data/router';
import { NotesActions, NotesTypes, NotesSelectors } from '@data/notes';
import { UserSettingsSelectors } from '@data/user-settings';
import { AuthSelectors } from '@data/auth';
import { formatUnixtime } from '@app/helpers/datetime-formatter';

import { DeleteNoteDialogDialogComponent } from '@modules/notes/components/delete-note-dialog/delete-note-dialog.component';

type FormattedNote = NotesTypes.Note & { createdOnFormatted: string };

@Component({
  selector: 'notes-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotesListComponent implements OnInit, OnDestroy {
  constructor(private readonly store: Store<State>, public dialog: MatDialog) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public mergedRoute: RouterTypes.MergedRoute;
  public asset: AssetTypes.Asset;
  public notes: ReadonlyArray<{
    note: FormattedNote,
    searchableString: string
  }>;
  public save: (note: NotesTypes.Note, redirect: boolean) => void;
  public deleteNote: (noteId: string) => void;

  public searchString = '';
  public filteredNotes: ReadonlyArray<FormattedNote>;

  public userTimezone: string;
  public username: string;

  public emptyNote = {};

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
      }).sort((a, b) => {
        return b.note.createdOn - a.note.createdOn;
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
      this.asset = asset;
    });
    this.store.select(UserSettingsSelectors.getTimezone).pipe(takeUntil(this.unmount$)).subscribe(userTimezone => {
      this.userTimezone = userTimezone;
    });
    this.store.select(AuthSelectors.getUserName).pipe(takeUntil(this.unmount$)).subscribe(username => {
      this.username = username;
    });
  }

  mapDispatchToProps() {
    this.save = (note: NotesTypes.Note) => {
      this.store.dispatch(NotesActions.saveNote({ note, redirect: false }));
      this.emptyNote = {};
    };
    this.deleteNote = (noteId: string) => {
      this.store.dispatch(NotesActions.deleteNote({ noteId }));
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

  openDeleteDialog(note: FormattedNote): void {
    const dialogRef = this.dialog.open(DeleteNoteDialogDialogComponent, {
      data: {
        username: this.username,
        timestamp: note.createdOnFormatted,
        userTimezone: this.userTimezone,
      }
    });

    dialogRef.afterClosed().pipe(first()).subscribe(result => {
      if(result === true) {
        this.deleteNote(note.id);
      }
    });
  }
}
