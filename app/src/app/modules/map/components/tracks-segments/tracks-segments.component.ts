import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';

import { AssetTypes, AssetActions, AssetSelectors } from '@data/asset';
import { deg2rad, intToRGB, hashCode } from '@app/helpers/helpers';

import Map from 'ol/Map';
import { Stroke, Style, Icon, Fill, Text, Circle } from 'ol/style.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { LineString, Point } from 'ol/geom';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import Collection from 'ol/Collection';
import Select from 'ol/interaction/Select.js';
import { pointerMove } from 'ol/events/condition.js';

import { formatDate } from '@app/helpers/helpers';

@Component({
  selector: 'map-tracks-segments',
  template: '',
})
export class TracksSegmentsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() assetTracks: Array<AssetTypes.AssetTrack>;
  @Input() map: Map;

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private readonly layerTitle = 'Tracks-Segments Layer';
  private renderedAssetIds: Array<string> = [];
  private readonly renderedFeatureIds: Array<string> = [];
  private currentRenderFeatureIds: Array<string> = [];

  ngOnInit() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      title: this.layerTitle,
      source: this.vectorSource,
      zIndex: 20,
      renderBuffer: 200
    });
    this.map.addLayer(this.vectorLayer);

    this.vectorSource.addFeatures(
      this.assetTracks.reduce((features, assetTrack) => {
        return features.concat(
          assetTrack.lineSegments.map((segment, index) => this.createLineSegment(assetTrack.assetId, segment))
        );
      }, [])
    );

    this.vectorLayer.getSource().changed();
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
        return acc.concat(assetTrack.lineSegments.reduce((lineSegments, lineSegment) => {
          const lineSegmentId = 'line_segment_' + assetTrack.assetId + '_' + lineSegment.id;
          this.currentRenderFeatureIds.push(lineSegmentId);
          const segmentFeature = this.vectorSource.getFeatureById(lineSegmentId);
          if (segmentFeature !== null) {
            this.updateLineSegment(segmentFeature, lineSegment);
            return lineSegments;
          } else {
            lineSegments.push(this.createLineSegment(assetTrack.assetId, lineSegment));
            return lineSegments;
          }
        }, []));
      }, []);
      this.vectorSource.addFeatures(features);
      this.removeDeletedFeatures();
      this.vectorLayer.getSource().changed();
      this.renderedAssetIds = newRenderedAssetIds;
    }
  }

  ngOnDestroy() {
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

  createLineSegment(assetId: string, segment: AssetTypes.LineSegment) {
    const segmentFeature = new Feature(new LineString(segment.positions.map(
      position => fromLonLat([position.longitude, position.latitude])
    )));
    const id = 'line_segment_' + assetId + '_' + segment.id;
    segmentFeature.setId(id);
    this.renderedFeatureIds.push(id);
    segmentFeature.setStyle(new Style({
      fill: new Fill({ color: segment.color }),
      stroke: new Stroke({ color: segment.color, width: 2 })
    }));
    return segmentFeature;
  }

  updateLineSegment(lineSegmentFeature: Feature, lineSegment: AssetTypes.LineSegment) {
    lineSegmentFeature.setGeometry(new LineString(
      lineSegment.positions.map(position => fromLonLat([position.longitude, position.latitude]))
    ));
  }
}
