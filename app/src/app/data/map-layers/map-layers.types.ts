export type MapLayer = Readonly<{
  areaTypeDesc: string;
  geoName: string;
  serviceType: string;
  style: string;
  typeName: string;
  cqlFilter?: string;
}>;

export type State = Readonly<{
  mapLayers: Readonly<{ readonly [typeName: string]: MapLayer }>;
  activeLayers: ReadonlyArray<string>;
}>;
