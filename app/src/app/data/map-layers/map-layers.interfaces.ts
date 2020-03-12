export interface MapLayer {
  areaTypeDesc: string;
  geoName: string;
  serviceType: string;
  style: string;
  typeName: string;
  cqlFilter?: string;
}

export interface State {
  mapLayers: Array<MapLayer>;
  activeLayers: Array<string>;
}
