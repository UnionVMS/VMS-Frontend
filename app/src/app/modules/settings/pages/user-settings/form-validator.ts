import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { MapSettingsTypes } from '@data/map-settings';
import CustomValidators from '@validators/.';

export const createUserSettingsFormValidator = (mapSettings: MapSettingsTypes.Settings): FormGroup => {
  return new FormGroup({
    flagsVisible: new FormControl(mapSettings.flagsVisible),
    tracksVisible: new FormControl(mapSettings.tracksVisible),
    namesVisible: new FormControl(mapSettings.namesVisible),
    speedsVisible: new FormControl(mapSettings.speedsVisible),
    forecastsVisible: new FormControl(mapSettings.forecastsVisible),
    unitOfDistance: new FormControl(mapSettings.unitOfDistance),
    mapStartPosition: new FormGroup({
      startZoomLevel: new FormControl(mapSettings.startZoomLevel, [
        Validators.required,
        Validators.min(0),
        Validators.max(19)
      ]),
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
