import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssetReducer, AssetActions, AssetSelectors } from '../../../../data/asset';

import Map from 'ol/Map';
import {Fill, RegularShape, Stroke, Style, Circle as CircleStyle, Icon } from 'ol/style.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import { fromLonLat } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON.js';
import MultiPoint from 'ol/geom/MultiPoint.js';


@Component({
  selector: 'map-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent implements OnInit, OnDestroy {

  @Input() assets: Array<AssetReducer.Asset>;
  @Input() map: Map;

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private layerTitle: string = "Asset Layer";

  ngOnInit() {

    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      title: this.layerTitle,
      source: this.vectorSource,
      renderBuffer: 200
    });
    this.map.addLayer(this.vectorLayer);

    this.vectorSource.addFeatures(this.assets.map((asset) => this.createFeatureFromAsset(asset)));

    this.vectorLayer.getSource().changed();
    this.vectorLayer.getSource().refresh();
  }

  deg2rad(degrees) {
    return Math.sin(degrees * Math.PI / 180);
  }

  radToDeg(rad) {
      return (180.0 * (rad / Math.PI));
  }

  intToRGB(i) {
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
  }

  hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }

  createFeatureFromAsset(asset: AssetReducer.Asset) {
    const assetFeature = new Feature(new Point(fromLonLat([asset.location.longitude, asset.location.latitude])));
    const stroke = new Stroke({color: 'black', width: 2});
    const fill = new Fill({color: 'green'});

    const assetStyle = new Style({
      image: new Icon({
        src: '/assets/arrow_640_rotated_4p.png',
        scale: 0.8,
        rotation: Math.PI,
        color: "#" + this.intToRGB(this.hashCode(asset.asset))
      }),
    });

    assetFeature.setStyle(assetStyle);
    assetFeature.getStyle().getImage().setOpacity(1);
    assetFeature.getStyle().getImage().setRotation(this.deg2rad(asset.heading));
    assetFeature.setId(asset.asset);
    return assetFeature;
  }

  updateFeatureFromAsset(assetFeature: Feature, asset: AssetReducer.Asset) {
    assetFeature.setGeometry(new Point(fromLonLat([asset.location.longitude, asset.location.latitude])));
    assetFeature.getStyle().getImage().setRotation(this.deg2rad(asset.heading));
    return assetFeature;
  }

  ngOnChanges() {
    // ngOnChange runs before ngOnInit when component mounts, we don't want to run this code then, only on updates.
    if(typeof this.vectorSource !== 'undefined') {
      this.vectorSource.addFeatures(
        this.assets.reduce((acc, asset) => {
          const assetFeature = this.vectorSource.getFeatureById(asset.asset);
          if(assetFeature !== null) {
            this.updateFeatureFromAsset(assetFeature, asset);
          } else {
            acc.push(this.createFeatureFromAsset(asset));
          }
          return acc;
        }, [])
      );
      this.vectorLayer.getSource().changed();
      this.vectorLayer.getSource().refresh();
    }
  }

  ngOnDestroy() {

  }
}
