import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { MapSettingsInterfaces } from '@data/map-settings';
import CustomValidators from '@validators/.';

export const alphanumericWithHyphenAndSpace = (c: FormControl) => {
  const EMAIL_REGEXP = /^[a-z0-9\- ]*$/i;
  return c.value === null || c.value.length === 0 || EMAIL_REGEXP.test(c.value) ? null : {
    validateAlphanumericHyphenAndSpace: true
  };
};


export const createUserSettingsFormValidator = (mapSettings: MapSettingsInterfaces.Settings): FormGroup => {
  return new FormGroup({
    flagsVisible: new FormControl(mapSettings.flagsVisible),
    tracksVisible: new FormControl(mapSettings.tracksVisible),
    namesVisible: new FormControl(mapSettings.namesVisible),
    speedsVisible: new FormControl(mapSettings.speedsVisible),
    forecastsVisible: new FormControl(mapSettings.forecastsVisible),
    mapStartPosition: new FormGroup({
      startZoomLevel: new FormControl(mapSettings.startZoomLevel, [Validators.required]),
      latitude: new FormControl(mapSettings.startPosition.latitude, [Validators.required]),
      longitude: new FormControl(mapSettings.startPosition.longitude, [Validators.required]),
    }),
    mapLimits: new FormGroup({
      tracksMinuteCap: new FormControl('' + mapSettings.tracksMinuteCap),
      forecastInterval: new FormControl(mapSettings.forecastInterval, [Validators.required]),
    }),
    assetColorMethod: new FormControl(mapSettings.assetColorMethod),
  });
};
