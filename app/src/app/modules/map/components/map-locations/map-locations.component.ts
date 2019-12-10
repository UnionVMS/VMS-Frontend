import { Component, Input, HostListener, OnChanges } from '@angular/core';
import { MapSettingsInterfaces } from '@data/map-settings';
import { toPng } from 'html-to-image';

@Component({
  selector: 'map-locations',
  templateUrl: './map-locations.component.html',
  styleUrls: ['./map-locations.component.scss']
})
export class MapLocationsComponent implements OnChanges {
  @Input() mapLocations: ReadonlyArray<MapSettingsInterfaces.MapLocation>;
  @Input() centerMapOnPosition: (position: Position, center: number) => void;
  @Input() map;
  @Input() saveMapLocation: (key: number, mapLocation: MapSettingsInterfaces.MapLocation) => void;
  @Input() menuActive: boolean;


  public locationKeys = [];
  public imageUrls = {};

  ngOnChanges() {
    this.locationKeys = Object.keys(this.mapLocations);
  }


  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if(event.altKey) {
      // @ts-ignore
      if(!isNaN(event.key)) {
        const view = this.map.getView();
        const zoom = view.getZoom();
        const center = view.getCenter();
        const exportOptions = {
          filter: (element) => {
            return element.className ? element.className.indexOf('ol-control') === -1 : true;
          }
        };

        this.map.once('rendercomplete', () => {
          toPng(this.map.getTargetElement(), exportOptions)
            .then((dataURL) => {
              this.imageUrls[event.key] = dataURL;
              // document.body.appendChild(image);
            });
        });
        this.saveMapLocation(parseInt(event.key, 10), {zoom, center});
      }
    } else {
      this.setLocation(event.key);
    }
  }

  setLocation(key) {
    if (typeof this.mapLocations[key] !== 'undefined') {
      const view = this.map.getView();
      view.setZoom(this.mapLocations[key].zoom);
      view.setCenter(this.mapLocations[key].center);
    }
  }
}
