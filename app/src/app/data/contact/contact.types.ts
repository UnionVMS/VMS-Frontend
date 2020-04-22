export type Contact = Readonly<{
  assetId: string;
  assetUpdateTime: string;
  cityName: string;
  country: string;
  createTime: string;
  email: string;
  historyId: string;
  id: string;
  name: string;
  nationality: string;
  owner: boolean;
  phoneNumber: string;
  postOfficeBox: string;
  postalArea: string;
  source: string;
  streetName: string;
  type: string;
  updatedBy: string;
  zipCode: string;
}>;

export type State = Readonly<{
  contacts: Readonly<{ readonly [id: string]: Contact }>;
}>;
