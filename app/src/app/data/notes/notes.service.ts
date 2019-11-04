import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotesInterfaces } from '@data/notes';

@Injectable({
  providedIn: 'root'
})

export class NotesService {
  constructor(private http: HttpClient) {}

  getNotesFromAssetId(authToken: string, assetId: string) {
    return this.http.get(
      environment.baseApiUrl + `asset/rest/asset2/${ assetId }/notes`, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  createNote(authToken: string, note: NotesInterfaces.Note) {
    return this.http.post(
      environment.baseApiUrl + `asset/rest/asset2/notes`,
      note,
      {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }

  updateNote(authToken: string, note: NotesInterfaces.Note) {
    return this.http.put(
      environment.baseApiUrl + `asset/rest/asset2/notes`,
      note,
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
      environment.baseApiUrl + `asset/rest/asset2/note/${ noteId }`, {
        headers: new HttpHeaders({
          Authorization: authToken,
          'Cache-Control': 'no-cache'
        })
      }
    );
  }


}
