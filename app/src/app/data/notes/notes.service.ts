import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotesTypes } from '@data/notes';

import { getDefaultHttpOptions } from '@app/helpers/api-request';

@Injectable({
  providedIn: 'root'
})

export class NotesService {
  constructor(private readonly http: HttpClient) {}

  getNotesFromAssetId(authToken: string, assetId: string) {
    return this.http.get(
      environment.baseApiUrl + `asset/rest/asset/${ assetId }/notes`,
      getDefaultHttpOptions(authToken)
    );
  }

  createNote(authToken: string, note: NotesTypes.Note) {
    return this.http.post(
      environment.baseApiUrl + `asset/rest/asset/notes`,
      note,
      getDefaultHttpOptions(authToken)
    );
  }

  updateNote(authToken: string, note: NotesTypes.Note) {
    return this.http.put(
      environment.baseApiUrl + `asset/rest/asset/notes`,
      note,
      getDefaultHttpOptions(authToken)
    );
  }

  deleteNote(authToken: string, noteId: string) {
    return this.http.delete(
      environment.baseApiUrl + `asset/rest/asset/notes/${noteId}`,
      getDefaultHttpOptions(authToken)
    );
  }

  getNoteById(authToken: string, noteId: string) {
    return this.http.get(
      environment.baseApiUrl + `asset/rest/asset/note/${ noteId }`,
      getDefaultHttpOptions(authToken)
    );
  }


}
