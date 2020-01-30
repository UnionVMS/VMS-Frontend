import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Overlay from 'ol/Overlay';

@Component({
  selector: 'map-coordinates-popup',
  templateUrl: './coordinates-popup.component.html',
  styleUrls: ['./coordinates-popup.component.scss']
})
export class CoordinatesPopupComponent implements AfterViewInit {

  @ViewChild('overlayElement') overlayElement: ElementRef;

  @Input() popupInfo: Readonly<{
    id: string;
    baseCoordinates: ReadonlyArray<number>,
    coordinates: Readonly<{
      readonly [format: string]: string
    }>;
  }>;
  @Input() addOverlay: (id: string, element: HTMLElement, coordinates: ReadonlyArray<number>) => void;
  @Input() removeOverlay: (id: string) => void;

  public closeCoordinatesPopup = () => {
    this.removeOverlay(this.popupInfo.id);
  }

  ngAfterViewInit() {
    this.addOverlay(this.popupInfo.id, this.overlayElement.nativeElement, this.popupInfo.baseCoordinates);
  }
}
