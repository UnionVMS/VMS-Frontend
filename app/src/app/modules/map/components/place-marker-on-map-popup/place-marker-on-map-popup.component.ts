import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'marker-on-map',
  templateUrl: './place-marker-on-map-popup.component.html',
  styleUrls: ['./place-marker-on-map-popup.component.scss']
})
export class PlaceMarkerComponent implements AfterViewInit {

  @ViewChild('overlayElement') overlayElement: ElementRef;

  @Input() markerInfo: Readonly<{
    id: string,
    baseCoordinates: ReadonlyArray<number>,
    coordinates: string,
  }>;
  @Input() addOverlay: (id: string, element: HTMLElement, coordinates: ReadonlyArray<number>) => void;
  @Input() removeOverlay: (id: string) => void;

  public closePlaceMarkerPopup = () => {
    this.removeOverlay(this.markerInfo.id);
  }

  public getMarkerNumber() {
    return '' + (parseInt(this.markerInfo.id) +1)
  }

  ngAfterViewInit() {
    this.addOverlay(this.markerInfo.id, this.overlayElement.nativeElement, this.markerInfo.baseCoordinates);
  }
}
