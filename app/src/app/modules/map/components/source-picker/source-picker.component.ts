import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';

@Component({
  selector: 'map-source-picker',
  templateUrl: './source-picker.component.html',
  styleUrls: ['./source-picker.component.scss']
})
export class SourcePickerComponent {

  @Input() menuActive: boolean;
  @Input() setSourceFunction: (movementSources: ReadonlyArray<string>) => void;
  @Input() movementSources: ReadonlyArray<string>;
  @Input() choosenMovementSources: ReadonlyArray<string>;

  toggleMovementSource(movementSource: string) {
    if(this.choosenMovementSources.includes(movementSource)) {
      this.setSourceFunction(this.choosenMovementSources.filter(choosenMovementSource => choosenMovementSource !== movementSource));
    } else {
      this.setSourceFunction([ ...this.choosenMovementSources, movementSource ]);
    }
  }
}
