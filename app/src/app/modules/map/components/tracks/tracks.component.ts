import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssetReducer, AssetActions, AssetSelectors } from '../../../../data/asset';
import { deg2rad } from '../../../../helpers';

import Map from 'ol/Map';
import { Stroke, Style, Icon } from 'ol/style.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { LineString, Point } from 'ol/geom';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import Collection from 'ol/Collection';

@Component({
  selector: 'map-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.scss']
})
export class TracksComponent implements OnInit, OnDestroy, OnChanges {

  @Input() assetTracks: Array<any>;
  @Input() map: Map;
  @Input() mapZoom: number;

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private layerTitle = 'Tracks Layer';

  ngOnInit() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      title: this.layerTitle,
      source: this.vectorSource,
      renderBuffer: 200
    });
    this.map.addLayer(this.vectorLayer);
    this.vectorSource.addFeatures(
      this.assetTracks.map((assetTrack) => this.createTracks(assetTrack)).reduce(
        (features, featureArray) => {
          return features.concat(featureArray);
        }, []
      )
    );

    this.vectorLayer.getSource().changed();
    this.vectorLayer.getSource().refresh();
  }

  ngOnChanges() {
    // // ngOnChange runs before ngOnInit when component mounts, we don't want to run this code then, only on updates.
    if (typeof this.vectorSource !== 'undefined') {
      this.vectorSource.addFeatures(
        this.assetTracks.reduce((acc, assetTrack) => {
          const trackFeature = this.vectorSource.getFeatureById(assetTrack.assetId);
          if (trackFeature !== null) {
            acc = acc.concat(this.updateTracks(trackFeature, assetTrack));
          } else {
            console.warn(assetTrack);
            acc = acc.concat(this.createTracks(assetTrack));
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

  createTracks(assetTrack: AssetReducer.AssetTrack) {
    const coordinates = assetTrack.tracks.map((movement) => fromLonLat([movement.location.longitude, movement.location.latitude]));
    const trackFeature = new Feature(new LineString(coordinates));
    trackFeature.setId(assetTrack.assetId);
    const arrowFeatures = assetTrack.tracks.map((movement, index) => {
      const arrowFeature = this.createArrowFeature(movement)
      this.hideArrowDependingOnZoomLevel(arrowFeature, this.mapZoom, index);
      return arrowFeature;
    });
    arrowFeatures.push(trackFeature);
    return arrowFeatures;
  }

  updateTracks(trackFeature: Feature, assetTrack: AssetReducer.AssetTrack) {
    const coordinates = assetTrack.tracks.map((movement) => fromLonLat([movement.location.longitude, movement.location.latitude]));
    trackFeature.setGeometry(new LineString(coordinates));
    const newFeatureArrows = assetTrack.tracks.reduce((acc, movement, index) => {
      const arrowFeature = this.vectorSource.getFeatureById(movement.guid);
      if(arrowFeature === null) {
        acc.push(this.createArrowFeature(movement));
      } else {
        this.hideArrowDependingOnZoomLevel(arrowFeature, this.mapZoom, index);
      }
      return acc;
    }, []);
    return newFeatureArrows;
  }

  hideArrowDependingOnZoomLevel(arrowFeature, mapZoomLevel, index) {
    if(mapZoomLevel < 8) {
      if(index % 40 !== 0) {
        arrowFeature.getStyle().getImage().setOpacity(0);
      } else {
        arrowFeature.getStyle().getImage().setOpacity(1);
      }
    } else if(mapZoomLevel < 10) {
      if(index % 16 !== 0) {
        arrowFeature.getStyle().getImage().setOpacity(0);
      } else {
        arrowFeature.getStyle().getImage().setOpacity(1);
      }
    } else if(mapZoomLevel < 12) {
      if(index % 6 !== 0) {
        arrowFeature.getStyle().getImage().setOpacity(0);
      } else {
        arrowFeature.getStyle().getImage().setOpacity(1);
      }
    } else {
      arrowFeature.getStyle().getImage().setOpacity(1);
    }
  }

  createArrowFeature(movement: AssetReducer.Movement) {
    const arrowFeature = new Feature(new Point(fromLonLat([movement.location.longitude, movement.location.latitude])));
    arrowFeature.setStyle(new Style({
      image: new Icon({
        src: '/assets/angle_up.png',
        scale: 0.8,
        color: '#0000FF'
      })
    }));
    arrowFeature.getStyle().getImage().setRotation(deg2rad(movement.heading));
    arrowFeature.setId(movement.guid);
    return arrowFeature;
  }

}
