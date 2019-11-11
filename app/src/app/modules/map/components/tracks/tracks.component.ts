import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';
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
  selector: 'map-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.scss']
})
export class TracksComponent implements OnInit, OnDestroy, OnChanges {

  @Input() assetTracks: Array<AssetInterfaces.AssetTrack>;
  @Input() addPositionForInspection: (track: AssetInterfaces.Movement) => void;
  @Input() positionsForInspection: { [id: number]: AssetInterfaces.Movement };
  @Input() map: Map;
  @Input() mapZoom: number;
  @Input() registerOnSelectFunction: (name: string, selectFunction: (event) => void) => void;
  @Input() unregisterOnSelectFunction: (name: string) => void;

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private layerTitle = 'Tracks Layer';
  private renderedAssetIds: Array<string> = [];
  private renderedFeatureIds: Array<string> = [];
  private currentRenderFeatureIds: Array<string> = [];
  private hoverSelection: Select;
  private previousMapZoom: number;
  private featuresHovered: Array<string> = [];

  private baseTrackCircleRadius = 0.1;
  private trackCircleRadiusZoomBonus = 0;
  private hoveTrackCircleRadius = 3.5;

  public arrowsPerHour = -1;
  public numberOfVisibleTracks = 0;
  public numberOfTracks = 0;

