export interface Note {
  id: string;
  assetId: string;
  note: string;
  createdOn: string;
  createdBy: string;
}

export interface State {
  notes: { [id: string]: Note };
}
