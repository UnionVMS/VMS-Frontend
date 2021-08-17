import { Component, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { truncFloat } from '@app/helpers/float';
import { convertDDToDDM, convertDDToDMS } from '@app/helpers/wgs84-formatter';
import { toLonLat, transform } from 'ol/proj';

type CoordinatePopupObject = Readonly<{
  id: string;
  baseCoordinates: ReadonlyArray<number>,
  coordinates: Readonly<{
    readonly [format: string]: string
  }>;
}>;

type MarkerObject = {
  id: string,
  baseCoordinates: ReadonlyArray<number>,
  coordinates: string;
  name: string;
};

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

  public markerPopups: ReadonlyArray<MarkerObject> = [];
  public markerPopupsIndex = 0;

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

    const dd = truncFloat(baseLatitude, 7) + ', ' + truncFloat(baseLongitude, 7);
    const ddm = convertDDToDDM(baseLatitude, baseLongitude, 5);
    const dms = convertDDToDMS(baseLatitude, baseLongitude, 2);

    const sweref99 = transform(this.currentPosition, 'EPSG:3857', 'EPSG:3006');

    const rt90 = transform(this.currentPosition, 'EPSG:3857', 'EPSG:3021');

    this.coordinatePopups = [ ...this.coordinatePopups,
      {
        id,
        baseCoordinates: this.currentPosition,
        coordinates: {
          'WGS84 DD': dd,
          'WGS84 DMS': dms.latitude + ', ' + dms.longitude,
          'WGS84 DDM': ddm.latitude + ', ' + ddm.longitude,
          RT90: truncFloat(rt90[1], 3) + ', ' + truncFloat(rt90[0], 3),
          SWEREF99: truncFloat(sweref99[1], 3) + ', ' + truncFloat(sweref99[0], 3)
        }
      }
    ];
  }

  public addPositionMarker = () => {
    this.closePopup();
    const [ baseLongitude, baseLatitude ] = toLonLat(this.currentPosition);
    const dms = convertDDToDMS(baseLatitude, baseLongitude, 2);
    const id = '' + this.markerPopupsIndex++;
    this.markerPopups = [ ...this.markerPopups,
      {
        id,
        baseCoordinates: this.currentPosition,
        coordinates:  dms.latitude + ', ' + dms.longitude,
        name: 'Mark '+(parseInt(id) +1)
      }
    ];
   
  }

  public coordinatePopupsTrackByFunction = (index: number, obj: CoordinatePopupObject) => {
    return obj.id;
  }

  public markerPopupsTrackByFunction = (index: number, obj: MarkerObject) => {
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
