import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { MapLayersTypes } from '@data/map-layers';
import { environment } from '@src/environments/environment';

import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

@Component({
  selector: 'map-layers',
  template: '',
})
export class MapLayersComponent implements OnChanges, OnDestroy {

  @Input() map: Map;
  @Input() authToken: string;
  @Input() activeMapLayers: Array<string>;
  @Input() mapLayers: Array<MapLayersTypes.MapLayer>;
  @Input() menuActive: boolean;

  private readonly layers: { [layerName: string]: TileLayer} = {};

  ngOnChanges() {
    // Remove layers that are no longer active
    Object.keys(this.layers).map(layerName => {
      if(!this.activeMapLayers.includes(layerName)) {
        this.map.removeLayer(this.layers[layerName]);
        delete this.layers[layerName];
      }
    });

    // Add layers
    this.activeMapLayers.map((layerName) => {
      if(typeof this.layers[layerName] === 'undefined') {
        this.addTileLayer(layerName);
      }
    });
  }

  ngOnDestroy() {
    Object.keys(this.layers).map(layerName => {
      this.map.removeLayer(this.layers[layerName]);
      delete this.layers[layerName];
    });
  }

  addTileLayer(layerName: string) {
    const mapLayer = this.mapLayers.find((currentMapLayer) => currentMapLayer.typeName === layerName);

    const authToken = this.authToken;
    const customTileLoaderFunction = (imageTile, src) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', src, true);
      xhr.withCredentials = true;
      xhr.setRequestHeader('Authorization', authToken);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function() {
        const img = imageTile.getImage();
        img.crossOrigin = 'anonymous';
        if (typeof window.btoa === 'function') {
          if (this.status === 200) {
            const uInt8Array = new Uint8Array(this.response);
            let i = uInt8Array.length;
            const binaryString = new Array(i);
            while (i--) {
              binaryString[i] = String.fromCharCode(uInt8Array[i]);
            }
            const data = binaryString.join('');
            const type = xhr.getResponseHeader('content-type');
            if (type.indexOf('image') === 0) {
              img.src = 'data:' + type + ';base64,' + window.btoa(data);
            }
          }
        } else {
          img.src = src;
        }
      };
      xhr.onerror = () => {
        const img = imageTile.getImage();
        img.src = '';
      };
      xhr.send();
    };

    const layer = new TileLayer({
      zIndex: 5,
      source: new TileWMS({
        url: environment.baseGeoUrl + 'wms',
        params: {
          LAYERS: mapLayer.geoName,
          TILED: true,
          STYLES: mapLayer.style,
          cql_filter: mapLayer.cqlFilter
        },
        tileLoadFunction: customTileLoaderFunction,
        serverType: 'geoserver',
        // Countries have transparency, so do not fade tiles:
        transition: 0
      })
    });
    this.layers[layerName] = layer;
    this.map.addLayer(layer);
  }

}
