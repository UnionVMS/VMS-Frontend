import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';
import { deg2rad, intToRGB, hashCode } from '@app/helpers';

import Map from 'ol/Map';
import { Fill, Stroke, Style, Icon, Text } from 'ol/style.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import Select from 'ol/interaction/Select.js';

@Component({
  selector: 'map-assets',
  template: '',
})
export class AssetsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() assets: Array<AssetInterfaces.Asset>;
  @Input() map: Map;
  @Input() namesVisible: boolean;
  @Input() speedsVisible: boolean;
  // tslint:disable:ban-types
  @Input() selectAsset: Function;
  @Input() registerOnClickFunction: Function;
  @Input() unregisterOnClickFunction: Function;
  // tslint:enable:ban-types

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private layerTitle = 'Asset Layer';
  private namesWereVisibleLastRerender: boolean;
  private speedsWereVisibleLastRerender: boolean;
  private selection: Select;
  private assetSpeedsPreviouslyRendered: { [key: string]: string } = {};
  private renderedAssetIds: Array<string> = [];

  ngOnInit() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      title: this.layerTitle,
      source: this.vectorSource,
      renderBuffer: 200
    });
    this.map.addLayer(this.vectorLayer);
    this.registerOnClickFunction(this.layerTitle, (event) => {
      if (
        typeof event.selected[0] !== 'undefined' &&
        this.vectorSource.getFeatureById(event.selected[0].id_) !== null
      ) {
        this.selectAsset(event.selected[0].id_);
      }
    });

    this.vectorSource.addFeatures(this.assets.map((asset) => {
      this.renderedAssetIds.push(asset.asset);
      return this.createFeatureFromAsset(asset);
    }));

    this.vectorLayer.getSource().changed();
    this.vectorLayer.getSource().refresh();
  }

  ngOnChanges() {
    // ngOnChange runs before ngOnInit when component mounts, we don't want to run this code then, only on updates.
    if (typeof this.vectorSource !== 'undefined') {
      const newRenderedAssetIds = [];
      this.renderedAssetIds.map((assetId) => {
        if(!this.assets.find((asset) => asset.asset === assetId)) {
          this.removeAsset(assetId);
        } else {
          newRenderedAssetIds.push(assetId);
        }
      });
      this.vectorSource.addFeatures(
        this.assets.reduce((acc, asset) => {
          if(newRenderedAssetIds.indexOf(asset.asset) === -1) {
            newRenderedAssetIds.push(asset.asset);
          }
          const assetFeature = this.vectorSource.getFeatureById(asset.asset);
          if (assetFeature !== null) {
            this.updateFeatureFromAsset(assetFeature, asset);
          } else {
            acc.push(this.createFeatureFromAsset(asset));
          }
          return acc;
        }, [])
      );
      this.vectorLayer.getSource().changed();
      this.vectorLayer.getSource().refresh();
      this.namesWereVisibleLastRerender = this.namesVisible;
      this.speedsWereVisibleLastRerender = this.speedsVisible;
      this.renderedAssetIds = newRenderedAssetIds;
    }
  }

  ngOnDestroy() {
    this.unregisterOnClickFunction(this.layerTitle);
    this.map.removeLayer(this.vectorLayer);
  }

  removeAsset(assetId) {
    this.vectorSource.getFeatures().map((feature) => {
      if(feature.getId().includes(assetId)) {
        this.vectorSource.removeFeature(feature);
      }
    });
  }

  createFeatureFromAsset(asset: AssetInterfaces.Asset) {
    const assetFeature = new Feature(new Point(fromLonLat([
      asset.microMove.location.longitude, asset.microMove.location.latitude
    ])));

    const styleProperties: any = {
      image: new Icon({
        src: '/assets/arrow_640_rotated_4p.png',
        scale: 0.8,
        color: '#' + intToRGB(hashCode(asset.asset))
      })
    };
    if (this.namesVisible || this.speedsVisible) {
      styleProperties.text = this.getTextStyleForName(asset);
    }

    const assetStyle = new Style(styleProperties);

    assetFeature.setStyle(assetStyle);
    assetFeature.getStyle().getImage().setOpacity(1);
    assetFeature.getStyle().getImage().setRotation(deg2rad(asset.microMove.heading));
    assetFeature.setId(asset.asset);
    return assetFeature;
  }

  updateFeatureFromAsset(assetFeature: Feature, asset: AssetInterfaces.Asset) {
    assetFeature.setGeometry(new Point(fromLonLat([
      asset.microMove.location.longitude, asset.microMove.location.latitude
    ])));
    assetFeature.getStyle().getImage().setRotation(deg2rad(asset.microMove.heading));
    if (
      this.namesWereVisibleLastRerender !== this.namesVisible ||
      this.speedsWereVisibleLastRerender !== this.speedsVisible ||
      (this.speedsVisible && this.assetSpeedsPreviouslyRendered[asset.asset] !== asset.microMove.speed.toFixed(2))
    ) {
      if (this.namesVisible || this.speedsVisible) {
        assetFeature.getStyle().setText(this.getTextStyleForName(asset));
      } else {
        assetFeature.getStyle().setText(null);
      }
    }
    return assetFeature;
  }

  getTextStyleForName(asset: AssetInterfaces.Asset) {
    let text = null;
    let offsetY = 20;
    if (this.namesVisible) {
      text = asset.assetName;
    }
    if (this.speedsVisible) {
      if (text !== null) {
        text += '\n' + asset.microMove.speed.toFixed(2) + ' kts';
        offsetY = 30;
      } else {
        text = asset.microMove.speed.toFixed(2) + ' kts';
      }
      this.assetSpeedsPreviouslyRendered[asset.asset] = asset.microMove.speed.toFixed(2);
    }

    return new Text({
      font: '13px Calibri,sans-serif',
      fill: new Fill({ color: '#000' }),
      stroke: new Stroke({
        color: '#fff',
        width: 2
      }),
      offsetY,
      text
    });
  }

}
