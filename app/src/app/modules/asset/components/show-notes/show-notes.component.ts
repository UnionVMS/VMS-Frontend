import { Component, Input } from '@angular/core';
import { AssetTypes } from '@data/asset';
import { NotesTypes } from '@data/notes';

@Component({
  selector: 'asset-show-notes',
  templateUrl: './show-notes.component.html',
  styleUrls: ['./show-notes.component.scss']
})
export class ShowNotesComponent {
  @Input() asset: AssetTypes.Asset;
  @Input() notes: Array<NotesTypes.Note>;

}
