import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* Modules */
import { RouterModule } from '@angular/router';
import { UIModule } from '../ui/ui.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';


/* Pages */
import { FormPageComponent } from './pages/form/form.component';
import { NotesListComponent } from './pages/list/list.component';

/* Components */
import { FormComponent } from './components/form/form.component';
import { DeleteNoteDialogDialogComponent } from './components/delete-note-dialog/delete-note-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    UIModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatMenuModule,
    MatRippleModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    FormPageComponent,
    NotesListComponent,
    FormComponent,
    DeleteNoteDialogDialogComponent,
  ]
})

export class NotesModule { }
