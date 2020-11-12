import { Component, Input, HostListener, OnChanges } from '@angular/core';
import { MapSettingsTypes } from '@data/map-settings';
import { Position } from '@data/generic.types';

import Map from 'ol/Map';
import { toLonLat } from 'ol/proj';

@Component({
  selector: 'map-locations',
  template: '',
})
export class MapLocationsComponent {
  @Input() mapLocations: ReadonlyArray<MapSettingsTypes.MapLocation>;
  @Input() centerMapOnPosition: (position: Position, center: number) => void;
  @Input() map: Map;
  @Input() saveMapLocation: (key: number, mapLocation: MapSettingsTypes.MapLocation, save?: boolean) => void;

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    // @ts-ignore
    if(event.target.tagName === 'BODY') {
      if(event.altKey) {
        // @ts-ignore
        if(!isNaN(event.key)) {
          const view = this.map.getView();
          const zoom = view.getZoom();
          const [ longitude, latitude ] = toLonLat(view.getCenter());
          const center: Position = { longitude, latitude};
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
  }

  setLocation(key) {
    if (typeof this.mapLocations[key] !== 'undefined') {
      this.centerMapOnPosition(this.mapLocations[key].center, this.mapLocations[key].zoom);
    }
  }
}
