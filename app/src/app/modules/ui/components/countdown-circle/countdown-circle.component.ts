import { Component, Input, OnChanges } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { take, map, finalize } from 'rxjs/operators';

@Component({
   selector: 'ui-countdown-circle',
   templateUrl: './countdown-circle.component.html',
   styleUrls: ['./countdown-circle.component.scss']
})

export class CountdownCircleComponent implements OnChanges {
  @Input() seconds: number;
  @Input() diameter: number;
  @Input() color?: string;

  public secondsLeft: number;
  public progress: number;

  ngOnChanges() {
    this.secondsLeft = this.seconds;
    interval(100).pipe(take(this.seconds * 10)).subscribe((progress) => {
      this.progress = 100 - (((progress / 10) / this.seconds) * 100);
      if(progress !== 0 && progress % 10 === 0) {
        --this.secondsLeft;
      }
    });
  }
}
