import { Component, Input } from '@angular/core';

import { NotesTypes } from '@data/notes';


@Component({
  selector: 'map-incident-log-entry-note',
  templateUrl: './incident-log-entry-note.component.html',
  styleUrls: ['./incident-log-entry-note.component.scss']
})
export class IncidentLogEntryNoteComponent {
  @Input() note: NotesTypes.Note;
}
