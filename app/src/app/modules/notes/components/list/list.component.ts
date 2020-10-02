import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { first } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

import { NotesActions, NotesTypes, NotesSelectors } from '@data/notes';
import { formatUnixtime } from '@app/helpers/datetime-formatter';
import { DeleteNoteDialogDialogComponent } from '@modules/notes/components/delete-note-dialog/delete-note-dialog.component';

type FormattedNote = NotesTypes.Note & { createdOnFormatted: string };

@Component({
  selector: 'notes-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListComponent implements OnChanges {

  @Input() notes: ReadonlyArray<NotesTypes.Note>;
  @Input() save: (note: NotesTypes.Note) => void;
  @Input() userTimezone: string;
  @Input() username: string;
  @Input() deleteNote: (noteId: string) => void;

  public formattedNotes: ReadonlyArray<{
    note: FormattedNote,
    searchableString: string
  }>;

  public searchString = '';
  public filteredNotes: ReadonlyArray<FormattedNote>;
  public notesInEditMode = [];

  constructor(public dialog: MatDialog) { }

  ngOnChanges() {
    this.formattedNotes = this.notes.map(note => ({
      ...note,
      createdOnFormatted: formatUnixtime(note.createdOn)
    })).map(note => {
      return {
        note,
        searchableString: note.createdBy + ' ' + note.createdOnFormatted + ' ' + note.note
      };
    }).sort((a, b) => {
      return b.note.createdOn - a.note.createdOn;
    });
    this.filteredNotes = this.formattedNotes
      .filter(note => note.searchableString.indexOf(this.searchString) !== -1)
      .map(note => note.note);
  }

  searchNotes(searchString: string) {
    this.filteredNotes = this.formattedNotes
      .filter(note => note.searchableString.indexOf(searchString) !== -1)
      .map(note => note.note);
  }

  public updateNote = (note: NotesTypes.Note) => {
    this.cancelEditNote(note.id)();
    this.save(note);
  }

  public editNote = (noteId: string) => {
    if(!this.notesInEditMode.includes(noteId)) {
      this.notesInEditMode = [ ...this.notesInEditMode, noteId ];
    }
  }

  public cancelEditNote = (noteId: string) => () => {
    if(this.notesInEditMode.includes(noteId)) {
      this.notesInEditMode = this.notesInEditMode.filter((iNoteId) => iNoteId !== noteId);
    }
  }

  public trackByNoteId = (index: number, note: FormattedNote) => {
    return note.id;
  }

  openDeleteDialog(note: FormattedNote): void {
    const dialogRef = this.dialog.open(DeleteNoteDialogDialogComponent, {
      data: {
        username: this.username,
        timestamp: note.createdOnFormatted,
        userTimezone: this.userTimezone,
      }
    });

    dialogRef.afterClosed().pipe(first()).subscribe(result => {
      if(result === true) {
        this.deleteNote(note.id);
      }
    });
  }
}
