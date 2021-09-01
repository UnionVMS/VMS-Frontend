import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssetTypes, AssetActions, AssetSelectors } from '@data/asset';
import { deg2rad, intToRGB, hashCode } from '@app/helpers/helpers';
import getContryISO2 from 'country-iso-3-to-2';

import Map from 'ol/Map';
import { Style, Icon } from 'ol/style.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';

@Component({
  selector: 'map-flagstates',
  template: '',
})
export class FlagstatesComponent implements OnInit, OnDestroy, OnChanges {

  @Input() assets: Array<AssetTypes.AssetMovementWithEssentials>;
  @Input() map: Map;
  @Input() selectAsset: (assetId: string) => void;
  @Input() registerOnSelectFunction: (key: string, selectFunction: (event) => void) => void;
  @Input() unregisterOnSelectFunction: (key: string) => void;

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private readonly layerTitle = 'Flagstate Layer';
  private readonly flagCanvasByCountry: any = {};
  private renderedAssetIds: Array<string> = [];

  ngOnInit() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      title: this.layerTitle,
      source: this.vectorSource,
      zIndex: 21,
      renderBuffer: 200
    });
    this.map.addLayer(this.vectorLayer);
    // You should be able to click on the flag to select the asset (ship).
    this.registerOnSelectFunction(this.layerTitle, (event) => {
      if (
        typeof event.selected[0] !== 'undefined' &&
        typeof event.selected[0].id_ !== 'undefined' &&
        this.vectorSource.getFeatureById(event.selected[0].id_) !== null
      ) {
        this.selectAsset(event.selected[0].id_.substring(5));
      }
    });
    this.vectorSource.addFeatures(this.assets.reduce((features, asset) => {
      if (typeof asset.assetEssentials !== 'undefined' && asset.assetEssentials.flagstate !== 'UNK') {
        const flagFeature = this.createFeatureFromAsset(asset);
        if(flagFeature !== false) {
          this.renderedAssetIds.push(asset.assetEssentials.assetId);
          features.push(flagFeature);
        }
      }
      return features;
    }, []));

    this.vectorLayer.getSource().changed();
  }

  ngOnChanges() {
    // ngOnChange runs before ngOnInit when component mounts, we don't want to run this code then, only on updates.
    if (typeof this.vectorSource !== 'undefined') {
      const newRenderedAssetIds = [];
      this.renderedAssetIds.map((assetId) => {
        if(!this.assets.find((asset) => asset.assetMovement.asset === assetId)) {
          this.removeFeature(assetId);
        } else {
          newRenderedAssetIds.push(assetId);
        }
      });
      this.vectorSource.addFeatures(
        this.assets.reduce((acc, asset) => {
          if(typeof asset.assetEssentials !== 'undefined') {
            const assetFeature = this.vectorSource.getFeatureById('flag_' + asset.assetEssentials.assetId);
            if (assetFeature !== null) {
              if(newRenderedAssetIds.indexOf(asset.assetEssentials.assetId) === -1) {
                newRenderedAssetIds.push(asset.assetEssentials.assetId);
              }
              this.updateFeatureFromAsset(assetFeature, asset.assetMovement);
            } else if (asset.assetEssentials.flagstate !== 'UNK') {
              const flagFeature = this.createFeatureFromAsset(asset);
              if(flagFeature !== false) {
                if(newRenderedAssetIds.indexOf(asset.assetEssentials.assetId) === -1) {
                  newRenderedAssetIds.push(asset.assetEssentials.assetId);
                }
                acc.push(flagFeature);
              }
            }
          }
          return acc;
        }, [])
      );
      this.vectorLayer.getSource().changed();
      this.renderedAssetIds = newRenderedAssetIds;
    }
  }

  ngOnDestroy() {
    this.unregisterOnSelectFunction(this.layerTitle);
    this.map.removeLayer(this.vectorLayer);
  }

  removeFeature(assetId) {
    this.vectorSource.getFeatures().map((feature) => {
      if(feature.getId().includes(assetId)) {
        this.vectorSource.removeFeature(feature);
      }
    });
  }

  createFeatureFromAsset(asset: AssetTypes.AssetMovementWithEssentials) {
    if(typeof getContryISO2(asset.assetEssentials.flagstate) === 'undefined') {
      return false;
    }
    const flagFeature = new Feature(new Point(fromLonLat([
      asset.assetMovement.movement.location.longitude, asset.assetMovement.movement.location.latitude
    ])));
    const flagStyle = new Style({
      image: new Icon({
        img: this.getImage(getContryISO2(asset.assetEssentials.flagstate).toLowerCase()),
        imgSize: [16, 12],
        anchor: [0.5, 2.6],
        rotateWithView: true
      })
    });
    const markerStyle = new Style({
      image: new Icon({
        src: './assets/flags/icon.png',
        anchor: [0.5, 1.1],
        rotateWithView: true,
        color: '#FFFFFF',
        opacity: 0.75
      })
    });

    flagFeature.setStyle([markerStyle, flagStyle]);
    flagFeature.setId('flag_' + asset.assetEssentials.assetId);
    return flagFeature;
  }

  updateFeatureFromAsset(assetFeature: Feature, asset: AssetTypes.AssetMovement) {
    assetFeature.setGeometry(new Point(fromLonLat([
      asset.movement.location.longitude, asset.movement.location.latitude
    ])));
    return assetFeature;
  }

  getImage(countryCode) {
    if(typeof this.flagCanvasByCountry[countryCode] === 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.setAttribute('width', '16');
      canvas.setAttribute('height', '12');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
          ctx.drawImage(img, 0, 0, 16, 12);
      };
      img.src = `./assets/flags/4x3/${countryCode}.svg`;
      this.flagCanvasByCountry[countryCode] = canvas;
    }
    return this.flagCanvasByCountry[countryCode];
  }

}
