import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssetReducer, AssetActions, AssetSelectors } from '../../../../data/asset';
import { deg2rad, intToRGB, hashCode } from '../../../../helpers';
import getContryISO2 from 'country-iso-3-to-2';

import Map from 'ol/Map';
import { Style, Icon } from 'ol/style.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';

@Component({
  selector: 'map-flagstates',
  template: '',
})
export class FlagstatesComponent implements OnInit, OnDestroy, OnChanges {

  @Input() assets: Array<AssetReducer.Asset>;
  @Input() map: Map;

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private layerTitle = 'Flagstate Layer';
  private flagCanvasByCountry: any = {};

  ngOnInit() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      title: this.layerTitle,
      source: this.vectorSource,
      renderBuffer: 200
    });
    this.map.addLayer(this.vectorLayer);

    this.vectorSource.addFeatures(this.assets.reduce((features, asset) => {
      if (asset.flagstate !== 'UNK') {
        const flagFeature = this.createFeatureFromAsset(asset);
        if(flagFeature !== false) {
          features.push(flagFeature);
        }
      }
      return features;
    }, []));

    this.vectorLayer.getSource().changed();
    this.vectorLayer.getSource().refresh();
  }

  ngOnChanges() {
    // ngOnChange runs before ngOnInit when component mounts, we don't want to run this code then, only on updates.
    if (typeof this.vectorSource !== 'undefined') {
      this.vectorSource.addFeatures(
        this.assets.reduce((acc, asset) => {
          const assetFeature = this.vectorSource.getFeatureById('flag_' + asset.asset);
          if (assetFeature !== null) {
            this.updateFeatureFromAsset(assetFeature, asset);
          } else if (asset.flagstate !== 'UNK') {
            const flagFeature = this.createFeatureFromAsset(asset);
            if(flagFeature !== false) {
              acc.push(flagFeature);
            }
          }
          return acc;
        }, [])
      );
      this.vectorLayer.getSource().changed();
      this.vectorLayer.getSource().refresh();
    }
  }

  ngOnDestroy() {
    this.map.removeLayer(this.vectorLayer);
  }

  createFeatureFromAsset(asset: AssetReducer.Asset) {
    if(typeof getContryISO2(asset.flagstate) === 'undefined') {
      return false;
    }
    const flagFeature = new Feature(new Point(fromLonLat([
      asset.microMove.location.longitude, asset.microMove.location.latitude
    ])));
    const flagStyle = new Style({
      image: new Icon({
        img: this.getImage(getContryISO2(asset.flagstate).toLowerCase()),
        imgSize: [16, 12],
        anchor: [0.5, 2.6],
        rotateWithView: true
      })
    });
    const markerStyle = new Style({
      image: new Icon({
        src: './assets/flags/icon.png',
        anchor: [0.5, 1.1],
        rotateWithView: true,
        color: "#FFFFFF",
        opacity: 0.75
      })
    });

    flagFeature.setStyle([markerStyle, flagStyle]);
    flagFeature.setId('flag_' + asset.asset);
    return flagFeature;
  }

  updateFeatureFromAsset(assetFeature: Feature, asset: AssetReducer.Asset) {
    assetFeature.setGeometry(new Point(fromLonLat([
      asset.microMove.location.longitude, asset.microMove.location.latitude
    ])));
    return assetFeature;
  }

  getImage(countryCode) {
    if(typeof this.flagCanvasByCountry[countryCode] === 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.setAttribute("width", "16");
      canvas.setAttribute("height", "12");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = function() {
          ctx.drawImage(img, 0, 0, 16, 12);
      }
      img.src = `./assets/flags/4x3/${countryCode}.svg`;
      this.flagCanvasByCountry[countryCode] = canvas;
    }
    return this.flagCanvasByCountry[countryCode];
  }

}