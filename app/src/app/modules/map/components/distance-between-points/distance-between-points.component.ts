import { Component, Input, OnInit, OnDestroy, OnChanges, ViewEncapsulation  } from '@angular/core';
import { intToRGB, hashCode, destinationPoint } from '@app/helpers';

import Map from 'ol/Map';
import { unByKey } from 'ol/Observable.js';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style.js';
import Overlay from 'ol/Overlay.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { getLength } from 'ol/sphere.js';
import Feature from 'ol/Feature';
import { LineString, Point } from 'ol/geom.js';
import { fromLonLat } from 'ol/proj';
import Draw from 'ol/interaction/Draw.js';

@Component({
  selector: 'map-distance-between-points',
  templateUrl: './distance-between-points.component.html',
  styleUrls: ['./distance-between-points.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class DistanceBetweenPointsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() map: Map;
  @Input() registerOnClickFunction: (name: string, clickEvent: (event) => void) => void;
  @Input() active: boolean;

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private layerTitle = 'Distance Between Points Layer';
  private drawEvent: Draw;
  private isDrawing = false;
  private measureTooltipElement = null;
  private measureTooltip = null;
  private measureTooltips = [];
  private features = [];

  ngOnInit() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      title: this.layerTitle,
      source: this.vectorSource,
      zIndex: 15,
      renderBuffer: 200
    });

    this.drawEvent = new Draw({
      source: this.vectorSource,
      type: 'LineString',
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2
        }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)'
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          })
        })
      })
    });


    const formatLength = (line) => {
      const length = getLength(line);
      let output;
      if (length > 100) {
        output = (Math.round(length / 1000 * 100) / 100) + ' km';
      } else {
        output = (Math.round(length * 100) / 100) + ' m';
      }
      return output;
    };

    let listener;
    let sketch;
    this.drawEvent.on('drawstart', (drawEvent) => {
      this.measureTooltipElement = document.createElement('div');
      this.measureTooltipElement.className = 'tooltip tooltip-measure';
      this.measureTooltip = new Overlay({
        element: this.measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
      });
      this.measureTooltips.push(this.measureTooltip);
      this.map.addOverlay(this.measureTooltip);
      // set sketch
      sketch = drawEvent.feature;
      this.features.push(sketch);
      let tooltipCoord = drawEvent.coordinate;

      listener = sketch.getGeometry().on('change', (event) => {
        const geom = event.target;
        tooltipCoord = geom.getLastCoordinate();
        this.measureTooltipElement.innerHTML = formatLength(geom);
        this.measureTooltip.setPosition(tooltipCoord);
      });
    }, this);

    this.drawEvent.on('drawend', () => {
      this.measureTooltipElement.className = 'tooltip tooltip-static';
      this.measureTooltip.setOffset([0, -7]);
      sketch = null;
      this.measureTooltipElement = null;
      unByKey(listener);
    });

    this.map.addLayer(this.vectorLayer);
    this.vectorLayer.getSource().changed();
    this.vectorLayer.getSource().refresh();
  }

  ngOnChanges() {
    // ngOnChange runs before ngOnInit when component mounts, we don't want to run this code then, only on updates.
    if (typeof this.vectorSource !== 'undefined') {
      if(this.active && !this.isDrawing) {
        this.map.addInteraction(this.drawEvent);
        this.isDrawing = true;
      } else if(!this.active && this.isDrawing) {
        this.map.removeInteraction(this.drawEvent);
        this.isDrawing = false;
      }
    }
  }

  ngOnDestroy() {
    this.map.removeLayer(this.vectorLayer);
    this.map.removeInteraction(this.drawEvent);
    this.measureTooltips.map((tooltip) => {
      this.map.removeOverlay(tooltip);
    });
  }

  clearMeasurements() {
    this.measureTooltips.map((tooltip) => {
      this.map.removeOverlay(tooltip);
    });
    this.vectorSource.clear();
    this.features = [];
    // this.vectorSource features
  }


}
