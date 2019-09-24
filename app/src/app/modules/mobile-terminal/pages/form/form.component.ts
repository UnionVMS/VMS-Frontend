import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';



import { State } from '@app/app-reducer';
import { MobileTerminalInterfaces, MobileTerminalActions, MobileTerminalSelectors } from '@data/mobile-terminal';
import { NotificationsInterfaces, NotificationsActions } from '@data/notifications';

@Component({
  selector: 'asset-edit-page',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormPageComponent implements OnInit, OnDestroy {

  constructor(private store: Store<State>) { }

  public mobileTerminalSubscription: Subscription;
  public transpondersSubscription: Subscription;
  public mobileTerminal = {} as MobileTerminalInterfaces.MobileTerminal;
  public transponders: Array<MobileTerminalInterfaces.Transponder> = [];
  public transceiverTypes = ['Inmarsat-C : Thrane&Thrane'];
  public save: () => void;

  mapStateToProps() {
    this.mobileTerminalSubscription = this.store.select(MobileTerminalSelectors.getMobileTerminalsByUrl).subscribe(
      (mobileTerminal) => {
        if(typeof mobileTerminal !== 'undefined') {
          this.mobileTerminal = mobileTerminal;
        }
      }
    );
    this.transpondersSubscription = this.store.select(MobileTerminalSelectors.getTransponders).subscribe((transponders) => {
      // console.warn(transponders);
      if(typeof transponders !== 'undefined') {
        this.transponders = transponders;
      }
    });
  }

  mapDispatchToProps() {
    this.save = () => {
      const formValidation = this.validateForm();
      // if(formValidation === true) {
      //   this.store.dispatch(AssetActions.saveAsset({ asset: this.mobileTerminal }));
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
    this.store.dispatch(MobileTerminalActions.getSelectedMobileTerminal());
    // console.warn("TEST");
    this.store.dispatch(MobileTerminalActions.getTransponders());
  }

  ngOnDestroy() {
    if(this.mobileTerminalSubscription !== undefined) {
      this.mobileTerminalSubscription.unsubscribe();
    }
  }

  isCreateOrUpdate() {
    return typeof this.mobileTerminal.id !== 'undefined' ? 'Edit' : 'Create';
  }

  validateForm() {
  //   const errors = [];
  //   if(
  //     typeof this.assetObject.flagStateCode === 'undefined' ||
  //     this.assetObject.flagStateCode === null ||
  //     this.assetObject.flagStateCode.length === 0
  //   ) {
  //     errors.push({
  //       notificationType: 'errors',
  //       notification: 'Form validaiton error: Require field <b>Flagstate</b> is not set.'
  //     });
  //   }
  //   if(
  //     typeof this.assetObject.externalMarking === 'undefined' ||
  //     this.assetObject.externalMarking === null ||
  //     this.assetObject.externalMarking.length === 0
  //   ) {
  //     errors.push({
  //       notificationType: 'errors',
  //       notification: 'Form validaiton error: Require field <b>External marking</b> is not set.'
  //     });
  //   }
  //   if(
  //     typeof this.assetObject.name === 'undefined' ||
  //     this.assetObject.name === null ||
  //     this.assetObject.name.length === 0
  //   ) {
  //     errors.push({
  //       notificationType: 'errors',
  //       notification: 'Form validaiton error: Require field <b>Name</b> is not set.'
  //     });
  //   }
  //
  //   return errors.length > 0 ? errors : true;
    return true;
  }
}
