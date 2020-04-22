import { Component, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
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
    const [ longitude, latitude ] = toLonLat(this.currentPosition);
    const dd = latitude.toFixed(7) + ', ' + longitude.toFixed(7);

    const longitudeMinute = 60 * (longitude % 1);
    const latitudeMinute = 60 * (longitude % 1);

    const ddm =
      'N' + latitude.toFixed(0) + '° ' + latitudeMinute.toFixed(5) + '\' , ' +
      'E' + longitude.toFixed(0) + '° ' + longitudeMinute.toFixed(5) + '\'';

    const longitudeSecond = 60 * (longitudeMinute % 1);
    const latitudeSecond = 60 * (latitudeMinute % 1);

    const dms =
      'N' + latitude.toFixed(0) + '° ' + latitudeMinute.toFixed(0) + '\' ' + latitudeSecond.toFixed(2) + '", ' +
      'E' + longitude.toFixed(0) + '° ' + longitudeMinute.toFixed(0) + '\' ' + longitudeSecond.toFixed(2) + '"';

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
          RT90: rt90[1].toFixed(3) + ', ' + rt90[0].toFixed(3),
          SWEREF99: sweref99[1].toFixed(3) + ', ' + sweref99[0].toFixed(3)
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
