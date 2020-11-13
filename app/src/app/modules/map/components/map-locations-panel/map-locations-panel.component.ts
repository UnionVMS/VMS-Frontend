import { Component, Input, HostListener, OnChanges } from '@angular/core';
import { MapSettingsTypes } from '@data/map-settings';
import { Position } from '@data/generic.types';

import Map from 'ol/Map';

@Component({
  selector: 'map-locations-panel',
  templateUrl: './map-locations-panel.component.html',
  styleUrls: ['./map-locations-panel.component.scss']
})
export class MapLocationsPanelComponent implements OnChanges {
  @Input() mapLocations: ReadonlyArray<MapSettingsTypes.MapLocation>;
  @Input() centerMapOnPosition: (position: Position, center: number) => void;
  @Input() saveMapLocation: (key: number, mapLocation: MapSettingsTypes.MapLocation, save?: boolean) => void;
  @Input() deleteMapLocation: (key: number) => void;


  public locationKeys = [];
  public editName: { [key: string]: boolean } = {};
  public locationNames: { [key: string]: string } = {};

  ngOnChanges() {
    this.locationKeys = Object.keys(this.mapLocations);
  }

  toggleEditName(locationKey: number) {
    if(this.editName[locationKey] === true) {
      this.saveMapLocation(locationKey, {
        ...this.mapLocations[locationKey],
        name: this.locationNames[locationKey]
      }, true);
    } else {
      this.locationNames[locationKey] = this.mapLocations[locationKey].name;
    }
    this.editName[locationKey] = !this.editName[locationKey];
  }

  deleteMapLocationLocal(locationKey: string) {
    this.deleteMapLocation(parseInt(locationKey, 10));
  }

  setLocation(key) {
    if (typeof this.mapLocations[key] !== 'undefined') {
      this.centerMapOnPosition(this.mapLocations[key].center, this.mapLocations[key].zoom);
    }
  }
}
