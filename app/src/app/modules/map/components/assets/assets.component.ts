import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssetTypes, AssetActions, AssetSelectors } from '@data/asset';
import { deg2rad, intToRGB, hashCode } from '@app/helpers/helpers';

import Map from 'ol/Map';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style, Icon, Text } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import Select from 'ol/interaction/Select.js';
import { getName as getCountryName, registerLocale } from 'i18n-iso-countries';
// @ts-ignore
import enLocale from 'i18n-iso-countries/langs/en.json';
registerLocale(enLocale);

@Component({
  selector: 'map-assets',
  template: '',
})
export class AssetsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() assets: Array<AssetTypes.AssetMovementWithEssentials>;
  @Input() map: Map;
  @Input() namesVisible: boolean;
  @Input() speedsVisible: boolean;
  @Input() shipColorLogic: string;
  @Input() selectedAssets: Array<{
    asset: AssetTypes.Asset,
    assetTracks: AssetTypes.AssetTrack,
    currentPosition: AssetTypes.AssetMovement
  }>;
  @Input() mapZoom: number;
  @Input() selectAsset: (assetId: string) => void;
  @Input() deselectAsset: (assetId: string) => void;
  @Input() registerOnSelectFunction: (key: string, selectFunction: (event) => void) => void;
  @Input() unregisterOnSelectFunction: (key: string) => void;

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private layerTitle = 'Asset Layer';
  private namesWereVisibleLastRerender: boolean;
  private speedsWereVisibleLastRerender: boolean;
  private selection: Select;
  private assetSpeedsPreviouslyRendered: { [key: string]: string | null } = {};
  private assetLastUpdateHash: { [assetId: string]: Array<number|boolean>} = {};
  // Instead of an array we use object for faster lookup in ngOnChange loop.
  private renderedAssetIds: { [ assetId: string]: boolean } = {};
  private previouslySelectedAssetIds = [];
  private styleCache: Array<any> = [];

  private namesVisibleCalculated: boolean;
  private speedsVisibleCalculated: boolean;

  ngOnInit() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      title: this.layerTitle,
      source: this.vectorSource,
      zIndex: 20,
      renderBuffer: 200,
    });
    this.map.addLayer(this.vectorLayer);
    this.registerOnSelectFunction(this.layerTitle, (event) => {
      if (
        typeof event.selected[0] !== 'undefined' &&
        typeof event.selected[0].id_ !== 'undefined' &&
        this.vectorSource.getFeatureById(event.selected[0].id_) !== null
      ) {
        if(this.selectedAssets.find(selectedAsset => event.selected[0].id_ === selectedAsset.asset.id)) {
          this.deselectAsset(event.selected[0].id_);
        } else {
          this.selectAsset(event.selected[0].id_);
        }
      }
    });

    this.vectorSource.addFeatures(this.assets.map((asset) => {
      this.renderedAssetIds[asset.assetMovement.asset] = true;
      return this.createFeatureFromAsset(asset);
    }));

    this.vectorLayer.getSource().changed();
  }

  ngOnChanges() {
    if(this.mapZoom < 10) {
      this.namesVisibleCalculated = false;
      this.speedsVisibleCalculated = false;
    } else {
      this.namesVisibleCalculated = this.namesVisible;
      this.speedsVisibleCalculated = this.speedsVisible;
    }
    // ngOnChange runs before ngOnInit when component mounts, we don't want to run this code then, only on updates.
    if (typeof this.vectorSource !== 'undefined') {
      const assetsToRender = this.assets.reduce((acc, asset) => {
        acc[asset.assetMovement.asset] = true;
        return acc;
      }, {});
      const reRenderAssets = Object.keys(this.renderedAssetIds).some((assetId) => assetsToRender[assetId] !== true);

      if(reRenderAssets) {
        console.warn('-- Rerendering all assets');
        // Instead of removing them one by one which triggers recalculations inside open layers after every removal
        // we clear the entire map of assets and redraw them, this scales linearly instead of exponentialy it appears.
        this.vectorSource.clear();
        this.assetLastUpdateHash = {};
        this.assetSpeedsPreviouslyRendered = {};
      }

      if(this.assets.length === 0) {
        return false;
      }

      const newRenderedAssetIds = reRenderAssets ? {} : this.renderedAssetIds;

      this.vectorSource.addFeatures(
        this.assets.reduce((acc, asset) => {
          if(newRenderedAssetIds[asset.assetMovement.asset] === undefined) {
            newRenderedAssetIds[asset.assetMovement.asset] = true;
          }
          if(reRenderAssets) {
            acc.push(this.createFeatureFromAsset(asset));
            return acc;
          }
          const assetFeature = this.vectorSource.getFeatureById(asset.assetMovement.asset);

          if (assetFeature !== null) {
            this.updateFeatureFromAsset(assetFeature, asset);
          } else {
            acc.push(this.createFeatureFromAsset(asset));
          }
          return acc;
        }, [])
      );

      const currentlySelectedIds = [];
      // Invert colors for selected asset and change previously selected assets icon back to normal.
      this.selectedAssets.map((selectedAsset) => {
        currentlySelectedIds.push(selectedAsset.asset.id);
        if(!this.previouslySelectedAssetIds.some((previousAssetId) => previousAssetId === selectedAsset.asset.id)) {
          const selectedAssetFeature = this.vectorSource.getFeatureById(selectedAsset.asset.id);
          if(selectedAssetFeature) {
            this.addTargetImageOnAsset(
              selectedAssetFeature,
              '/assets/target.png'
            );

            // We need to reset position to force rerender of asset.
            selectedAssetFeature.setGeometry(new Point(fromLonLat([
              selectedAsset.currentPosition.microMove.location.longitude,
              selectedAsset.currentPosition.microMove.location.latitude
            ])));
          }
        }
      });

      this.previouslySelectedAssetIds.map((previouslySelectedAssetId) => {
        if(!currentlySelectedIds.some((assetId) => assetId === previouslySelectedAssetId)) {
          const previouslySelectedAssetFeature = this.vectorSource.getFeatureById(previouslySelectedAssetId);
          if(typeof previouslySelectedAssetFeature !== 'undefined' && previouslySelectedAssetFeature !== null) {
            const previouslySelectedAsset = this.assets.find((asset) => asset.assetMovement.asset === previouslySelectedAssetId);
            this.removeTargetImageOnAsset(
              previouslySelectedAssetFeature,
            );
          }
        }
      });
      this.previouslySelectedAssetIds = currentlySelectedIds;

      this.namesWereVisibleLastRerender = this.namesVisibleCalculated;
      this.speedsWereVisibleLastRerender = this.speedsVisibleCalculated;
      this.renderedAssetIds = newRenderedAssetIds;
    }
  }

  addTargetImageOnAsset(assetFeature, src) {
    let style = assetFeature.getStyle();
    if(!Array.isArray(style)) {
      style = [style];
    }

    style.push(new Style({
      image: new Icon({
        src,
        color: '#FF0000',
        opacity: 1
      })
    }));

    assetFeature.setStyle(style);
  }

  removeTargetImageOnAsset(assetFeature) {
    let style = assetFeature.getStyle();
    if(Array.isArray(style)) {
      style = style[0];
      assetFeature.setStyle(style);
    }
  }


  ngOnDestroy() {
    this.unregisterOnSelectFunction(this.layerTitle);
    this.map.removeLayer(this.vectorLayer);
  }

  removeAsset(assetId) {
    const feature = this.vectorSource.getFeatureById(assetId);
    if(feature) {
      this.vectorSource.removeFeature(feature);
    }
  }

  createFeatureFromAsset(asset: AssetTypes.AssetMovementWithEssentials) {
    const assetMovement = asset.assetMovement;
    const assetEssentials = asset.assetEssentials;
    const assetFeature = new Feature(new Point(fromLonLat([
      assetMovement.microMove.location.longitude, assetMovement.microMove.location.latitude
    ])));

    const styleProperties: any = {
      image: new Icon({
        src: '/assets/Vessel.png',
        opacity: 1,
        rotation: deg2rad(assetMovement.microMove.heading),
        color: this.getShipColor(asset)
      })
    };
    if (this.namesVisibleCalculated || this.speedsVisibleCalculated) {
      styleProperties.text = this.getTextStyleForName(asset);
    }

    const assetStyle = new Style(styleProperties);

    assetFeature.setStyle(assetStyle);
    // assetFeature.getStyle().getImage().setOpacity(1);
    // assetFeature.getStyle().getImage().setRotation(deg2rad(assetMovement.microMove.heading));
    assetFeature.setId(assetMovement.asset);

    if(asset.assetMovement.decayPercentage !== undefined) {
      assetFeature.getStyle().getImage().setOpacity(asset.assetMovement.decayPercentage);
    }

    const currentAssetPosition = [
      asset.assetMovement.microMove.location.latitude,
      asset.assetMovement.microMove.location.longitude,
      asset.assetMovement.microMove.heading,
      asset.assetMovement.decayPercentage,
      typeof asset.assetEssentials === 'undefined'
    ];
    this.assetLastUpdateHash[asset.assetMovement.asset] = currentAssetPosition;
    return assetFeature;
  }

  getShipColor(asset) {
    switch (this.shipColorLogic) {
      case 'Shiptype':
        if(
          typeof asset.assetEssentials === 'undefined' ||
          asset.assetEssentials.vesselType === null ||
          typeof asset.assetEssentials.vesselType === 'undefined'
        ) {
          return '#FFFFFF';
        }
        return '#' + intToRGB(hashCode(asset.assetEssentials.vesselType));
      case 'Flagstate':
        if(
          typeof asset.assetEssentials === 'undefined' ||
          asset.assetEssentials.flagstate === null ||
          typeof asset.assetEssentials.flagstate === 'undefined'
        ) {
          return '#FFFFFF';
        }
        const country = getCountryName(asset.assetEssentials.flagstate, 'en') || asset.assetEssentials.flagstate;
        return '#' + intToRGB(hashCode(country));
      case 'Size (length)':
        if(
          typeof asset.assetEssentials === 'undefined' ||
          asset.assetEssentials.lengthOverAll === null ||
          typeof asset.assetEssentials.lengthOverAll === 'undefined'
        ) {
          return '#FFFFFF';
        }
        let color;
        if(asset.assetEssentials.lengthOverAll < 20) {
          color = (Math.round((asset.assetEssentials.lengthOverAll) / 20 * 200) + 55).toString(16).toUpperCase();
          if(color.length === 1) {
            color = `0${color}`;
          }
          return `#${color}0000`;
        } else if(asset.assetEssentials.lengthOverAll < 30) {
          color = (Math.round((asset.assetEssentials.lengthOverAll - 20) / 10 * 200) + 55).toString(16).toUpperCase();
          if(color.length === 1) {
            color = `0${color}`;
          }
          return `#00${color}00`;
        } else {
          color = ((asset.assetEssentials.lengthOverAll - 30) / 10 * 200) + 55;
          if(color > 255) {
            color = 255;
          }
          color = Math.round(color).toString(16).toUpperCase();
          if(color.length === 1) {
            color = `0${color}`;
          }
          return `#0000${color}`;
        }
      default:
        return '#' + intToRGB(hashCode(asset.assetMovement.asset));
    }
  }

  updateFeatureFromAsset(assetFeature: Feature, asset: AssetTypes.AssetMovementWithEssentials) {
    const currentAssetPosition = [
      asset.assetMovement.microMove.location.latitude,
      asset.assetMovement.microMove.location.longitude,
      asset.assetMovement.microMove.heading,
      asset.assetMovement.decayPercentage,
      typeof asset.assetEssentials === 'undefined'
    ];

    const oldStuff = this.assetLastUpdateHash[asset.assetMovement.asset];
    if(
      oldStuff === undefined ||
      oldStuff[0] !== currentAssetPosition[0] || oldStuff[1] !== currentAssetPosition[1] || oldStuff[2] !== currentAssetPosition[2]
    ) {
      assetFeature.setGeometry(new Point(fromLonLat(
        [asset.assetMovement.microMove.location.longitude, asset.assetMovement.microMove.location.latitude]
      )));
      const style = assetFeature.getStyle();
      if(Array.isArray(style)) {
        style[0].getImage().setRotation(deg2rad(asset.assetMovement.microMove.heading));
      } else {
        style.getImage().setRotation(deg2rad(asset.assetMovement.microMove.heading));
      }
      this.assetLastUpdateHash[asset.assetMovement.asset] = currentAssetPosition;
    }
    if(oldStuff === undefined || oldStuff[3] !== currentAssetPosition[3]) {
      assetFeature.getStyle().getImage().setOpacity(asset.assetMovement.decayPercentage);
    }
    if (
      this.namesWereVisibleLastRerender !== this.namesVisibleCalculated ||
      this.speedsWereVisibleLastRerender !== this.speedsVisibleCalculated ||
      (
        this.speedsVisibleCalculated &&
        asset.assetMovement.microMove.speed !== null &&
        this.assetSpeedsPreviouslyRendered[asset.assetMovement.asset] !== asset.assetMovement.microMove.speed.toFixed(2)
      )
    ) {
      const style = assetFeature.getStyle();
      if (this.namesVisibleCalculated || this.speedsVisibleCalculated) {
        if(Array.isArray(style)) {
          style[0].setText(this.getTextStyleForName(asset));
        } else {
          style.setText(this.getTextStyleForName(asset));
        }
      } else {
        if(Array.isArray(style)) {
          style[0].setText(null);
        } else {
          style.setText(null);
        }
      }
    }
    if(oldStuff === undefined || oldStuff[4] !== currentAssetPosition[4]) {
      const style = assetFeature.getStyle();
      let actualStyle = style;
      if(Array.isArray(style)) {
        actualStyle = style[0];
      }
      actualStyle.setImage(new Icon({
        src: '/assets/Vessel.png',
        opacity: actualStyle.getImage().getOpacity(),
        rotation: deg2rad(asset.assetMovement.microMove.heading),
        color: this.getShipColor(asset)
      }));
    }
    return assetFeature;
  }

  getTextStyleForName(asset: AssetTypes.AssetMovementWithEssentials) {
    let text = null;
    let offsetY = 20;
    if (this.namesVisibleCalculated && asset.assetEssentials !== undefined) {
      text = asset.assetEssentials.assetName;
    }
    if (this.speedsVisibleCalculated && asset.assetMovement.microMove.speed !== null) {
      if (text !== null) {
        text += '\n' + asset.assetMovement.microMove.speed.toFixed(2) + ' kts';
        offsetY = 30;
      } else {
        text = asset.assetMovement.microMove.speed.toFixed(2) + ' kts';
      }
      this.assetSpeedsPreviouslyRendered[asset.assetMovement.asset] = asset.assetMovement.microMove.speed !== null
        ? asset.assetMovement.microMove.speed.toFixed(2)
        : null;
    }

    return new Text({
      font: '13px Calibri,sans-serif',
      fill: new Fill({ color: '#000' }),
      stroke: new Stroke({
        color: '#fff',
        width: 1
      }),
      offsetY,
      text
    });
  }

}
