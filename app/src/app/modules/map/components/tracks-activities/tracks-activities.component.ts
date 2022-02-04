import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ActivityTypes } from '@data/activity';

import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { Stroke, Style, Fill, Text, Circle } from 'ol/style.js';
import { fromLonLat } from 'ol/proj';
import { Point, LineString } from 'ol/geom';
import { formatUnixtime } from '@app/helpers/datetime-formatter';

@Component({
  selector: 'map-tracks-activities',
  template: ''
})
export class TracksActivitiesComponent implements OnInit, OnDestroy, OnChanges {

  @Input() activityTracks: Readonly<{ readonly [assetId: string]: ReadonlyArray<ActivityTypes.Activity> }>;
  @Input() map: Map;
  @Input() mapZoom: number;
  @Input() userTimezone: string; // Ensure the component is updated when the timezone changes.

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private readonly layerTitle = 'Activity Tracks Layer';

  private namesVisible: boolean;

  ngOnInit(): void {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      title: this.layerTitle,
      source: this.vectorSource,
      zIndex: 22,
      renderBuffer: 200
    });
    this.map.addLayer(this.vectorLayer);
    const features = this.createActivityFeatures();
    this.vectorSource.addFeatures(features);
    const lineStrings = this.createActivityLineStrings();
    this.vectorSource.addFeatures(lineStrings);

    this.vectorLayer.getSource().changed();
  }

  ngOnChanges() {
    if(this.mapZoom < 8) {
      this.namesVisible = false;
    } else {
      this.namesVisible = true;
    }
    if (typeof this.vectorSource !== 'undefined') {
      this.vectorSource.clear();
      const features = this.createActivityFeatures();
      this.vectorSource.addFeatures(features);
      const lineStrings = this.createActivityLineStrings();
      this.vectorSource.addFeatures(lineStrings);
      this.vectorLayer.getSource().changed();
    }
  }

  ngOnDestroy() {
    this.map.removeLayer(this.vectorLayer);
  }

  createActivityFeatures() {
    const features = Object.values(this.activityTracks).reduce((features, activities) => {
      features = features.concat(activities.reduce((activityFeatures, activity) => {
        if (typeof activity.longitude !== 'undefined' && typeof activity.latitude !== 'undefined' ) {
          activityFeatures.push(this.createNewActivityFeature(activity.longitude, activity.latitude, activity.activityType, activity.startDate));
        }
        activityFeatures = activityFeatures.concat(activity.relatedActivities.reduce((relatedFeatures, relatedActivity) => {
          relatedFeatures.push(this.createNewActivityFeature(relatedActivity.longitude, relatedActivity.latitude, relatedActivity.activityType, relatedActivity.occurence));
          return relatedFeatures;
        }, []));
        return activityFeatures
      }, []));
      return features;
    }, []);

    const filteredFeatures = features.reduce((acc, feature: Feature) => {
      if (typeof acc[feature.getId()] !== 'undefined') {
        if (this.namesVisible) {
          acc[feature.getId()].getStyle().getText().setText(acc[feature.getId()].getStyle().getText().getText() + ' / ' + feature.getStyle().getText().getText());
        }
      } else {
        acc[feature.getId()] = feature;
      }
      return acc;
    }, {});

    return Object.values(filteredFeatures);
  }

  createActivityLineStrings() {
    return Object.values(this.activityTracks).reduce((lineStrings: Array<Feature>, activities) => {
      const sortedActivities = [...activities].sort((a1, a2) => {return a1.startDate - a2.startDate});
      const coordinates = sortedActivities.reduce((coordinates, activity) => {
        if (typeof activity.longitude !== 'undefined' && typeof activity.latitude !== 'undefined' ) {
          coordinates.push(fromLonLat([activity.longitude, activity.latitude]))
        }
        coordinates = coordinates.concat([...activity.relatedActivities].sort((a1, a2) => { return a1.occurence - a2.occurence }).reduce((relatedCoordinates, relatedActivity) => {
          relatedCoordinates.push(fromLonLat([relatedActivity.longitude, relatedActivity.latitude]));
          return relatedCoordinates;
        }, []));
        return coordinates;
      }, []);
      const segmentFeature = new Feature(new LineString(coordinates));
      segmentFeature.setStyle(new Style({
        fill: new Fill({ color: 'green' }),
        stroke: new Stroke({ color: 'green', width: 2 })
      }));
      lineStrings.push(segmentFeature);
      return lineStrings;
    }, []);
  }

  createNewActivityFeature(longitude: number, latitude: number, text: string, timestamp: number) {
    const feature = new Feature(new Point(fromLonLat([
      longitude, latitude
    ])));
    feature.setStyle(new Style({
      image: new Circle({
        radius: 3.5,
        fill: new Fill({color: 'green'})
      })
    }));

    if (this.namesVisible) {
      feature.getStyle().setText(new Text({
        font: '13px Calibri,sans-serif',
        fill: new Fill({ color: '#000000' }),
        padding: [5, 5, 5, 5],
        offsetX: 10,
        textAlign: 'left',
        text: text.toLowerCase().replace(/^_*(.)|_+(.)/g, (s, c, d) => c ? c.toUpperCase() : ' ' + d.toUpperCase()) + ' ' + formatUnixtime(timestamp)
      }));
    }

    feature.setId(latitude + ';' + longitude);

    return feature;
  }
}
