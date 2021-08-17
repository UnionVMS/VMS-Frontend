import { Component, Input, ViewChild, ElementRef, AfterViewInit} from '@angular/core';

@Component({
  selector: 'marker-on-map',
  templateUrl: './place-marker-on-map-popup.component.html',
  styleUrls: ['./place-marker-on-map-popup.component.scss']
})
export class PlaceMarkerComponent implements AfterViewInit{

  @ViewChild('overlayElement') overlayElement: ElementRef;

  @Input() markerInfo: {
    id: string,
    baseCoordinates: ReadonlyArray<number>,
    coordinates: string,
    name: string
  };
  @Input() addOverlay: (id: string, element: HTMLElement, coordinates: ReadonlyArray<number>) => void;
  @Input() removeOverlay: (id: string) => void;

  public currentlyActive = false;
  public currentlyActiveOverlayPopup;
  public tempNameChangeValue;
  
  public closePlaceMarkerPopup = () => {
    this.closePopup();
    this.removeOverlay(this.markerInfo.id);
  }

  public closePopup = () => {
    setTimeout(()=>{ this.currentlyActive = false; }, 10);
  }

  public getMarkerNumber() {
    this.currentlyActiveOverlayPopup = this.getPopupMarkerNumber();
  }
  public getPopupMarkerNumber() {
    return '' + (parseInt(this.markerInfo.id) +1)
  }

  public clickTheMark = () => {
    if(!this.currentlyActive){
      setTimeout(()=>{ this.currentlyActive = true; }, 10);
      this.getMarkerNumber();
    }
  }

  public addName(event) {
    this.markerInfo.name =  event.target.value;
    event.target.value="";
  }

  ngAfterViewInit() {
    this.addOverlay(this.markerInfo.id, this.overlayElement.nativeElement, this.markerInfo.baseCoordinates);
  }
}
