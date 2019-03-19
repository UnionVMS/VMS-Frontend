import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';

@Component({
  selector: 'map-settings',
  templateUrl: './map-settings.component.html',
  styleUrls: ['./map-settings.component.scss']
})
export class MapSettingsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() mapSettings;
  @Input() setVisibilityForAssetNames;
  @Input() setVisibilityForAssetSpeeds;

  private hidePanel = false;

  ngOnInit() {
  }

  ngOnChanges() {
  }

  ngOnDestroy() {
  }

  toggleNames() {
    this.setVisibilityForAssetNames(!this.mapSettings.namesVisible);
  }
  toggleSpeeds() {
    this.setVisibilityForAssetSpeeds(!this.mapSettings.speedsVisible);
  }
}
