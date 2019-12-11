import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'ui-truncated-text',
  templateUrl: './truncated-text.component.html'
})
export class TruncatedTextComponent implements OnChanges {
  @Input() text: string;
  @Input() length: number;

  public truncatedText = '';

  ngOnChanges() {
    if(this.text.length > this.length) {
      this.truncatedText = this.text.substring(0, this.length) + '...';
    } else {
      this.truncatedText = this.text;
    }
  }
}
