import { Component, Input, HostListener, OnChanges } from '@angular/core';
import { MapSettingsTypes } from '@data/map-settings';
import { toPng } from 'html-to-image';

@Component({
  selector: 'map-locations',
  templateUrl: './map-locations.component.html',
  styleUrls: ['./map-locations.component.scss']
})
export class MapLocationsComponent implements OnChanges {
  @Input() mapLocations: ReadonlyArray<MapSettingsTypes.MapLocation>;
  @Input() centerMapOnPosition: (position: Position, center: number) => void;
  @Input() map;
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
          toPng(this.map.getTargetElement(), exportOptions)
            .then((dataURL) => {
              this.imageUrls[event.key] = dataURL;

              const reader = new FileReader();
              fetch(dataURL).then(res => res.blob()).then(baseImageBlob => {
                reader.readAsDataURL(baseImageBlob);
                reader.onload = loadEvent => {
                  const img = new Image();
                  img.src = loadEvent.target.result as string;
                  img.onload = () => {
                    const elem = document.createElement('canvas');
                    elem.width = 304;  // aspect ratio 21:9
                    elem.height = 130;
                    const ctx = elem.getContext('2d');
                    // img.width and img.height will contain the original dimensions
                    ctx.drawImage(img, 0, 0, elem.width, elem.height);
                    const base64Image = ctx.canvas.toDataURL();
                    this.imageUrls[event.key] = base64Image;
                    const locationName = this.mapLocations[event.key].name || name;
                    this.saveMapLocation(parseInt(event.key, 10), {
                      name: locationName, zoom, center, base64Image
                    }, true);
                  },
                  reader.onerror = error => console.error(error);
                };
              });
            });
        });
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
