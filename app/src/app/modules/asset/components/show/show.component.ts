import { Component, Input, OnChanges } from '@angular/core';
import getContryISO2 from 'country-iso-3-to-2';

import { formatUnixdate } from '@app/helpers/datetime-formatter';

import { AssetTypes } from '@data/asset';
import { IncidentTypes } from '@data/incident';

@Component({
  selector: 'asset-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent implements OnChanges {
  @Input() asset: AssetTypes.Asset;
  @Input() licence: AssetTypes.AssetLicence;
  @Input() incidents: ReadonlyArray<IncidentTypes.Incident>;
  @Input() experimentalFeaturesEnabled: boolean;

  public formattedLicence: AssetTypes.AssetLicence & {
    valid: boolean;
    formattedToDate: string;
    formattedDecisionDate: string,
    formattedFromDate: string,
    formattedCivicNumber: string,
  };
  public currentIncident: string;

  ngOnChanges() {
    if(typeof this.incidents !== 'undefined') {
      const openIncidents = Object.values(this.incidents).filter((incident) => incident.status !== IncidentTypes.IncidentResolvedStatus);
      if(openIncidents.length > 0) {
        this.currentIncident = typeof IncidentTypes.IncidentTypesTranslations[openIncidents[0].type] !== 'undefined'
          ? IncidentTypes.IncidentTypesTranslations[openIncidents[0].type]
          : openIncidents[0].type;
      }
    }
    if(typeof this.licence !== 'undefined' && this.licence !== null) {
      const currentTimestamp = Date.now();
      this.formattedLicence = {
        ...this.licence,
        valid: this.licence.fromDate < currentTimestamp &&
        currentTimestamp < this.licence.toDate,
        formattedToDate: formatUnixdate(this.licence.toDate),
        formattedDecisionDate: formatUnixdate(this.licence.decisionDate),
        formattedFromDate: formatUnixdate(this.licence.fromDate),
        formattedCivicNumber: this.formatCivicNumber(this.licence.civicNumber),
      };
    }
  }

  public formatCivicNumber(civicNumber: string) {
    const insertPosition = length - 4;
    return [civicNumber.slice(0, insertPosition), '-', civicNumber.slice(insertPosition)].join('');
  }

  public getCountryCode() {
    const countryCode = getContryISO2(this.asset.flagStateCode);
    if(typeof countryCode === 'undefined') {
      return '???';
    }
    return countryCode.toLowerCase();
  }

  public formatFixed2(nr: number){
    return nr.toFixed(2);
  };

}
