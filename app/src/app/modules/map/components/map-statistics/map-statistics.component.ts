import { Component, Input, OnChanges } from '@angular/core';
import Map from 'ol/Map';

import { AssetTypes } from '@data/asset';
import { IncidentTypes } from '@data/incident';

@Component({
  selector: 'map-statistics',
  templateUrl: './map-statistics.component.html',
  styleUrls: ['./map-statistics.component.scss']
})
export class MapStatisticsComponent implements OnChanges {
  @Input() mapStatistics: AssetTypes.MapStatistics;
  @Input() setAssetFilter: (filterQuery: Array<AssetTypes.AssetFilterQuery>) => void;
  @Input() setActiveLeftPanel: (activeLeftPanel: ReadonlyArray<string>) => void;
  @Input() setActiveRightPanel: (activeRightPanel: ReadonlyArray<string>) => void;

  public incidentTypeStatistics: ReadonlyArray<{ type: string, amount: number }>;

  private readonly vmsFilter = [
    { type: 'flagStateCode', values: ['SWE'], inverse: false, valueType: AssetTypes.AssetFilterValueTypes.STRING },
    { type: 'vesselType', values: ['Fishing'], inverse: false, valueType: AssetTypes.AssetFilterValueTypes.STRING },
    {
      type: 'lengthOverAll',
      values: [{ operator: 'greater than or equal', value: 12 }],
      inverse: false,
      valueType: AssetTypes.AssetFilterValueTypes.NUMBER
    }
  ];

  ngOnChanges() {
    this.incidentTypeStatistics = Object.entries(this.mapStatistics.incidentInfo).map(
      ([type, amount]) => ({ type, amount })
    );
  }

  getIncidentTypeName(type: string) {
    return IncidentTypes.IncidentTypesTranslations[IncidentTypes.IncidentTypes[type]];
  }

  trackByIncident(index: number, item: { type: string, amount: number }) {
    return item.type;
  }

  filterSendingVms() {
    this.setActiveLeftPanel(['filters']);
    this.setAssetFilter([ ...this.vmsFilter ]);
  }

  filterValidLicence(valid: boolean) {
    this.setActiveLeftPanel(['filters']);
    this.setAssetFilter([
      ...this.vmsFilter,
      { type: 'hasLicence', values: [ valid ], inverse: false, valueType: AssetTypes.AssetFilterValueTypes.BOOLEAN },
    ]);
    this.setActiveLeftPanel(['filters']);
  }

  setActiveLeftPanelByWorkflowType(type: string) {
    this.setActiveLeftPanel(['workflows', IncidentTypes.IncidentTypes[type]]);
  }
}
