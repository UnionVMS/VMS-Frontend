import { Component, Input, HostListener, OnChanges } from '@angular/core';
import { MapSettingsTypes } from '@data/map-settings';

import Map from 'ol/Map';

@Component({
  selector: 'map-locations',
  templateUrl: './map-locations.component.html',
  styleUrls: ['./map-locations.component.scss']
})
export class MapLocationsComponent implements OnChanges {
  @Input() mapLocations: ReadonlyArray<MapSettingsTypes.MapLocation>;
  @Input() centerMapOnPosition: (position: Position, center: number) => void;
  @Input() map: Map;
  @Input() saveMapLocation: (key: number, mapLocation: MapSettingsTypes.MapLocation, save?: boolean) => void;
  @Input() deleteMapLocation: (key: number) => void;


  public locationKeys = [];
  public imageUrls = {};
  public editName: { [key: string]: boolean } = {};
  public locationNames: { [key: string]: string } = {};

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

        const name = 'Saved location #' + event.key;

        this.map.once('rendercomplete', () => {
          const mapCanvas = document.createElement('canvas');
          // const size = this.map.getSize();
          // mapCanvas.width = size[0];
          // mapCanvas.height = size[1];
          mapCanvas.width = 304;  // aspect ratio 21:9
          mapCanvas.height = 130;
          const mapContext = mapCanvas.getContext('2d');
          Array.prototype.forEach.call(
            document.querySelectorAll('.ol-layer canvas'),
            (canvas) => {
              if (canvas.width > 0) {
                const opacity = canvas.parentNode.style.opacity;
                mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
                const transform = canvas.style.transform;
                // Get the transform parameters from the style's transform matrix
                const matrix = transform
                  .match(/^matrix\(([^\(]*)\)$/)[1]
                  .split(',')
                  .map(Number);
                // Apply the transform to the export map context
                CanvasRenderingContext2D.prototype.setTransform.apply(
                  mapContext,
                  matrix
                );
                mapContext.drawImage(canvas, 0, 0, mapCanvas.width, mapCanvas.height);
              }
            }
          );

          const base64Image = mapCanvas.toDataURL();
          this.imageUrls[event.key] = base64Image;
          const locationName = this.mapLocations[event.key].name || name;
          this.saveMapLocation(parseInt(event.key, 10), {
            name: locationName, zoom, center, base64Image
          }, true);
        });
        this.map.render();
        this.saveMapLocation(parseInt(event.key, 10), { name, zoom, center });
      }
    } else {
      this.setLocation(event.key);
    }
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
      const view = this.map.getView();
      view.setZoom(this.mapLocations[key].zoom);
      view.setCenter(this.mapLocations[key].center);
    }
  }
}
