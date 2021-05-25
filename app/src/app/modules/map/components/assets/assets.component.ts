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
  private readonly layerTitle = 'Asset Layer';
  private namesWereVisibleLastRerender: boolean;
  private speedsWereVisibleLastRerender: boolean;
  private assetSpeedsPreviouslyRendered: { [key: string]: string | null } = {};
  private assetLastUpdateHash: { [assetId: string]: Array<number|boolean>} = {};
  // Instead of an array we use object for faster lookup in ngOnChange loop.
  private renderedAssetIds: { [ assetId: string]: boolean } = {};
  private previouslySelectedAssetIds = [];

  private namesVisibleCalculated: boolean;
  private speedsVisibleCalculated: boolean;

  private readonly knownVesselTypes = [
    'Fishing', 'Law Enforcement', 'Military', 'WIG', 'Pleasure Craft', 'Sailing', 'SAR',
    'Anti-pollution', 'Cargo', 'Diving', 'Dredging', 'HSC', 'Medical Transport', 'Passenger',
    'Pilot', 'Port Tender', 'Ships according to RR', 'Tanker', 'Towing', 'Tug', 'Other'
  ];

  private readonly mostCommonFlagstates = [
    'SWE', 'DNK', 'NOR', 'FIN', 'POL', 'LTU', 'LVA', 'EST',
    'GBR', 'DEU', 'NLD', 'IRL', 'MHL', 'LBR', 'PAN', 'MLT',
  ];

  private readonly colors = [
    '#34CF8A', '#A185F8', '#89FBF5', '#F386F9', '#33C6CF', '#F0FC8B', '#9FCAFF', '#FF6969',
    '#CCFF7F', '#751EBA', '#BD22B4', '#0000FF', '#FF0000', '#FF7F00', '#00FF00',
    '#F9A287', '#4D70C8', '#C74B6E', '#83DC60', '#C9852E', '#CCD53A', '#FFD07A',
  ];

  private readonly allocatedColors: { [logicType: string]: { [type: string]: string } } = {};
  private readonly allocatedIndex: { [logicType: string]: number } = {};

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
    if(this.mapZoom < 8) {
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
              selectedAsset.currentPosition.movement.location.longitude,
              selectedAsset.currentPosition.movement.location.latitude
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
      assetMovement.movement.location.longitude, assetMovement.movement.location.latitude
    ])));

    const styleProperties: any = {
      image: new Icon({
        src: '/assets/Vessel.png',
        opacity: 1,
        rotation: deg2rad(assetMovement.movement.heading),
        color: this.getShipColor(asset)
      })
    };
    if (this.namesVisibleCalculated || this.speedsVisibleCalculated) {
      styleProperties.text = this.getTextStyleForName(asset);
    }

    const assetStyle = new Style(styleProperties);

    assetFeature.setStyle(assetStyle);
    assetFeature.setId(assetMovement.asset);

    if(asset.assetMovement.decayPercentage !== undefined) {
      assetFeature.getStyle().getImage().setOpacity(asset.assetMovement.decayPercentage);
    }

    const currentAssetPosition = [
      asset.assetMovement.movement.location.latitude,
      asset.assetMovement.movement.location.longitude,
      asset.assetMovement.movement.heading,
      asset.assetMovement.decayPercentage,
      typeof asset.assetEssentials === 'undefined'
    ];
    this.assetLastUpdateHash[asset.assetMovement.asset] = currentAssetPosition;
    return assetFeature;
  }

  getOldSystemShipColor(asset: AssetTypes.AssetMovementWithEssentials) {
    if(
      typeof asset.assetEssentials === 'undefined' ||
      asset.assetEssentials.vesselType === null ||
      typeof asset.assetEssentials.vesselType === 'undefined'
    ) {
      return '#FFFFFF';
    }

    const typeName = asset.assetEssentials.vesselType;

    if(typeName === 'Fishing') {
      return '#F1FF62';
    }

    if(['Law Enforcement', 'Military', 'WIG', 'Other'].includes(typeName)) {
      if(typeName === 'Law Enforcement' && asset.assetEssentials.assetName.includes('KBV')) {
        return '#0000FF';
      }
      return '#73C2FB';
    }

    if(['Pleasure Craft', 'Sailing'].includes(typeName)) {
      return '#A9A9A9';
    }

    if(typeName === 'SAR') {
      return '#FF7F50';
    }

    if([
      'Anti-pollution', 'Cargo', 'Diving', 'Dredging', 'HSC', 'Medical Transport',
      'Passenger', 'Pilot', 'Port Tender', 'Ships according to RR',
      'Tanker', 'Towing', 'Tug',
    ].includes(typeName)) {
      return '#32CD32';
    }

    if(asset.assetEssentials.vesselType === 'No such code : 0') {
      return '#FFFFFF';
    }

    return '#F82ACE';
  }

  getShipColorByLength(asset: AssetTypes.AssetMovementWithEssentials) {
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
  }

  getShipColorByShiptype(asset: AssetTypes.AssetMovementWithEssentials) {
    if(
      typeof asset.assetEssentials === 'undefined' ||
      asset.assetEssentials.vesselType === null ||
      typeof asset.assetEssentials.vesselType === 'undefined' ||
      asset.assetEssentials.vesselType === 'No such code : 0'
    ) {
      return '#FFFFFF';
    }
    if(typeof this.allocatedColors.shiptype === 'undefined') {
      this.allocatedIndex.shiptype = 0;
      this.allocatedColors.shiptype = this.knownVesselTypes.reduce((acc, aVesselType) => {
        acc[aVesselType] = this.colors[this.allocatedIndex.shiptype++];
        return acc;
      }, {});
    }

    const vesselType = asset.assetEssentials.vesselType.toUpperCase();
    if(typeof this.allocatedColors.shiptype[vesselType] === 'undefined') {
      if(this.allocatedIndex.shiptype + 1 >= this.colors.length) {
        this.allocatedColors.shiptype[vesselType] = '#' + intToRGB(hashCode(vesselType));
      } else {
        this.allocatedColors.shiptype[vesselType] = this.colors[this.allocatedIndex.shiptype++];
      }
    }
    return this.allocatedColors.shiptype[vesselType];
  }

  getShipColorByFlagstate(asset: AssetTypes.AssetMovementWithEssentials) {
    if(
      typeof asset.assetEssentials === 'undefined' ||
      asset.assetEssentials.flagstate === null ||
      typeof asset.assetEssentials.flagstate === 'undefined' ||
      asset.assetEssentials.flagstate === 'UNK' ||
      asset.assetEssentials.flagstate === 'ERR'
    ) {
      return '#FFFFFF';
    }

    if(typeof this.allocatedColors.flagstate === 'undefined') {
      this.allocatedIndex.flagstate = 0;
      this.allocatedColors.flagstate = this.mostCommonFlagstates.reduce((acc, aFlagState) => {
        acc[aFlagState] = this.colors[this.allocatedIndex.flagstate++];
        return acc;
      }, {});
    }

    if(typeof this.allocatedColors.flagstate[asset.assetEssentials.flagstate] === 'undefined') {
      if(this.allocatedIndex.flagstate + 1 >= this.colors.length) {
        this.allocatedColors.flagstate[asset.assetEssentials.flagstate] =
          '#' + intToRGB(hashCode(getCountryName(asset.assetEssentials.flagstate, 'en') || asset.assetEssentials.flagstate));
      } else {
        this.allocatedColors.flagstate[asset.assetEssentials.flagstate] = this.colors[this.allocatedIndex.flagstate++];
      }
    }
    return this.allocatedColors.flagstate[asset.assetEssentials.flagstate];
  }

  getShipColor(asset: AssetTypes.AssetMovementWithEssentials) {
    switch (this.shipColorLogic) {
      case 'shiptype':
      return this.getShipColorByShiptype(asset);
      case 'oldSystemShiptype':
        return this.getOldSystemShipColor(asset);
      case 'flagstate':
        return this.getShipColorByFlagstate(asset);
      case 'length':
        return this.getShipColorByLength(asset);
      default:
        return '#' + intToRGB(hashCode(asset.assetMovement.asset));
    }
  }

  updateFeatureFromAsset(assetFeature: Feature, asset: AssetTypes.AssetMovementWithEssentials) {
    const currentAssetPosition = [
      asset.assetMovement.movement.location.latitude,
      asset.assetMovement.movement.location.longitude,
      asset.assetMovement.movement.heading,
      asset.assetMovement.decayPercentage,
      typeof asset.assetEssentials === 'undefined'
    ];

    const oldStuff = this.assetLastUpdateHash[asset.assetMovement.asset];
    if(
      oldStuff === undefined ||
      oldStuff[0] !== currentAssetPosition[0] || oldStuff[1] !== currentAssetPosition[1] || oldStuff[2] !== currentAssetPosition[2]
    ) {
      assetFeature.setGeometry(new Point(fromLonLat(
        [asset.assetMovement.movement.location.longitude, asset.assetMovement.movement.location.latitude]
      )));
      const style = assetFeature.getStyle();
      if(Array.isArray(style)) {
        style[0].getImage().setRotation(deg2rad(asset.assetMovement.movement.heading));
      } else {
        style.getImage().setRotation(deg2rad(asset.assetMovement.movement.heading));
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
        asset.assetMovement.movement.speed !== null &&
        this.assetSpeedsPreviouslyRendered[asset.assetMovement.asset] !== asset.assetMovement.movement.speed.toFixed(2)
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
        rotation: deg2rad(asset.assetMovement.movement.heading),
        color: this.getShipColor(asset)
      }));
    }
    return assetFeature;
  }

  getTextStyleForName(asset: AssetTypes.AssetMovementWithEssentials) {
    let text = null;
    let offsetY = 20;
    if (this.namesVisibleCalculated && asset.assetEssentials !== undefined) {
      if( asset.assetEssentials.assetName !== undefined){
        text = asset.assetEssentials.assetName;
      }
      if( asset.assetEssentials.assetName === undefined && asset.assetEssentials.externalMarking !== undefined){
        text = asset.assetEssentials.externalMarking;
      }
    }
    if (this.speedsVisibleCalculated && asset.assetMovement.movement.speed !== null) {
      if (text !== null) {
        text += '\n' + asset.assetMovement.movement.speed.toFixed(2) + ' kts';
        offsetY = 30;
      } else {
        text = asset.assetMovement.movement.speed.toFixed(2) + ' kts';
      }
      this.assetSpeedsPreviouslyRendered[asset.assetMovement.asset] = asset.assetMovement.movement.speed !== null
        ? asset.assetMovement.movement.speed.toFixed(2)
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
