import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';
import { deg2rad, intToRGB, hashCode, findLastIndex } from '@app/helpers/helpers';

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
import { toStringXY } from 'ol/coordinate';


import { formatDate } from '@app/helpers/helpers';

@Component({
  selector: 'map-tracks',
  template: ''
})
export class TracksComponent implements OnInit, OnDestroy, OnChanges {

  @Input() assetTracks: Array<AssetInterfaces.AssetTrack>;
  @Input() addPositionForInspection: (track: AssetInterfaces.Movement) => void;
  @Input() positionsForInspection: { [id: number]: AssetInterfaces.Movement };
  @Input() map: Map;
  @Input() registerOnSelectFunction: (name: string, selectFunction: (event) => void) => void;
  @Input() unregisterOnSelectFunction: (name: string) => void;

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private layerTitle = 'Tracks Layer';
  private hoverSelection: Select;

  // Optimizations arrays for quick lookup
  private featuresHovered: Array<string> = [];
  private renderedFeatureIdsByAssetId: { [assetId: string]: Array<string> } = {};
  private lookupIndexLatLonFeature: { [latLon: string]: Feature[] } = {};

  public numberOfTracks = 0;

  ngOnInit() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      title: this.layerTitle,
      source: this.vectorSource,
      zIndex: 21,
      renderBuffer: 200
    });
    this.map.addLayer(this.vectorLayer);

    const featureArrowsPerHour = {};
    this.vectorSource.addFeatures(
      this.assetTracks.reduce((acc, assetTrack) => {
        acc.concat(assetTrack.tracks.reduce((newFeatures, movement, index) => {
          newFeatures.push(this.createNewTrackPosition(assetTrack.assetId, movement));
          return newFeatures;
        }, []));
        return acc;
      }, [])
    );

    const theMap = this.map;
    this.map.on('pointermove', (event) => {
      let changed = false;
      const featuresAtTheeseCoordinates =
        this.lookupIndexLatLonFeature[toStringXY([event.coordinate[0] / 1000, event.coordinate[1] / 1000])];
      if(typeof featuresAtTheeseCoordinates !== 'undefined') {
        const currentHoveredFeatures = [];
        const closestFeature = featuresAtTheeseCoordinates.reduce((
          closestFeatureYet: { feature: Feature, delta: number }, feature: Feature
        ) => {
          const coordinates = feature.getGeometry().getCoordinates();
          const dx = event.coordinate[0] - coordinates[0];
          const dy = event.coordinate[1] - coordinates[1];
          const delta = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
          if(typeof closestFeatureYet === 'undefined') {
            closestFeatureYet = { feature, delta };
          } else if(delta < closestFeatureYet.delta) {
            closestFeatureYet = { feature, delta };
          }

          return closestFeatureYet;
        }, undefined).feature;

        const featureId = closestFeature.getId();
        this.featuresHovered.push(featureId);
        currentHoveredFeatures.push(featureId);
        const idParts = featureId.split('_');
        const assetTrack = this.assetTracks.find((aTrack) => idParts[1] === aTrack.assetId);
        const track = assetTrack.tracks.find((tr) => idParts[3] === tr.guid);
        const styles = closestFeature.getStyle();
        let style = styles;
        if(Array.isArray(styles)) {
          style = styles[0];
        }
        style.setImage(new Circle({
          radius: 3.5,
          fill: new Fill({color: 'black'})
        }));

        style.setText(new Text({
          font: '13px Calibri,sans-serif',
          fill: new Fill({ color: '#ffffff' }),
          backgroundFill: new Fill({ color: '#000000' }),
          padding: [5, 5, 5, 5],
          offsetX: 30,
          textAlign: 'left',
          text: 'Speed: ' + track.speed.toFixed(2) + '\n' +
          'Timestamp: ' + formatDate(track.timestamp)
        }));
        changed = true;

        const featuresToRemove = this.featuresHovered.filter(id => !currentHoveredFeatures.includes(id));
        featuresToRemove.map(featureIdToRemove => {
          const feature = this.vectorSource.getFeatureById(featureIdToRemove);
          if(feature !== null) {
            feature.getStyle().setImage(null);
            feature.getStyle().setText(null);
          }
        });
        this.featuresHovered = currentHoveredFeatures;
      } else if(this.featuresHovered.length > 0) {
        changed = true;
        this.featuresHovered.map(featureId => {
          const feature = this.vectorSource.getFeatureById(featureId);
          if(feature !== null) {
            feature.getStyle().setImage(null);
            feature.getStyle().setText(null);
          }
        });
        this.featuresHovered = [];
      }

      if(changed) {
       this.vectorLayer.getSource().changed();
      }

    });


    this.vectorLayer.getSource().changed();
  }

  ngOnChanges() {
    // // ngOnChange runs before ngOnInit when component mounts, we don't want to run this code then, only on updates.
    if (typeof this.vectorSource !== 'undefined') {
      const assetIdsToRender = this.assetTracks.map(assetTrack => assetTrack.assetId);
      Object.keys(this.renderedFeatureIdsByAssetId).map((assetId: string) => {
        if(!assetIdsToRender.includes(assetId)) {
          this.removeDeletedFeatures(this.renderedFeatureIdsByAssetId[assetId]);
          delete this.renderedFeatureIdsByAssetId[assetId];
        }
      });
      const features = this.assetTracks.reduce((acc, assetTrack) => {
        // We only want to run some code like cleaning if we already rendered this track before.
        if(typeof this.renderedFeatureIdsByAssetId[assetTrack.assetId] !== 'undefined') {
          // Since we know that the tracks are ordered by time (oldest position first) we can do some optimizations.
          // If tracks is being removed since they passed the time span we don't have to search all of it we know it to be at the start.
          const firstPositionIndex = this.renderedFeatureIdsByAssetId[assetTrack.assetId]
            .indexOf('assetId_' + assetTrack.assetId + '_guid_' + assetTrack.tracks[0].guid);
          if(firstPositionIndex > 0) {
            const featureIdsToRemove = this.renderedFeatureIdsByAssetId[assetTrack.assetId].splice(0, firstPositionIndex);
            this.removeDeletedFeatures(featureIdsToRemove);
          }

          // The same is true for adding, we know the newest positions are at the end.
          // Optimizing for speed
          const renderedFeaturesLength = this.renderedFeatureIdsByAssetId[assetTrack.assetId].length;
          const lastPositionFeatureId = this.renderedFeatureIdsByAssetId[assetTrack.assetId][renderedFeaturesLength - 1];
          const lastIndexOfRenderedPosition = findLastIndex(assetTrack.tracks, (movement: AssetInterfaces.Movement) =>
            lastPositionFeatureId === ('assetId_' + assetTrack.assetId + '_guid_' + movement.guid)
          );

          const lastIndex = assetTrack.tracks.length - 1;
          if(lastIndexOfRenderedPosition !== -1 && lastIndexOfRenderedPosition < lastIndex) {
            for(let i = lastIndexOfRenderedPosition + 1; i <= lastIndex; i++) {
              acc.push(this.createNewTrackPosition(assetTrack.assetId, assetTrack.tracks[i]));
            }
          }
        } else {
          this.renderedFeatureIdsByAssetId[assetTrack.assetId] = [];
          acc = acc.concat(assetTrack.tracks.reduce((newFeatures, movement, index) => {
            newFeatures.push(this.createNewTrackPosition(assetTrack.assetId, movement));
            return newFeatures;
          }, []));
        }

        return acc;
      }, []);
      this.vectorSource.addFeatures(features);
      // this.removeDeletedFeatures();
      this.vectorLayer.getSource().changed();
    }
  }

  ngOnDestroy() {
    this.unregisterOnSelectFunction(this.layerTitle);
    this.map.removeLayer(this.vectorLayer);
  }

  removeDeletedFeatures(featureIdsToRemove: Array<string>) {
    featureIdsToRemove.map((featureId) => {
      const feature = this.vectorSource.getFeatureById(featureId);
      if(feature !== null) {
        this.vectorSource.removeFeature(feature);
      }
      const coordinates = feature.getGeometry().getCoordinates();
      const shortendPosition = toStringXY([coordinates[0] / 1000, coordinates[1] / 1000]);
      if(typeof this.lookupIndexLatLonFeature[shortendPosition] !== 'undefined') {
        this.lookupIndexLatLonFeature[shortendPosition] = this.lookupIndexLatLonFeature[shortendPosition].filter(
          indexedFeature => indexedFeature.getId() !== featureId
        );
        if(this.lookupIndexLatLonFeature[shortendPosition].length === 0) {
          delete this.lookupIndexLatLonFeature[shortendPosition];
        }
      }
    });
  }

  createNewTrackPosition(assetId: string, movement: AssetInterfaces.Movement) {
    const feature = new Feature(new Point(fromLonLat([
      movement.location.longitude, movement.location.latitude
    ])));
    feature.setStyle(new Style({ image: null }));
    const featureId = 'assetId_' + assetId + '_guid_' + movement.guid;
    feature.setId(featureId);

    this.renderedFeatureIdsByAssetId[assetId].push(featureId);

    const coordinate = fromLonLat([movement.location.longitude, movement.location.latitude]);
    const shortendPosition = toStringXY([coordinate[0] / 1000, coordinate[1] / 1000]);
    if(typeof this.lookupIndexLatLonFeature[shortendPosition] === 'undefined') {
      this.lookupIndexLatLonFeature[shortendPosition] = [];
    }
    this.lookupIndexLatLonFeature[shortendPosition].push(feature);

    this.numberOfTracks++;
    return feature;
  }
}
