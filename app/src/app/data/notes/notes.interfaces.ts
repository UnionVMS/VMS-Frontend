export interface Note {
  id: string;
  assetId: string;
  note: string;
  createdOn: number;
  createdBy: string;
}

export interface State {
  notes: { [id: string]: Note };
}
