import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssetReducer, AssetActions, AssetSelectors, AssetInterfaces } from '@data/asset';
import { intToRGB, hashCode, destinationPoint } from '@app/helpers';

import Map from 'ol/Map';
import { Style, Icon } from 'ol/style.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';

@Component({
  selector: 'map-asset-forecast',
  template: '',
})
export class AssetForecastComponent implements OnInit, OnDestroy, OnChanges {

  @Input() assetMovements: Array<AssetInterfaces.AssetMovement>;
  @Input() map: Map;
  @Input() forecastInterval: number;

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private layerTitle = 'Asset Destinations Layer';
  private renderedAssetIds: Array<string> = [];

  ngOnInit() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      title: this.layerTitle,
      source: this.vectorSource,
      renderBuffer: 200
    });
    this.map.addLayer(this.vectorLayer);
    Object.keys(this.assetMovements).map(assetId => {
      this.renderedAssetIds.push(assetId);
      this.drawFuturePosition(this.assetMovements[assetId]);
    });
    this.vectorLayer.getSource().changed();
    this.vectorLayer.getSource().refresh();
  }

  ngOnChanges() {
    // ngOnChange runs before ngOnInit when component mounts, we don't want to run this code then, only on updates.
    if (typeof this.vectorSource !== 'undefined') {
      const newRenderedAssetIds = [];
      this.renderedAssetIds.map((assetId) => {
        if(!Object.keys(this.assetMovements).find((currentAssetId) => currentAssetId === assetId)) {
          this.removeForecast(assetId);
        } else {
          newRenderedAssetIds.push(assetId);
        }
      });
      Object.keys(this.assetMovements).map(assetId => {
        if(newRenderedAssetIds.indexOf(assetId) === -1) {
          newRenderedAssetIds.push(assetId);
        }
        this.drawFuturePosition(this.assetMovements[assetId]);
      });
      this.vectorLayer.getSource().changed();
      this.vectorLayer.getSource().refresh();
      this.renderedAssetIds = newRenderedAssetIds;
    }
  }

  ngOnDestroy() {
    this.map.removeLayer(this.vectorLayer);
  }

  removeForecast(assetId: string) {
    this.vectorSource.getFeatures().map((feature) => {
      if(feature.getId().includes(assetId)) {
        this.vectorSource.removeFeature(feature);
      }
    });
  }

  drawFuturePosition(asset: AssetInterfaces.AssetMovement) {
    const speed = asset.microMove.speed * 1852; // nautical miles/h to km/h
    const futureFeatures: Array<Feature> = [];
    const forecastInterval = this.forecastInterval === null ? 30 : this.forecastInterval;
    for (let i = 0; i < 2; i++) {
      const minutes = forecastInterval * (i + 1);
      const futurePosition = destinationPoint(
        asset.microMove.location.latitude,
        asset.microMove.location.longitude,
        speed,
        minutes,
        asset.microMove.heading
      );
      const position = new Point(fromLonLat( [futurePosition[1], futurePosition[0]] ));
      const id = 'futurePos_' + i + '_' + asset.asset;
      const cachedFeature = this.vectorSource.getFeatureById(id);

      if (cachedFeature == null) {
        const futureFeature = new Feature(position);
        futureFeature.setStyle(new Style({
          image: new Icon({
            src: '/assets/angle_up.png',
            scale: 0.8,
            color: '#' + intToRGB(hashCode(asset.asset))
          })
        }));
        futureFeature.setId(id);
        this.vectorSource.addFeature(futureFeature);
        futureFeatures[i] = futureFeature;
      } else {
        cachedFeature.setGeometry(position);
        futureFeatures[i] = cachedFeature;
      }
    }

    const dx = futureFeatures[1].getGeometry().getCoordinates()[1] - futureFeatures[0].getGeometry().getCoordinates()[1];
    const dy = futureFeatures[1].getGeometry().getCoordinates()[0] - futureFeatures[0].getGeometry().getCoordinates()[0];
    const rot = Math.atan2(dy, dx);
    futureFeatures[0].getStyle().getImage().setRotation(rot);
    futureFeatures[1].getStyle().getImage().setRotation(rot);
  }
}
