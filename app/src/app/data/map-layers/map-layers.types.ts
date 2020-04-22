export type MapLayer = Readonly<{
  areaTypeDesc: string;
  geoName: string;
  serviceType: string;
  style: string;
  typeName: string;
  cqlFilter?: string;
}>;

export type State = Readonly<{
  mapLayers: ReadonlyArray<MapLayer>;
  activeLayers: ReadonlyArray<string>;
}>;
