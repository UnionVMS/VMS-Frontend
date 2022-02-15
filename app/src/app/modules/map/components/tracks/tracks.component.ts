import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { AssetTypes } from '@data/asset';

import Map from 'ol/Map';
import { Style, Fill, Text, Circle } from 'ol/style.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Point } from 'ol/geom';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import { toStringXY } from 'ol/coordinate';

import { formatUnixtime } from '@app/helpers/datetime-formatter';

@Component({
  selector: 'map-tracks',
  template: ''
})
export class TracksComponent implements OnInit, OnDestroy, OnChanges {

  @Input() assetTracks: Array<AssetTypes.AssetTrack>;
  @Input() selectedMovement: string;
  @Input() selectMovement: (movementId: string) => void;
  @Input() map: Map;
  @Input() registerOnClickFunction: (name: string, clickFunction: (event) => void) => void;
  @Input() unregisterOnClickFunction: (name: string) => void;
  @Input() userTimezone: string; // Ensure the component is updated when the timezone changes.

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private readonly layerTitle = 'Tracks Layer';

  // Optimizations arrays for quick lookup
  private featuresHovered: Array<string> = [];
  private featuresPinned: Array<string> = [];
  private readonly renderedFeatureIdsByAssetId: { [assetId: string]: Array<string> } = {};
  private readonly lookupIndexLatLonFeature: { [latLon: string]: Feature[] } = {};
  private previousUserTimezone = '';
  private selectedFeature: Feature = null;

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
        this.renderedFeatureIdsByAssetId[assetTrack.assetId] = [];
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
          // We skip square root in pythagoras since we dont care about the distance, only relation between distance.
          const delta = Math.pow(dx, 2) + Math.pow(dy, 2);
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
        this.renderFeature(featureId, closestFeature);
        this.selectMovement(featureId);
        changed = true;

        const featuresToRemove = this.featuresHovered.filter(id => !currentHoveredFeatures.includes(id));
        featuresToRemove.map(featureIdToRemove => {
          if(!this.featuresPinned.includes(featureIdToRemove)) {
            const feature = this.vectorSource.getFeatureById(featureIdToRemove);
            if(feature !== null) {
              feature.getStyle().setImage(null);
              feature.getStyle().setText(null);
            }
          }
          this.selectMovement(null);
        });
        this.featuresHovered = currentHoveredFeatures;
      } else if(this.featuresHovered.length > 0) {
        changed = true;
        this.featuresHovered.map(featureId => {
          if(!this.featuresPinned.includes(featureId)) {
            const feature = this.vectorSource.getFeatureById(featureId);
            if(feature !== null) {
              feature.getStyle().setImage(null);
              feature.getStyle().setText(null);
            }
          }
        });
        this.featuresHovered = [];
      }

      if(changed) {
       this.vectorLayer.getSource().changed();
      }

    });


    this.registerOnClickFunction('pinTrackPosition', (event) => {
      const feature = this.vectorSource.getClosestFeatureToCoordinate(event.coordinate);

      if(feature !== null) {
        const featureId = feature.getId();
        if(this.featuresPinned.includes(featureId)) {
          this.featuresPinned = this.featuresPinned.filter(id => id !== featureId);
        } else {
          this.featuresPinned.push(featureId);
          this.featuresHovered = this.featuresHovered.filter(id => id !== featureId);
        }
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
            .indexOf(assetTrack.tracks[0].id);
          if(firstPositionIndex > 0) {
            const featureIdsToRemove = this.renderedFeatureIdsByAssetId[assetTrack.assetId].splice(0, firstPositionIndex);
            this.removeDeletedFeatures(featureIdsToRemove);
          }

          // Double check to see that we havn't already added these track positions.
          // const firstTrackToAddId = 'assetId_' + assetTrack.assetId + '_movementId_' + assetTrack.lastAddedTracks[0];
          // if(this.renderedFeatureIdsByAssetId[assetTrack.assetId].indexOf(firstTrackToAddId) === -1) {
          assetTrack.lastAddedTracks.map((trackToAdd) => {
            acc.push(this.createNewTrackPosition(assetTrack.assetId, trackToAdd));
          });
          // }
        } else {
          this.renderedFeatureIdsByAssetId[assetTrack.assetId] = [];
          acc = acc.concat(assetTrack.tracks.reduce((newFeatures, movement, index) => {
            newFeatures.push(this.createNewTrackPosition(assetTrack.assetId, movement));
            return newFeatures;
          }, []));
        }

        return acc;
      }, []);

      // Check if timezone has changed, if that's the case, update pinned tracks.
      if(this.previousUserTimezone !== this.userTimezone) {
        this.previousUserTimezone = this.userTimezone;

        this.featuresPinned.map((featureId) => {
          const feature = this.vectorSource.getFeatureById(featureId);
          this.renderFeature(featureId, feature);
        });
      }

      if (this.selectedFeature !== null) {
        this.selectedFeature.getStyle().setImage(null);
        this.selectedFeature.getStyle().setText(null);
      }
      if (this.selectedMovement !== null) {
        this.selectedFeature = this.vectorSource.getFeatureById(this.selectedMovement);
        if (this.selectedFeature) {
          this.renderFeature(this.selectedMovement, this.selectedFeature);
        }
      } else {
        this.selectedFeature = null;
      }

      this.vectorSource.addFeatures(features);
      // this.removeDeletedFeatures();
      this.vectorLayer.getSource().changed();
    }
  }

  ngOnDestroy() {
    this.map.removeLayer(this.vectorLayer);
  }

  removeDeletedFeatures(featureIdsToRemove: Array<string>) {
    featureIdsToRemove.map((featureId) => {
      const feature = this.vectorSource.getFeatureById(featureId);
      if(feature !== null) {
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

        this.vectorSource.removeFeature(feature);
      }
    });
  }

  createNewTrackPosition(assetId: string, movement: AssetTypes.Movement) {
    const feature = new Feature(new Point(fromLonLat([
      movement.location.longitude, movement.location.latitude
    ])));
    feature.setStyle(new Style({ image: null }));
    const featureId = movement.id;
    feature.setId(movement.id);

    this.renderedFeatureIdsByAssetId[assetId].push(featureId);

    const coordinate = fromLonLat([movement.location.longitude, movement.location.latitude]);
    const shortendPosition = toStringXY([coordinate[0] / 1000, coordinate[1] / 1000]);
    if(typeof this.lookupIndexLatLonFeature[shortendPosition] === 'undefined') {
      this.lookupIndexLatLonFeature[shortendPosition] = [];
    }
    this.lookupIndexLatLonFeature[shortendPosition].push(feature);

    return feature;
  }

  renderFeature(featureId: string, feature: any) {
    const movements = this.assetTracks.reduce((trackMovements, track) => {
      const innerMovements = (track.tracks.reduce((movements, movement) => {
        movements[movement.id] = movement;
        return movements;
      }, {}))
      return { ...trackMovements, ...innerMovements};
    }, {});
    const movement = movements[featureId];
    const styles = feature.getStyle();
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
      text: formatUnixtime(movement.timestamp) + ', ' + movement.speed.toFixed(2) + ' kts, ' + movement.source
    }));
  }
}
