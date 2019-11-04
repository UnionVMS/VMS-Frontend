export interface Note {
  activityCode: string;
  assetId: string;
  contact: string;
  date: string;
  document: string;
  id: string;
  licenseHolder: string;
  notes: string;
  readyDate: string;
  sheetNumber: string;
  source: string;
  updateTime: string;
  updatedBy: string;
  user: string;
}

export interface State {
  notes: { [id: string]: Note };
}
