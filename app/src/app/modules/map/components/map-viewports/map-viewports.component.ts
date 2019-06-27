import { Component, Input, HostListener, OnChanges } from '@angular/core';

@Component({
  selector: 'map-viewports',
  templateUrl: './map-viewports.component.html',
  styleUrls: ['./map-viewports.component.scss']
})

export class MapViewportsComponent implements OnChanges {
  @Input() mapSettings;
  @Input() map;
  @Input() saveViewport;

  public viewportKeys = [];

  ngOnChanges() {
    this.viewportKeys = Object.keys(this.mapSettings.viewports);
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if(event.altKey) {
      const view = this.map.getView();
      const zoom = view.getZoom();
      const center = view.getCenter();
      this.saveViewport(event.key, {zoom, center});
    } else {
      this.setViewport(event.key);
    }
  }

  setViewport(key) {
    if (typeof this.mapSettings.viewports[key] !== 'undefined') {
      const view = this.map.getView();
      view.setZoom(this.mapSettings.viewports[key].zoom);
      view.setCenter(this.mapSettings.viewports[key].center);
    }
  }
}
