import { Component, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { truncFloat } from '@app/helpers/float';
import { toLonLat, transform } from 'ol/proj';
import { get as getProjection } from 'ol/proj';

type CoordinatePopupObject = Readonly<{
  id: string;
  baseCoordinates: ReadonlyArray<number>,
  coordinates: Readonly<{
    readonly [format: string]: string
  }>;
}>;

@Component({
  selector: 'map-right-click-menu',
  templateUrl: './right-click-menu.component.html',
    styleUrls: ['./right-click-menu.component.scss']
})
export class RightClickMenuComponent implements OnInit, OnDestroy {

  @Input() map;
  @Input() addOverlay: (id: string, element: HTMLElement, coordinates: ReadonlyArray<number>) => void;
  @Input() moveOverlay: (id: string, coordinates: Array<number>) => void;
  @Input() removeOverlay: (id: string) => void;
  @Input() registerOnClickFunction: (name: string, clickFunction: (event) => void) => void;
  @Input() unregisterOnClickFunction: (name: string) => void;

  private currentlyActive = false;
  private currentPosition: ReadonlyArray<number>;
  private contextMenuFunction: (event: MouseEvent) => void;

  public coordinatePopups: ReadonlyArray<CoordinatePopupObject> = [];
  public coordinatePopupsIndex = 0;

  public closePopup = () => {
    this.currentlyActive = false;
    const id = 'right-click-popup';
    const element = document.getElementById(id);
    element.classList.remove('active');
    this.elementRef.nativeElement.appendChild(element);
    this.removeOverlay(id);
  }

  public createCoordinatesPopup = () => {
    this.closePopup();
    const id = 'coordinates-popups-' + this.coordinatePopupsIndex++;
    const [ baseLongitude, baseLatitude ] = toLonLat(this.currentPosition);
    const dd = baseLatitude.toFixed(7) + ', ' + baseLongitude.toFixed(7);

    const verticalDirection = (baseLatitude > 0 ? 'N' : 'S');
    const horizontalDirection = (baseLongitude > 0 ? 'E' : 'W');

    const latitude = Math.abs(baseLatitude);
    const longitude = Math.abs(baseLongitude);

    const longitudeMinute = 60 * (longitude % 1);
    const latitudeMinute = 60 * (longitude % 1);

    const ddm =
       verticalDirection + truncFloat(latitude, 0) + '° ' + truncFloat(latitudeMinute, 5) + '\' , ' +
       horizontalDirection + truncFloat(longitude, 0) + '° ' + truncFloat(longitudeMinute, 5) + '\'';

    const longitudeSecond = 60 * (longitudeMinute % 1);
    const latitudeSecond = 60 * (latitudeMinute % 1);

    const dms =
      verticalDirection + truncFloat(latitude, 0) + '° ' + truncFloat(latitudeMinute, 0) + '\' ' + truncFloat(latitudeSecond, 2) + '", ' +
      horizontalDirection + truncFloat(longitude, 0) + '° ' + truncFloat(longitudeMinute, 0) + '\' ' + truncFloat(longitudeSecond, 2) + '"';

    const sweref99 = transform(this.currentPosition, 'EPSG:3857', 'EPSG:3006');

    const rt90 = transform(this.currentPosition, 'EPSG:3857', 'EPSG:3021');

    this.coordinatePopups = [ ...this.coordinatePopups,
      {
        id,
        baseCoordinates: this.currentPosition,
        coordinates: {
          'WGS84 DD': dd,
          'WGS84 DMS': dms,
          'WGS84 DDM': ddm,
          RT90: truncFloat(rt90[1], 3) + ', ' + truncFloat(rt90[0], 3),
          SWEREF99: truncFloat(sweref99[1], 3) + ', ' + truncFloat(sweref99[0], 3)
        }
      }
    ];
  }

  public coordinatePopupsTrackByFunction = (index: number, obj: CoordinatePopupObject) => {
    return obj.id;
  }

  constructor(private readonly elementRef: ElementRef) {}

  ngOnInit() {
    this.contextMenuFunction = (event: MouseEvent) => {
      event.preventDefault();

      // const features = this.map.getFeaturesAtPixel([event.x, event.y]);
      // console.warn(event, features, this.map.getEventCoordinate(event));
      const coordinates = this.map.getEventCoordinate(event);
      this.currentPosition = coordinates;
      const id = 'right-click-popup';

      if(this.currentlyActive) {
        this.moveOverlay(id, coordinates);
        return;
      }

      const element = document.getElementById(id);
      element.classList.add('active');
      this.addOverlay(id, element, coordinates);
      this.currentlyActive = true;
    };
    this.map.getViewport().addEventListener('contextmenu', this.contextMenuFunction);

    this.registerOnClickFunction('right-click-menu-close-popup', (event) => {
      if(this.currentlyActive) {
        this.closePopup();
      }
    });
  }

  ngOnDestroy() {
    this.map.getViewport().removeEventListener('contextmenu', this.contextMenuFunction);
    this.unregisterOnClickFunction('right-click-menu-close-popup');
  }
}
