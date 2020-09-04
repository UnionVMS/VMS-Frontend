import { Component, Input, OnChanges } from '@angular/core';
import { AssetTypes } from '@data/asset';

import { formatUnixdate } from '@app/helpers/datetime-formatter';

@Component({
  selector: 'map-licence-information',
  templateUrl: './licence-information.component.html',
  styleUrls: ['./licence-information.component.scss']
})
export class LicenceInformationComponent implements OnChanges {
  @Input() licence: AssetTypes.AssetLicence;
  @Input() licenceLoaded: boolean;

  public formattedLicence: AssetTypes.AssetLicence & {
    formattedToDate: string;
    formattedDecisionDate: string,
    formattedFromDate: string,
    active: string,
  };
  public displayInformation = true;
  public toggleDisplayInformation = () => this.displayInformation = !this.displayInformation;

  ngOnChanges() {
    if(typeof this.licence !== 'undefined' && this.licence !== null) {
      const currentTimestamp = Date.now();
      this.formattedLicence = {
        ...this.licence,
        formattedToDate: formatUnixdate(this.licence.toDate),
        formattedDecisionDate: formatUnixdate(this.licence.decisionDate),
        formattedFromDate: formatUnixdate(this.licence.fromDate),
        active: (
          this.licence.fromDate < currentTimestamp &&
          currentTimestamp < this.licence.toDate
          ? 'Active' : 'Inactive'
        ),
      };
    }
  }
}
