import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';
import { deg2rad, intToRGB, hashCode } from '@app/helpers';
import { environment } from '@src/environments/environment';

import Map from 'ol/Map';
import { Stroke, Style, Icon, Fill, Text } from 'ol/style.js';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import { LineString, Point } from 'ol/geom';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import Collection from 'ol/Collection';

@Component({
  selector: 'map-areas',
  template: '',
})
export class AreasComponent implements OnInit {

  @Input() map: Map;
  @Input() authToken: string;

  private source: TileWMS;
  private layer: TileLayer;
  private layerTitle = 'Tracks Layer';

  ngOnInit() {
    // const def = {
    //   areaTypeDesc: 'User Areas',
    //   geoName: 'uvms:userareas',
    //   serviceType: 'WMS',
    //   style: 'userareas_label_geom',
    //   typeName: 'USERAREA', // AREAGROUPS
    // };

    const def = {
      areaTypeDesc: 'Exclusive Economic Zone',
      geoName: "uvms:eez",
      serviceType: "WMS",
      style: "eez_label_geom",
      typeName: "EEZ"
    };

    const authToken = this.authToken;
    const customTileLoaderFunction = (imageTile, src) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', src, true);
      xhr.withCredentials = true;
      xhr.setRequestHeader('Authorization', authToken);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function() {
        const img = imageTile.getImage();
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

    const test = new TileLayer({
      source: new TileWMS({
        url: environment.baseGeoUrl + 'wms',
        params: {
          LAYERS: 'uvms:eez',
          TILED: true,
          STYLE: 'eez_label_geom',
          // cql_filter: cql
        },
        tileLoadFunction: customTileLoaderFunction,
        serverType: 'geoserver',
        // Countries have transparency, so do not fade tiles:
        transition: 0
      })
    });

    this.map.addLayer(test);
  }
}