  ngOnInit() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      title: this.layerTitle,
      source: this.vectorSource,
      zIndex: 20,
      renderBuffer: 200
    });
    this.map.addLayer(this.vectorLayer);

    this.previousMapZoom = this.mapZoom;
    const featureArrowsPerHour = {};
    this.vectorSource.addFeatures(
      this.assetTracks.reduce((features, assetTrack) => {
        features = features.concat(
          assetTrack.lineSegments.map((segment, index) => this.createLineSegment(assetTrack.assetId, segment, index))
        );

        return features.concat(
          assetTrack.tracks.map((movement, index) => {
            const arrowFeature = this.createArrowFeature(assetTrack.assetId, movement);
            const dateWithHour = movement.timestamp.substring(0, 13);
            if(typeof featureArrowsPerHour[dateWithHour] === 'undefined') {
              featureArrowsPerHour[dateWithHour] = [];
            }
            featureArrowsPerHour[dateWithHour].push({ feature: arrowFeature, forceShow: false });
            return arrowFeature;
          })
        );
      }, [])
    );
    this.showXArrowsPerHour(featureArrowsPerHour);


    this.hoverSelection = new Select({hitTolerance: 3, layers: [this.vectorLayer], condition: pointerMove });
    this.hoverSelection.style_ = false;
    this.map.addInteraction(this.hoverSelection);

    this.hoverSelection.on('select', (event) => {
      let changed = false;

      if (typeof event.selected[0] !== 'undefined' && typeof event.selected[0].id_ !== 'undefined') {
        const feature = this.vectorSource.getFeatureById(event.selected[0].id_);
        if(feature !== null && event.selected[0].id_.includes('assetId_')) {
          this.featuresHovered.push(event.selected[0].id_);
          const idParts = event.selected[0].id_.split('_');
          const assetTrack = this.assetTracks.find((aTrack) => idParts[1] === aTrack.assetId);
          const track = assetTrack.tracks.find((tr) => idParts[3] === tr.guid);
          const styles = feature.getStyle();
          let style = styles;
          if(Array.isArray(styles)) {
            style = styles[0];
          }
          const image = style.getImage();
          if(image.constructor.name === 'CircleStyle') {
            style.getImage().setRadius(this.hoveTrackCircleRadius);
          }

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
        }
      }

      if(typeof event.deselected[0] !== 'undefined' && typeof event.deselected[0].id_ !== 'undefined') {
        const feature = this.vectorSource.getFeatureById(event.deselected[0].id_);
        if(feature !== null && event.deselected[0].id_.includes('assetId_')) {
          this.featuresHovered = this.featuresHovered.filter((featureId) => featureId !== event.deselected[0].id_);
          const styles = feature.getStyle();
          let style = styles;
          if(Array.isArray(styles)) {
            style = styles[0];
          }
          const image = style.getImage();
          if(image.constructor.name === 'CircleStyle') {
           style.getImage().setRadius(this.baseTrackCircleRadius);
          }
          style.setText(null);
          changed = true;
        }
      }

      if(changed) {
        this.vectorLayer.getSource().changed();
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
  }

  ngOnChanges() {
    console.warn('Change');
    this.determineArrowsPerHour(this.mapZoom);
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
      this.numberOfTracks = 0;
      this.numberOfVisibleTracks = 0;

      if(this.previousMapZoom !== this.mapZoom) {
        if(this.mapZoom < 10) {
          this.trackCircleRadiusZoomBonus = 0;
        } else if(this.mapZoom < 11) {
          this.trackCircleRadiusZoomBonus = 0.2;
        } else if(this.mapZoom < 12) {
          this.trackCircleRadiusZoomBonus = 0.5;
        } else if(this.mapZoom < 13) {
          this.trackCircleRadiusZoomBonus = 1;
        } else if(this.mapZoom < 15) {
         this.trackCircleRadiusZoomBonus = 1.5;
        } else {
          this.trackCircleRadiusZoomBonus = 2;
        }
        this.previousMapZoom = this.mapZoom;
      }
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
      this.renderedAssetIds = newRenderedAssetIds;
    }
  }

  ngOnDestroy() {
    this.unregisterOnSelectFunction(this.layerTitle);
    this.map.removeInteraction(this.hoverSelection);
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

  createLineSegment(assetId: string, segment: AssetInterfaces.LineSegment, index: number) {
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
      let arrowFeature = this.vectorSource.getFeatureById(arrowFeatureId);
      if(arrowFeature === null) {
        arrowFeature = this.createArrowFeature(assetTrack.assetId, movement);
        acc.push(arrowFeature);
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
      }
      const dateWithHour = movement.timestamp.substring(0, 13);
      if(typeof featureArrowsPerHour[dateWithHour] === 'undefined') {
        featureArrowsPerHour[dateWithHour] = [];
      }
      featureArrowsPerHour[dateWithHour].push({ feature: arrowFeature, forceShow, movement });
      return acc;
    }, []);
    this.showXArrowsPerHour(featureArrowsPerHour);

    return newFeatureArrows;
  }

  determineArrowsPerHour(mapZoomLevel: number) {
    this.arrowsPerHour = -1;
    if(mapZoomLevel < 9) {
      this.arrowsPerHour = 1;
    } else if(mapZoomLevel < 10) {
      this.arrowsPerHour = 2;
    } else if(mapZoomLevel < 11) {
      this.arrowsPerHour = 4;
    } else if(mapZoomLevel < 13) {
      this.arrowsPerHour = 7;
    } else if(mapZoomLevel < 15) {
      this.arrowsPerHour = 9;
    } else if(mapZoomLevel < 17) {
      this.arrowsPerHour = 11;
    }
  }

  showXArrowsPerHour(featureArrowsPerHour: {[hourAndDate: string]: Array<any>}) {
    Object.values(featureArrowsPerHour).map(arrowFeatures => {
      const numberOfFeaturesThisHour = arrowFeatures.length;
      const featureShowInterval = Math.ceil(numberOfFeaturesThisHour / this.arrowsPerHour);
      arrowFeatures.map((arrowFeature, index) => {
        let arrowFeatureStyle = arrowFeature.feature.getStyle();
        this.numberOfTracks++;
        let visible = false;
        if(arrowFeature.forceShow || this.arrowsPerHour === -1 || index % featureShowInterval === 0) {
          this.numberOfVisibleTracks++;
          visible = true;
        }
        if(Array.isArray(arrowFeatureStyle)) {
          arrowFeatureStyle = arrowFeatureStyle[0];
        }

        if(visible) {
          arrowFeatureStyle.setImage(this.createNewTrackStyle(arrowFeature.movement));
        } else {
          arrowFeatureStyle.setImage(this.createNewDormantImage(this.featuresHovered.includes(arrowFeature.feature.getId())));
        }
      });
    });
  }

  createNewTrackStyle(movement: AssetInterfaces.Movement) {
    return new Icon({
      src: '/assets/angle_up.png',
      rotation: deg2rad(movement.heading),
      // scale: 0.8,
      // color: '#' + intToRGB(hashCode(assetId))
    });
  }

  createNewDormantImage(hovering: boolean = false) {
    // let trackCircleRadiusZoomBonus = this.trackCircleRadiusZoomBonus;
    // if(!hovering) {
    //   if(numberOfFeaturesThisHour !== null && numberOfFeaturesThisHour > 200) {
    //     if(this.mapZoom < 11) {
    //       trackCircleRadiusZoomBonus = 0;
    //     } else if(this.mapZoom < 12) {
    //       trackCircleRadiusZoomBonus = 0.1;
    //     } else if(this.mapZoom < 13) {
    //       trackCircleRadiusZoomBonus = 0.2;
    //     } else if(this.mapZoom < 15) {
    //      trackCircleRadiusZoomBonus = 0.3;
    //     } else {
    //       trackCircleRadiusZoomBonus = 0.4;
    //     }
    //     // radius *= sizePenalty;
    //     // if(radius < 0) {
    //     //   radius = 0.1;
    //     // }
    //   }
    // }

    return new Circle({
      radius: 0.1, // hovering ? this.hoveTrackCircleRadius : this.baseTrackCircleRadius + this.trackCircleRadiusZoomBonus,
      fill: new Fill({color: 'black'}),
      // stroke: Stroke({
      //   color: [255,0,0], width: 2
      // })
    });
  }

  createArrowFeature(assetId: string, movement: AssetInterfaces.Movement) {
    const arrowFeature = new Feature(new Point(fromLonLat([
      movement.location.longitude, movement.location.latitude
    ])));
    arrowFeature.setStyle(new Style({ image: this.createNewDormantImage() }));
    const id = 'assetId_' + assetId + '_guid_' + movement.guid;
    arrowFeature.setId(id);
    this.renderedFeatureIds.push(id);
    return arrowFeature;
  }

}
