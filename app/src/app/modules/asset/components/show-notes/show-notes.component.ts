import { Component, Input } from '@angular/core';
import { AssetInterfaces } from '@data/asset';
import { NotesInterfaces } from '@data/notes';

@Component({
  selector: 'asset-show-notes',
  templateUrl: './show-notes.component.html',
  styleUrls: ['./show-notes.component.scss']
})
export class ShowNotesComponent {
  @Input() asset: AssetInterfaces.Asset;
  @Input() notes: Array<NotesInterfaces.Note>;

}
