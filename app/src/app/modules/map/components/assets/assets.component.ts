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

  @Input() assets: Array<AssetInterfaces.AssetMovementWithEssentials>;
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
      this.renderedAssetIds.push(asset.assetMovement.asset);
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
        if(!this.assets.find((asset) => asset.assetMovement.asset === assetId)) {
          this.removeAsset(assetId);
        } else {
          newRenderedAssetIds.push(assetId);
        }
      });
      this.vectorSource.addFeatures(
        this.assets.reduce((acc, asset) => {
          if(newRenderedAssetIds.indexOf(asset.assetMovement.asset) === -1) {
            newRenderedAssetIds.push(asset.assetMovement.asset);
          }
          const assetFeature = this.vectorSource.getFeatureById(asset.assetMovement.asset);
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

  createFeatureFromAsset(asset: AssetInterfaces.AssetMovementWithEssentials) {
    const assetMovement = asset.assetMovement;
    const assetEssentials = asset.assetEssentials;
    const assetFeature = new Feature(new Point(fromLonLat([
      assetMovement.microMove.location.longitude, assetMovement.microMove.location.latitude
    ])));

    const styleProperties: any = {
      image: new Icon({
        src: '/assets/arrow_640_rotated_4p.png',
        scale: 0.8,
        color: '#' + intToRGB(hashCode(assetMovement.asset))
      })
    };
    if (this.namesVisible || this.speedsVisible) {
      styleProperties.text = this.getTextStyleForName(asset);
    }

    const assetStyle = new Style(styleProperties);

    assetFeature.setStyle(assetStyle);
    assetFeature.getStyle().getImage().setOpacity(1);
    assetFeature.getStyle().getImage().setRotation(deg2rad(assetMovement.microMove.heading));
    assetFeature.setId(assetMovement.asset);
    return assetFeature;
  }

  updateFeatureFromAsset(assetFeature: Feature, asset: AssetInterfaces.AssetMovementWithEssentials) {
    assetFeature.setGeometry(new Point(fromLonLat([
      asset.assetMovement.microMove.location.longitude, asset.assetMovement.microMove.location.latitude
    ])));
    assetFeature.getStyle().getImage().setRotation(deg2rad(asset.assetMovement.microMove.heading));
    if (
      this.namesWereVisibleLastRerender !== this.namesVisible ||
      this.speedsWereVisibleLastRerender !== this.speedsVisible ||
      (
        this.speedsVisible &&
        this.assetSpeedsPreviouslyRendered[asset.assetMovement.asset] !== asset.assetMovement.microMove.speed.toFixed(2)
      )
    ) {
      if (this.namesVisible || this.speedsVisible) {
        assetFeature.getStyle().setText(this.getTextStyleForName(asset));
      } else {
        assetFeature.getStyle().setText(null);
      }
    }
    return assetFeature;
  }

  getTextStyleForName(asset: AssetInterfaces.AssetMovementWithEssentials) {
    let text = null;
    let offsetY = 20;
    if (this.namesVisible) {
      text = asset.assetEssentials.assetName;
    }
    if (this.speedsVisible) {
      if (text !== null) {
        text += '\n' + asset.assetMovement.microMove.speed.toFixed(2) + ' kts';
        offsetY = 30;
      } else {
        text = asset.assetMovement.microMove.speed.toFixed(2) + ' kts';
      }
      this.assetSpeedsPreviouslyRendered[asset.assetMovement.asset] = asset.assetMovement.microMove.speed.toFixed(2);
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
