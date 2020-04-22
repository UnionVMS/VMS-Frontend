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
import { createContactFormValidator } from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

@Component({
  selector: 'contact-edit-page',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormPageComponent implements OnInit, OnDestroy {

  constructor(private store: Store<State>) { }

  public contact = {} as ContactTypes.Contact;
  public save: () => void;
  public mergedRoute: RouterTypes.MergedRoute;
  public formValidator: FormGroup;
  public unmount$: Subject<boolean> = new Subject<boolean>();
  public selectedAsset: AssetTypes.Asset;

  mapStateToProps() {
    this.store.select(ContactSelectors.getContactByUrl).pipe(takeUntil(this.unmount$)).subscribe((contact) => {
      if(typeof contact !== 'undefined') {
        this.contact = contact;
      }
      this.formValidator = createContactFormValidator(this.contact);
    });
    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      if(typeof this.mergedRoute.params.assetId !== 'undefined') {
        this.store.dispatch(AssetActions.getSelectedAsset());
      }
    });

    this.store.select(AssetSelectors.getSelectedAsset).pipe(takeUntil(this.unmount$)).subscribe(selectedAsset => {
      this.selectedAsset = selectedAsset;
    });
  }

  mapDispatchToProps() {
    this.save = () => {
      const contact = {
        ...this.contact,
        name: this.formValidator.value.essentailFields.name,
        type: this.formValidator.value.essentailFields.type,
        email: this.formValidator.value.contact.email,
        phoneNumber: this.formValidator.value.contact.phone,
        country: this.formValidator.value.address.country,
        cityName: this.formValidator.value.address.city,
        streetName: this.formValidator.value.address.street,
        postOfficeBox: this.formValidator.value.address.postOfficeBox,
        postalArea: this.formValidator.value.address.postalArea,
        zipCode: this.formValidator.value.address.zipCode,
        nationality: this.formValidator.value.other.nationality,
        owner: this.formValidator.value.other.owner,
        source: this.formValidator.value.other.source,
      };
      console.warn(this.selectedAsset, typeof this.selectedAsset === 'undefined', this.selectedAsset === null);
      if(typeof this.selectedAsset === 'undefined' || this.selectedAsset === null) {
        this.store.dispatch(ContactActions.saveContact({ contact }));
      } else {
        this.store.dispatch(ContactActions.saveContact({ contact: { ...contact, assetId: this.selectedAsset.id } }));
      }
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(ContactActions.getSelectedContact());
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    // Now let's also unsubscribe from the subject itself:
    this.unmount$.unsubscribe();
  }

  isCreate() {
    return typeof this.mergedRoute.params.contactId === 'undefined';
  }

  isFormReady() {
    return typeof this.formValidator !== 'undefined';
  }

  getErrors(path: string[]) {
    const errors = this.formValidator.get(path).errors;
    return errors === null ? [] : Object.keys(errors);
  }

  errorMessage(error: string) {
    return errorMessage(error);
  }

  toggleOwner() {
    return this.contact = { ...this.contact, owner: !this.contact.owner };
  }
}
