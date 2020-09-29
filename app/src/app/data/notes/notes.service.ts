import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotesTypes } from '@data/notes';

@Injectable({
  providedIn: 'root'
})

export class NotesService {
  constructor(private readonly http: HttpClient) {}

  getNotesFromAssetId(authToken: string, assetId: string) {
    return this.http.get(
      environment.baseApiUrl + `asset/rest/asset/${ assetId }/notes`, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  createNote(authToken: string, note: NotesTypes.Note) {
    return this.http.post(
      environment.baseApiUrl + `asset/rest/asset/notes`,
      note,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  updateNote(authToken: string, note: NotesTypes.Note) {
    return this.http.put(
      environment.baseApiUrl + `asset/rest/asset/notes`,
      note,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  deleteNote(authToken: string, noteId: string) {
    return this.http.delete(
      environment.baseApiUrl + `asset/rest/asset/notes/${noteId}`,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  getNoteById(authToken: string, noteId: string) {
    return this.http.get(
      environment.baseApiUrl + `asset/rest/asset/note/${ noteId }`, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }


}
