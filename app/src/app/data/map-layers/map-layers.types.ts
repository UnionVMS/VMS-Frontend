export type MapLayer = Readonly<{
  areaTypeDesc: string;
  geoName: string;
  serviceType: string;
  style: string;
  typeName: string;
  cqlFilter?: string;
}>;

export type CascadedLayer = Readonly<{
  name: string;
  title: string;
  abstract: string;
}>;

export type State = Readonly<{
  mapLayers: Readonly<{ readonly [typeName: string]: MapLayer }>;
  cascadedLayers: Readonly<{ readonly [typeName: string]: CascadedLayer }>;
  activeLayers: ReadonlyArray<string>;
}>;
