import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssetReducer, AssetActions, AssetSelectors } from '../../../../data/asset';
import { deg2rad, intToRGB, hashCode } from '../../../../helpers';

import Map from 'ol/Map';
import { Stroke, Style, Icon, Fill, Text } from 'ol/style.js';
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
  @Input() addPositionForInspection: Function;
  @Input() positionsForInspection: any;
  @Input() map: Map;
  @Input() mapZoom: number;
  @Input() registerOnClickFunction: Function;
  @Input() unregisterOnClickFunction: Function;

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
      this.assetTracks.reduce((features, assetTrack) => {
        features = features.concat(this.createLineSegments(assetTrack));
        return features.concat(this.createArrowFeatures(assetTrack));
      }, [])
    );

    this.registerOnClickFunction(this.layerTitle, (event) => {
      if (
        typeof event.selected[0] !== 'undefined' &&
        this.vectorSource.getFeatureById(event.selected[0].id_) !== null &&
        event.selected[0].id_.includes('assetId_')
      ) {
        event.selected[0].id_.split('assetId_')[1].split('_guid_');
        const [ assetId, guid ] = event.selected[0].id_.split('assetId_')[1].split('_guid_');
        const assetTrack = this.assetTracks.find((assetTrack) => assetTrack.assetId === assetId);
        const track = assetTrack.tracks.find((track) => track.guid === guid);
        this.addPositionForInspection(track);
      }
    });

    this.vectorLayer.getSource().changed();
    this.vectorLayer.getSource().refresh();
  }

  ngOnChanges() {
    // // ngOnChange runs before ngOnInit when component mounts, we don't want to run this code then, only on updates.
    if (typeof this.vectorSource !== 'undefined') {
      const features = this.assetTracks.reduce((acc, assetTrack) => {
        acc = acc.concat(this.updateArrowFeatures(assetTrack));
        return acc.concat(assetTrack.lineSegments.reduce((lineSegments, lineSegment, index) => {
          const segmentFeature = this.vectorSource.getFeatureById(assetTrack.assetId + '_' + index);
          if (segmentFeature !== null) {
            this.updateLineSegment(segmentFeature, lineSegment);
            return lineSegments;
          } else {
            return lineSegments.concat(this.createLineSegments(assetTrack));
          }
        }, []));
      }, []);
      this.vectorSource.addFeatures(features);
      this.vectorLayer.getSource().changed();
      this.vectorLayer.getSource().refresh();
    }
  }

  ngOnDestroy() {
    this.unregisterOnClickFunction(this.layerTitle);
    this.map.removeLayer(this.vectorLayer);
  }

  createLineSegments(assetTrack: AssetReducer.AssetTrack) {
    return assetTrack.lineSegments.map((segment, index) => {
      const segmentFeature = new Feature(new LineString(segment.positions.map(
        position => fromLonLat([position.longitude, position.latitude])
      )));
      segmentFeature.setId(assetTrack.assetId + "_" + index);
      segmentFeature.setStyle(new Style({
        fill: new Fill({ color: segment.color }),
        stroke: new Stroke({ color: segment.color, width: 2 })
      }))
      return segmentFeature;
    });
  }

  updateLineSegment(lineSegmentFeature: Feature, lineSegment: AssetReducer.LineSegment) {
    lineSegmentFeature.setGeometry(new LineString(
      lineSegment.positions.map(position => fromLonLat([position.longitude, position.latitude]))
    ));
  }

  createArrowFeatures(assetTrack: AssetReducer.AssetTrack) {
    return assetTrack.tracks.map((movement, index) => {
      const arrowFeature = this.createArrowFeature(assetTrack.assetId, movement);
      this.hideArrowDependingOnZoomLevel(arrowFeature, this.mapZoom, index);
      return arrowFeature;
    });
  }

  updateArrowFeatures(assetTrack: AssetReducer.AssetTrack) {
    const positionsForInspectionKeyedWithGuid = Object.keys(this.positionsForInspection).reduce((acc, positionKey) => {
      acc[this.positionsForInspection[positionKey].guid] = { ...this.positionsForInspection[positionKey], key: positionKey };
      return acc;
    }, {});
    const newFeatureArrows = assetTrack.tracks.reduce((acc, movement, index) => {
      const arrowFeature = this.vectorSource.getFeatureById('assetId_' + assetTrack.assetId + '_guid_' + movement.guid);
      if(arrowFeature === null) {
        acc.push(this.createArrowFeature(assetTrack.assetId, movement));
      } else {
        const arrowFeatureStyle = arrowFeature.getStyle();
        if (typeof positionsForInspectionKeyedWithGuid[movement.guid] !== 'undefined') {
          if (!Array.isArray(arrowFeatureStyle)) {
            const markerStyle = new Style({
              image: new Icon({
                src: './assets/flags/mini/icon.png',
                anchor: [0.5, 1.1],
                rotateWithView: true,
                color: "#000000",
                opacity: 0.75
              }),
              text: new Text({
                font: '13px Calibri,sans-serif',
                fill: new Fill({ color: '#FFFFFF' }),
                stroke: new Stroke({
                  color: '#FFFFFF',
                  width: 2
                }),
                offsetY: -22,
                text: positionsForInspectionKeyedWithGuid[movement.guid].key
              })
            });
            arrowFeature.setStyle([arrowFeatureStyle, markerStyle]);
          }
          this.hideArrowDependingOnZoomLevel(arrowFeature, this.mapZoom, index, true);
        } else {
          if (Array.isArray(arrowFeatureStyle)) {
            arrowFeature.setStyle(arrowFeatureStyle[0]);
          }
          this.hideArrowDependingOnZoomLevel(arrowFeature, this.mapZoom, index);
        }
      }
      return acc;
    }, []);
    return newFeatureArrows;
  }

  hideArrowDependingOnZoomLevel(arrowFeature, mapZoomLevel, index, forceShow = false) {
    const arrowFeatureStyle = arrowFeature.getStyle();
    let opacity = 0;
    if (forceShow) {
      opacity = 1;
    } else if (mapZoomLevel < 8) {
      if(index % 40 === 0) {
        opacity = 1;
      }
    } else if (mapZoomLevel < 10) {
      if(index % 16 === 0) {
        opacity = 1;
      }
    } else if (mapZoomLevel < 12) {
      if(index % 6 === 0) {
        opacity = 1;
      }
    } else if (mapZoomLevel < 14) {
      if(index % 2 === 0) {
        opacity = 1;
      }
    } else {
      opacity = 1;
    }
    if(Array.isArray(arrowFeatureStyle)) {
      arrowFeatureStyle.map((style) => style.getImage().setOpacity(opacity));
    } else {
      arrowFeatureStyle.getImage().setOpacity(opacity);
    }
  }

  createArrowFeature(assetId: string, movement: AssetReducer.Movement) {
    const arrowFeature = new Feature(new Point(fromLonLat([
      movement.location.longitude, movement.location.latitude
    ])));
    arrowFeature.setStyle(new Style({
      image: new Icon({
        src: '/assets/angle_up.png',
        scale: 0.8,
        color: '#' + intToRGB(hashCode(assetId))
      })
    }));
    arrowFeature.getStyle().getImage().setRotation(deg2rad(movement.heading));
    arrowFeature.setId('assetId_' + assetId + '_guid_' + movement.guid);
    return arrowFeature;
  }

}
