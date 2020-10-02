import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject } from 'rxjs';
import { take, takeUntil, first } from 'rxjs/operators';

import { State } from '@app/app-reducer';
import { AssetActions, AssetTypes, AssetSelectors } from '@data/asset';
import { RouterTypes, RouterSelectors } from '@data/router';
import { NotesActions, NotesTypes, NotesSelectors } from '@data/notes';
import { UserSettingsSelectors } from '@data/user-settings';
import { AuthSelectors } from '@data/auth';

@Component({
  selector: 'notes-list-page',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListPageComponent implements OnInit, OnDestroy {
  constructor(private readonly store: Store<State>) { }

  public notes$: Observable<ReadonlyArray<NotesTypes.Note>>;
  public unmount$: Subject<boolean> = new Subject<boolean>();
  public mergedRoute: RouterTypes.MergedRoute;
  public asset: AssetTypes.Asset;

  public save: (note: NotesTypes.Note) => void;
  public deleteNote: (noteId: string) => void;

  public userTimezone: string;
  public username: string;

  public emptyNote = {};

  mapStateToProps() {
    this.notes$ = this.store.select(NotesSelectors.getNotes);
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
}
