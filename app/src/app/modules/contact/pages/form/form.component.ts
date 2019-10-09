import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { formatDate } from '@app/helpers/helpers';

import { State } from '@app/app-reducer';
import { AssetActions } from '@data/asset';
import { ContactActions, ContactInterfaces, ContactSelectors } from '@data/contact';
import { NotificationsInterfaces, NotificationsActions } from '@data/notifications';
import { RouterInterfaces, RouterSelectors } from '@data/router';

@Component({
  selector: 'contact-edit-page',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormPageComponent implements OnInit, OnDestroy {

  constructor(private store: Store<State>) { }

  public contactSubscription: Subscription;
  public contact = {} as ContactInterfaces.Contact;
  public save: () => void;
  public mergedRoute: RouterInterfaces.MergedRoute;

  mapStateToProps() {
    this.contactSubscription = this.store.select(ContactSelectors.getContactByUrl).subscribe((contact) => {
      if(typeof contact !== 'undefined') {
        this.contact = contact;
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
      // const formValidation = this.validateForm();
      // if(formValidation === true) {
      this.store.dispatch(ContactActions.saveContact({ contact: this.contact }));
      // } else {
      //   formValidation.map((notification) => {
      //     this.store.dispatch(NotificationsActions.addNotification(notification));
      //   });
      // }
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(ContactActions.getSelectedContact());
  }

  ngOnDestroy() {
    if(this.contactSubscription !== undefined) {
      this.contactSubscription.unsubscribe();
    }
  }

  isCreateOrUpdate() {
    return typeof this.mergedRoute.params.contactId === 'undefined' ? 'Create' : 'Edit';
  }

  isFormReady() {
    return this.isCreateOrUpdate() === 'Create' || Object.entries(this.contact).length !== 0;
  }

  toggleOwner() {
    return this.contact.owner = !this.contact.owner;
  }
}
