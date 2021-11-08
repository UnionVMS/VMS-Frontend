import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AssetTypes } from '@data/asset';

export const createAssetFormValidator = (asset: AssetTypes.Asset) => {
  return new FormGroup({
    essentailFields: new FormGroup({
      flagState: new FormControl(asset.flagStateCode, [Validators.required]),
      externalMarking: new FormControl(asset.externalMarking, [Validators.required]),
      name: new FormControl(asset.name, [Validators.required]),
    }),
    identificationFields: new FormGroup({
      cfr: new FormControl(asset.cfr),
      ircs: new FormControl(asset.ircs),
      imo: new FormControl(asset.imo, [Validators.minLength(7), Validators.maxLength(7), Validators.pattern('[0-9]*')]),
      portOfRegistration: new FormControl(asset.portOfRegistration),
      mmsi: new FormControl(asset.mmsi),
    }),
    metrics: new FormGroup({
      lengthOverAll: new FormControl(asset.lengthOverAll),
      lengthBetweenPerpendiculars: new FormControl(asset.lengthBetweenPerpendiculars),
      grossTonnage: new FormControl(asset.grossTonnage),
      grossTonnageUnit: new FormControl(asset.grossTonnageUnit),
      powerOfMainEngine: new FormControl(asset.powerOfMainEngine),
    }),
    companyInformation: new FormGroup({
      prodOrgName: new FormControl(asset.prodOrgName),
      prodOrgCode: new FormControl(asset.prodOrgCode),
    }),
  });
};
