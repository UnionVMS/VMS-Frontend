import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { formatDate } from '@app/helpers/helpers';

import { State } from '@app/app-reducer';
import { AssetActions, AssetSelectors, AssetTypes } from '@data/asset';
import { ContactActions, ContactTypes, ContactSelectors } from '@data/contact';
import { NotificationsTypes, NotificationsActions } from '@data/notifications';
import { RouterTypes, RouterSelectors } from '@data/router';
import { errorMessage } from '@app/helpers/validators/error-messages';

@Component({
  selector: 'contact-show-by-asset-page',
  templateUrl: './show-by-asset.component.html',
  styleUrls: ['./show-by-asset.component.scss'],
})
export class ShowByAssetPageComponent implements OnInit, OnDestroy {

  constructor(private readonly store: Store<State>) { }

  public contacts: ReadonlyArray<ContactTypes.Contact>;
  public mergedRoute: RouterTypes.MergedRoute;
  public unmount$: Subject<boolean> = new Subject<boolean>();
  public selectedAsset: AssetTypes.Asset;

  mapStateToProps() {
    this.store.select(ContactSelectors.getContactsOnAsset).pipe(takeUntil(this.unmount$)).subscribe((contacts) => {
      console.warn(this.contacts);
      this.contacts = contacts;
    });
    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      if(typeof this.mergedRoute.params.assetId !== 'undefined') {
        this.store.dispatch(AssetActions.getSelectedAsset());
      }
    });

    this.store.select(AssetSelectors.getAssetByUrl).pipe(takeUntil(this.unmount$)).subscribe(selectedAsset => {
      this.selectedAsset = selectedAsset;
    });
  }

  mapDispatchToProps() {}

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(ContactActions.getSelectedContact());
    this.store.dispatch(ContactActions.getContactsForSelectedAsset());
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    // Now let's also unsubscribe from the subject itself:
    this.unmount$.unsubscribe();
  }
}
