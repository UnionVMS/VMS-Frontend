import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';
import { deg2rad, intToRGB, hashCode } from '@app/helpers';

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
  template: '',
})
export class TracksComponent implements OnInit, OnDestroy, OnChanges {

  @Input() assetTracks: Array<any>;
  @Input() addPositionForInspection: (track: AssetInterfaces.Movement) => void;
  @Input() positionsForInspection: any;
  @Input() map: Map;
  @Input() mapZoom: number;
  @Input() registerOnSelectFunction: (name: string, selectFunction: (event) => void) => void;
  @Input() unregisterOnSelectFunction: (name: string) => void;
  @Input() registerOnHoverFunction: (name: string, hoverFunction: (event) => void) => void;
  @Input() unregisterOnHoverFunction: (name: string) => void;

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private layerTitle = 'Tracks Layer';
  private renderedAssetIds: Array<string> = [];
  private renderedFeatureIds: Array<string> = [];
  private currentRenderFeatureIds: Array<string> = [];

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
        features = features.concat(
          assetTrack.lineSegments.map((segment, index) => this.createLineSegment(assetTrack.assetId, segment, index))
        );
        return features.concat(this.createArrowFeatures(assetTrack));
      }, [])
    );

    this.registerOnHoverFunction(this.layerTitle, (event) => {
      if (
        typeof event.selected[0] !== 'undefined' &&
        typeof event.selected[0].id_ !== 'undefined'
      ) {
        const feature = this.vectorSource.getFeatureById(event.selected[0].id_);
        if(feature !== null && event.selected[0].id_.includes('assetId_')) {
          feature.getStyle().getImage().setOpacity(1);
        }
      }
    });

    this.registerOnSelectFunction(this.layerTitle, (event) => {
      if (
        typeof event.selected[0] !== 'undefined' &&
        typeof event.selected[0].id_ !== 'undefined' &&
        this.vectorSource.getFeatureById(event.selected[0].id_) !== null &&
        event.selected[0].id_.includes('assetId_')
      ) {
        event.selected[0].id_.split('assetId_')[1].split('_guid_');
        const [ assetId, guid ] = event.selected[0].id_.split('assetId_')[1].split('_guid_');
        /* tslint:disable:no-shadowed-variable */
        const assetTrack = this.assetTracks.find((assetTrack) => assetTrack.assetId === assetId);
        const track = assetTrack.tracks.find((track) => track.guid === guid);
        /* tslint:enable:no-shadowed-variable */
        this.addPositionForInspection(track);
      }
    });

    this.vectorLayer.getSource().changed();
    this.vectorLayer.getSource().refresh();
  }

  ngOnChanges() {
    // // ngOnChange runs before ngOnInit when component mounts, we don't want to run this code then, only on updates.
    if (typeof this.vectorSource !== 'undefined') {
      const newRenderedAssetIds = [];
      // Check if assets still have tracks.
      this.renderedAssetIds.map((assetId) => {
        if(!this.assetTracks.find((assetTrack) => assetTrack.assetId === assetId)) {
          this.removeTrack(assetId);
        } else {
          newRenderedAssetIds.push(assetId);
        }
      });
      this.currentRenderFeatureIds = [];
      const features = this.assetTracks.reduce((acc, assetTrack) => {
        if(newRenderedAssetIds.indexOf(assetTrack.assetId) === -1) {
          newRenderedAssetIds.push(assetTrack.assetId);
        }
        const newArrowFeatures = this.updateArrowFeatures(assetTrack);
        this.currentRenderFeatureIds.concat(newArrowFeatures.map(feature => feature.getId()));
        acc = acc.concat(newArrowFeatures);
        return acc.concat(assetTrack.lineSegments.reduce((lineSegments, lineSegment, index) => {
          const lineSegmentId = 'line_segment_' + assetTrack.assetId + '_' + index;
          this.currentRenderFeatureIds.push(lineSegmentId);
          const segmentFeature = this.vectorSource.getFeatureById(lineSegmentId);
          if (segmentFeature !== null) {
            this.updateLineSegment(segmentFeature, lineSegment);
            return lineSegments;
          } else {
            lineSegments.push(this.createLineSegment(assetTrack.assetId, lineSegment, index));
            return lineSegments;
          }
        }, []));
      }, []);
      this.vectorSource.addFeatures(features);
      this.removeDeletedFeatures();
      this.vectorLayer.getSource().changed();
      this.vectorLayer.getSource().refresh();
      this.renderedAssetIds = newRenderedAssetIds;
    }
  }

  ngOnDestroy() {
    this.unregisterOnSelectFunction(this.layerTitle);
    this.map.removeLayer(this.vectorLayer);
  }

  removeDeletedFeatures() {
    const featuresToDelete = this.renderedFeatureIds.filter(value => this.currentRenderFeatureIds.indexOf(value) === -1);
    this.vectorSource.getFeatures().map(feature => {
      const featureId = feature.getId();
      if(featuresToDelete.indexOf(featureId) !== -1) {
        this.vectorSource.removeFeature(feature);
        this.renderedFeatureIds.splice(this.renderedFeatureIds.indexOf(featureId), 1);
      }
    });
  }

  removeTrack(assetId: string) {
    this.vectorSource.getFeatures().map((feature) => {
      const featureId = feature.getId();
      if(featureId.includes(assetId)) {
        this.vectorSource.removeFeature(feature);
        this.renderedFeatureIds.splice(this.renderedFeatureIds.indexOf(featureId), 1);
      }
    });
  }

  createLineSegment(assetId, segment, index) {
    const segmentFeature = new Feature(new LineString(segment.positions.map(
      position => fromLonLat([position.longitude, position.latitude])
    )));
    const id = 'line_segment_' + assetId + '_' + index;
    segmentFeature.setId(id);
    this.renderedFeatureIds.push(id);
    segmentFeature.setStyle(new Style({
      fill: new Fill({ color: segment.color }),
      stroke: new Stroke({ color: segment.color, width: 2 })
    }));
    return segmentFeature;
  }

  updateLineSegment(lineSegmentFeature: Feature, lineSegment: AssetInterfaces.LineSegment) {
    lineSegmentFeature.setGeometry(new LineString(
      lineSegment.positions.map(position => fromLonLat([position.longitude, position.latitude]))
    ));
  }

  createArrowFeatures(assetTrack: AssetInterfaces.AssetTrack) {
    return assetTrack.tracks.map((movement, index) => {
      const arrowFeature = this.createArrowFeature(assetTrack.assetId, movement);
      this.hideArrowDependingOnZoomLevel(arrowFeature, this.mapZoom, index);
      return arrowFeature;
    });
  }

  updateArrowFeatures(assetTrack: AssetInterfaces.AssetTrack) {
    const positionsForInspectionKeyedWithGuid = Object.keys(this.positionsForInspection).reduce((acc, positionKey) => {
      acc[this.positionsForInspection[positionKey].guid] = { ...this.positionsForInspection[positionKey], key: positionKey };
      return acc;
    }, {});
    const featureArrowsPerHour = {};
    const newFeatureArrows = assetTrack.tracks.reduce((acc, movement, index) => {
      let forceShow = false;
      const arrowFeatureId = 'assetId_' + assetTrack.assetId + '_guid_' + movement.guid;
      this.currentRenderFeatureIds.push(arrowFeatureId);
      const arrowFeature = this.vectorSource.getFeatureById(arrowFeatureId);
      if(arrowFeature === null) {
        acc.push(this.createArrowFeature(assetTrack.assetId, movement));
      } else {
        const arrowFeatureStyle = arrowFeature.getStyle();
        if (typeof positionsForInspectionKeyedWithGuid[movement.guid] !== 'undefined') {
          // We come here if we have selected the position for inspection.
          if (!Array.isArray(arrowFeatureStyle)) {
            const markerStyle = new Style({
              image: new Icon({
                src: './assets/flags/icon.png',
                anchor: [0.5, 1.1],
                rotateWithView: true,
                color: '#000000',
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
          forceShow = true;
        } else {
          // We come here if we haven't selected the position for inspection.
          if (Array.isArray(arrowFeatureStyle)) {
            // We do this after we have deselected inspection and we want to remove the indicator above the position.
            arrowFeature.setStyle(arrowFeatureStyle[0]);
          }
        }
        const dateWithHour = movement.timestamp.substring(0, 13);
        if(typeof featureArrowsPerHour[dateWithHour] === 'undefined') {
          featureArrowsPerHour[dateWithHour] = [];
        }
        featureArrowsPerHour[dateWithHour].push({ feature: arrowFeature, forceShow });
      }
      return acc;
    }, []);

    this.showXArrowsPerHour(featureArrowsPerHour, this.mapZoom);

    return newFeatureArrows;
  }

  showXArrowsPerHour(featureArrowsPerHour: {[hourAndDate: string]: Array<any>}, mapZoomLevel) {
    let showArrowsThisHour = -1;
    if(mapZoomLevel < 9) {
      showArrowsThisHour = 1;
    } else if(mapZoomLevel < 10) {
      showArrowsThisHour = 2;
    } else if(mapZoomLevel < 11) {
      showArrowsThisHour = 4;
    } else if(mapZoomLevel < 13) {
      showArrowsThisHour = 7;
    } else if(mapZoomLevel < 15) {
      showArrowsThisHour = 9;
    } else if(mapZoomLevel < 17) {
      showArrowsThisHour = 11;
    }

    Object.values(featureArrowsPerHour).map(arrowFeatures => {
      const featureShowInterval = Math.ceil(arrowFeatures.length / showArrowsThisHour);
      arrowFeatures.map((arrowFeature, index) => {
        const arrowFeatureStyle = arrowFeature.feature.getStyle();
        // Instead of setting opacity to 0 we set it to a very low number. This allowes OL to detect
        // hover on the asset, which it doesn't do on invisible objects.
        let opacity = 0.002;
        if(arrowFeature.forceShow || showArrowsThisHour === -1 || index % featureShowInterval === 0) {
          opacity = 1;
        }
        if(Array.isArray(arrowFeatureStyle)) {
          arrowFeatureStyle.map((style) => style.getImage().setOpacity(opacity));
        } else {
          arrowFeatureStyle.getImage().setOpacity(opacity);
        }
      });
    });
  }

  createArrowFeature(assetId: string, movement: AssetInterfaces.Movement) {
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
    const id = 'assetId_' + assetId + '_guid_' + movement.guid;
    arrowFeature.setId(id);
    this.renderedFeatureIds.push(id);
    return arrowFeature;
  }

}
