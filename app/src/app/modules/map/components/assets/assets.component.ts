import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssetReducer, AssetActions, AssetSelectors } from '../../../../data/asset';
import { deg2rad, intToRGB, hashCode } from '../../../../helpers';

import Map from 'ol/Map';
import {Fill, Stroke, Style, Icon, Text } from 'ol/style.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import Select from 'ol/interaction/Select.js';



@Component({
  selector: 'map-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() assets: Array<AssetReducer.Asset>;
  @Input() map: Map;
  @Input() namesVisible: boolean;
  @Input() speedsVisible: boolean;
  @Input() selectAsset: Function;

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private layerTitle = 'Asset Layer';
  private namesWereVisibleLastRerender: boolean;
  private speedsWereVisibleLastRerender: boolean;
  private selection: Select;

  ngOnInit() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      title: this.layerTitle,
      source: this.vectorSource,
      renderBuffer: 200
    });
    this.map.addLayer(this.vectorLayer);
    this.selection = new Select();
    this.map.addInteraction(this.selection);
    this.selection.on('select', (event) => {
      if (typeof event.selected[0] !== 'undefined') {
        this.selectAsset(event.selected[0].id_);
        console.warn(event.selected[0].id_);
      }
    });

    this.vectorSource.addFeatures(this.assets.map((asset) => this.createFeatureFromAsset(asset)));

    this.vectorLayer.getSource().changed();
    this.vectorLayer.getSource().refresh();
  }

  ngOnChanges() {
    // ngOnChange runs before ngOnInit when component mounts, we don't want to run this code then, only on updates.
    if (typeof this.vectorSource !== 'undefined') {
      this.vectorSource.addFeatures(
        this.assets.reduce((acc, asset) => {
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
    }
  }

  ngOnDestroy() {
    this.map.removeLayer(this.vectorLayer);
  }

  createFeatureFromAsset(asset: AssetReducer.Asset) {
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

  updateFeatureFromAsset(assetFeature: Feature, asset: AssetReducer.Asset) {
    assetFeature.setGeometry(new Point(fromLonLat([
      asset.microMove.location.longitude, asset.microMove.location.latitude
    ])));
    assetFeature.getStyle().getImage().setRotation(deg2rad(asset.microMove.heading));
    if (
      this.namesWereVisibleLastRerender !== this.namesVisible ||
      this.speedsWereVisibleLastRerender !== this.speedsVisible
    ) {
      if (this.namesVisible || this.speedsVisible) {
        assetFeature.getStyle().setText(this.getTextStyleForName(asset));
      } else {
        assetFeature.getStyle().setText(null);
      }
    }
    return assetFeature;
  }

  getTextStyleForName(asset: AssetReducer.Asset) {
    let text = null;
    let offsetY = -15;
    if (this.namesVisible) {
      text = asset.assetName;
    }
    if (this.speedsVisible) {
      if (text !== null) {
        text += '\n' + asset.microMove.speed.toFixed(2) + ' kts';
        offsetY = -22;
      } else {
        text = asset.microMove.speed.toFixed(2) + ' kts';
      }
    }

    return new Text({
      font: '13px Calibri,sans-serif',
      fill: new Fill({ color: '#000' }),
      stroke: new Stroke({
        color: '#fff',
        width: 2
      }),
      offsetY,
      // offsetY: -15,
      // get the text from the feature - `this` is ol.Feature
      // and show only under certain resolution
      // text: map.getView().getZoom() > 12 ? this.get('description') : ''
      text
    });
  }

}
