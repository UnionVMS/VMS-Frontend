export type Note = Readonly<{
  id: string;
  assetId: string;
  note: string;
  createdOn: number;
  createdBy: string;
}>;

export type NoteParameters = Readonly<{
  assetId: string;
  note: string;
}>;

export type State = Readonly<{
  notes: Readonly<{ readonly [id: string]: Note }>;
}>;
