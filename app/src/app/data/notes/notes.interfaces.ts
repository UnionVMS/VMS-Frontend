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

/*

activityCode: "1"
assetId: "62dcea5d-350a-49cf-a40f-ef9a36a5b8fa"
contact: null
date: "2019-10-15T11:28:50.891Z"
document: null
id: "e13d464b-4f06-4b30-b21d-d739627ae265"
licenseHolder: null
notes: "apa"
readyDate: null
sheetNumber: null
source: null
updateTime: "2019-10-15T11:28:50.73Z"
updatedBy: "vms_admin_se"
user: null



id: string; //uuid
  activitycode: string; // 255
  assetId: string; //uuid
  contact: string; // 255
  date: string; // timestamp with timezone
  document: string; // 255
  licenseholder: string; // 255
  notes: string; // 255
  readydate: string; // timestamp with timezone
  sheetnumber: string; // 255
  source: string; // 255
  updatetime: string;
  updatedby: string // 60
  noteuser: string; // 255
*/