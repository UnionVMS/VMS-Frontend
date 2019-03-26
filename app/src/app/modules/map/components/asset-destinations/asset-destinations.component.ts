import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssetReducer, AssetActions, AssetSelectors } from '../../../../data/asset';
import { deg2rad, intToRGB, hashCode, destinationPoint } from '../../../../helpers';

import Map from 'ol/Map';
import {Fill, Stroke, Style, Icon, Text } from 'ol/style.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import Select from 'ol/interaction/Select.js';

@Component({
  selector: 'map-asset-destinations',
  templateUrl: './asset-destinations.component.html',
  styleUrls: ['./asset-destinations.component.scss']
})
export class AssetDestinationsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() assets: Array<AssetReducer.Asset>;
  @Input() map: Map;

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private layerTitle = 'Asset Destinations Layer';

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
        features.push(this.createFeatureFromAsset(asset));
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
          const assetFeature = this.vectorSource.getFeatureById(asset.asset);
          if (assetFeature !== null) {
            this.updateFeatureFromAsset(assetFeature, asset);
          } else if (asset.flagstate !== 'UNK') {
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
    this.map.removeLayer(this.vectorLayer);
  }

  createFeatureFromAsset(asset: AssetReducer.Asset) {
    const flagFeature = new Feature(new Point(fromLonLat([
      asset.microMove.location.longitude, asset.microMove.location.latitude
    ])));
    const flagStyle = new Style({
      image: new Icon({
        src: './assets/flags/mini/se.png',
        anchor: [0.5, 2.4],
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
  //
  // drawFuturePosition(asset: AssetReducer.Asset) {
  //   var speed = asset.microMove.speed * 1.852; // km
  //   var futureFeatures = [{}, {}];
  //
  //   for (var i = 0; i < 2; i++) {
  //       var futurePosition = realtimeMapService.destinationPoint(
  //         asset.microMove.location.latitude,
  //         asset.microMove.location.longitude,
  //         speed * ((i+1) * 500),
  //         asset.microMove.heading
  //       );
  //       var futureFeature = new ol.Feature(new Point(fromLonLat( [futurePosition[1], futurePosition[0] ])));
  //       var id = 'futurePos_' + i + '_' + asset.asset;
  //       var cachedFeature = trackSource.getFeatureById(id);
  //       if (cachedFeature == null) {
  //           var futureStyle = createStyle('arrow', data.color, 'white');
  //           futureFeature.setStyle(futureStyle);
  //           futureFeature.setId(id);
  //           futureFeatures[i] = futureFeature;
  //           trackSource.addFeature(futureFeatures[i]);
  //       }
  //       else {
  //           cachedFeature.setGeometry(futureFeature.getGeometry());
  //           futureFeatures[i] = futureFeature;
  //       }
  //   }
  //
  //   // draw an arrow in the direction
  //   // get the angle between current position and future position
  //   var length = data.currentFeature.getGeometry().getCoordinates().length;
  //
  //   var dx = futureFeatures[1].getGeometry().getCoordinates()[1] - futureFeatures[0].getGeometry().getCoordinates()[1];
  //   var dy = futureFeatures[1].getGeometry().getCoordinates()[0] - futureFeatures[0].getGeometry().getCoordinates()[0];
  //   var rot = Math.atan2(dy, dx);
  //   futureFeatures[0].getStyle().getImage().setRotation(rot);
  //   futureFeatures[1].getStyle().getImage().setRotation(rot);
  //
  //   return futureFeatures;
  // };
}
