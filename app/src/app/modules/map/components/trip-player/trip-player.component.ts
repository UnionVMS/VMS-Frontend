import { Component, Input, OnDestroy } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { formatDate, formatTimestamp } from '@app/helpers/helpers';
import { AssetInterfaces } from '@data/asset';
import { Position } from '@data/generic.interfaces';


@Component({
  selector: 'map-trip-player',
  templateUrl: './trip-player.component.html',
  styleUrls: ['./trip-player.component.scss']
})
export class TripPlayerComponent implements OnDestroy {
  @Input() tripGranularity: number;
  @Input() tripTimestamps: ReadonlyArray<number>;
  @Input() tripTimestamp: number;
  @Input() setTripTimestamp: (assetTripTimestamp: number) => void;

  public currentStep = 1;
  private intervalId;
  public playSpeed = 1;

  changeTimestamp(event: MatSliderChange) {
    this.setTripTimestamp(this.tripTimestamps[event.value - 1]);
  }

  getCurrentTime() {
    return formatTimestamp(this.tripTimestamp);
  }

  getNumberOfTimestamps() {
    return this.tripTimestamps.length;
  }

  play() {
    this.intervalId = setInterval(() => {
      if(this.currentStep >= (this.tripTimestamps.length - 1)) {
        this.pause();
        return;
      }
      this.stepForward();
    }, 1000 * this.playSpeed);
  }

  pause() {
    clearInterval(this.intervalId);
    delete this.intervalId;
  }

  stepForward() {
    if(this.currentStep >= (this.tripTimestamps.length - 1)) {
      return;
    }
    this.currentStep++;
    this.changeTimestamp({value: this.currentStep} as MatSliderChange);
  }

  stepBackwards() {
    if(this.currentStep <= 1) {
      return;
    }
    this.currentStep--;
    this.changeTimestamp({value: this.currentStep} as MatSliderChange);
  }

  increaseSpeed() {
    this.playSpeed = this.playSpeed / 2;
    if(this.intervalId) {
      this.pause();
      this.play();
    }
  }
  decreaseSpeed() {
    this.playSpeed = this.playSpeed * 2;
    if(this.intervalId) {
      this.pause();
      this.play();
    }
  }

  ngOnDestroy() {
    this.pause();
  }
}
