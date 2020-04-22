import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

// @ts-ignore
import moment from 'moment-timezone';

import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { Circle as CircleStyle, Fill, Stroke, Style, Icon, Text } from 'ol/style';
import { fromLonLat } from 'ol/proj';

import { NotesActions, NotesTypes, NotesSelectors } from '@data/notes';
import { AssetTypes } from '@data/asset';
import { createNotesFormValidator } from './form-validator';

import { errorMessage } from '@app/helpers/validators/error-messages';
import { formatDate, deg2rad, intToRGB, hashCode } from '@app/helpers/helpers';

@Component({
  selector: 'map-manual-movement-form',
  templateUrl: './manual-movement-form.component.html',
  styleUrls: ['./manual-movement-form.component.scss']
})
export class ManualMovementFormComponent implements OnInit {
  @Input() createManualMovement: (manualMovement: AssetTypes.Movement) => void;
  @Input() map: Map;

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private layerTitle = 'Manual movement form preview';
  public formValidator: FormGroup;
  private featureId = 'manual_movement_preview';

  ngOnInit() {
    this.formValidator = createNotesFormValidator();

    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      title: this.layerTitle,
      source: this.vectorSource,
      zIndex: 20,
      renderBuffer: 200,
    });
    this.map.addLayer(this.vectorLayer);
  }

  save() {
    this.createManualMovement({
      location: {
        longitude: parseFloat(this.formValidator.value.longitude),
        latitude: parseFloat(this.formValidator.value.latitude),
      },
      heading: parseFloat(this.formValidator.value.heading),
      timestamp: Math.floor(this.formValidator.value.timestamp.format('X')),
      speed: parseFloat(this.formValidator.value.speed),
    } as AssetTypes.Movement);
    const cachedFeature = this.vectorSource.getFeatureById(this.featureId);
    this.vectorSource.removeFeature(cachedFeature);
  }

  renderPreview() {
    const cachedFeature = this.vectorSource.getFeatureById(this.featureId);
    if(this.formValidator.value.latitude > '' && this.formValidator.value.longitude > '') {
      const position = new Point(fromLonLat([
        parseFloat(this.formValidator.value.longitude),
        parseFloat(this.formValidator.value.latitude)
      ]));
      const heading = this.formValidator.value.heading > '' ? deg2rad(parseInt(this.formValidator.value.heading, 10)) : 0;
      if (cachedFeature === null) {
        const previewFeature = new Feature(position);
        const fill = new Fill({
          color: 'rgba(232,78,15,0.65)'
        });

        const styles = [
          new Style({
            image: new Icon({
              src: '/assets/Vessel.png',
              rotation: heading,
              color: '#FFFFFF'
            }),
            zIndex: 1
          }),
          new Style({
            image: new CircleStyle({
              fill,
              radius: 10
            }),
            zIndex: 0
          })
        ];

        previewFeature.setStyle(styles);

        previewFeature.setId(this.featureId);
        this.vectorSource.addFeature(previewFeature);
      } else {
        cachedFeature.setGeometry(position);
        cachedFeature.getStyle()[0].getImage().setRotation(heading);
      }
    } else if(cachedFeature !== null) {
      this.vectorSource.removeFeature(cachedFeature);
    }
  }

  getErrors(path: string[]) {
    const errors = this.formValidator.get(path).errors;
    return errors === null ? [] : Object.keys(errors);
  }

  errorMessage(error: string) {
    if(error === 'maxlength') {
      return 'Text can not be longer then 255 characters.';
    }

    return errorMessage(error);
  }

  getErrorMessages(path: string[]): string[] {
    return this.getErrors(path).map(error => this.errorMessage(error));
  }

  updateTimestamp(dateTime: moment.Moment) {
    const formControl = this.formValidator.get('timestamp');
    formControl.setValue(dateTime);
  }
}
