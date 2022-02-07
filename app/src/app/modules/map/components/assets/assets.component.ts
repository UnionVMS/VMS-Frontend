import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { AssetTypes } from '@data/asset';
import { deg2rad, intToRGB, hashCode } from '@app/helpers/helpers';

import Map from 'ol/Map';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style, Icon, Text } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { getName as getCountryName, registerLocale } from 'i18n-iso-countries';
// @ts-ignore
import enLocale from 'i18n-iso-countries/langs/en.json';
registerLocale(enLocale);

@Component({
  selector: 'map-assets',
  template: '',
})
export class AssetsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() assets: Array<AssetTypes.AssetMovementWithAsset>;
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

  private namesVisibleCalculated: boolean;
  private speedsVisibleCalculated: boolean;

  private numberOfVesselsOnPosition: { [position: string]: number} = {};
  private reRenderAssetIds : string[] = [];
  private reRender: boolean;

  private readonly BASE_STYLE : number = 0;
  private readonly TARGET_STYLE : number = 1;

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
      zIndex: 22,
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

  ngOnChanges(change: SimpleChanges) {
    let doChange = false
    if( change.assets ){
      let cur  = JSON.stringify(change.assets.currentValue);
      let prev = JSON.stringify(change.assets.previousValue);
      doChange = cur !== prev;
    }else if( change.mapZoom && this.mapZoom > 10 ) {
      let cur  = JSON.stringify(Math.floor(change.mapZoom.currentValue));
      let prev = JSON.stringify(Math.floor(change.mapZoom.previousValue));
      doChange = cur !== prev;
    }
    if(doChange){
      
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
        let reRenderAssets = Object.keys(this.renderedAssetIds).some((assetId) => assetsToRender[assetId] !== true);

        reRenderAssets = this.reRenderAssetIds ? true : false;
        if(reRenderAssets) {
          this.numberOfVesselsOnPosition = {};
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

        if(reRenderAssets) {

        this.vectorSource.addFeatures(
          this.assets.reduce((acc, asset) => {
            if(this.numberOfVesselsOnPosition && Object.keys(this.numberOfVesselsOnPosition).length > 0 ){
              if(Math.floor(this.mapZoom) > 16 && this.reRenderAssetIds && this.reRenderAssetIds.length > 0){
                this.reRender = true;
              }
              if(Math.floor(this.mapZoom) < 16 && this.reRender){
                this.reRender = false;
              }
            }
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
        reRenderAssets = null;
      };
        this.selectedAssets.map((selectedAsset) => {
          const selectedAssetFeature = this.vectorSource.getFeatureById(selectedAsset.asset.id);
          if(selectedAssetFeature) {
              this.addTargetImageOnAsset(selectedAssetFeature);
              // We need to reset position to force rerender of asset.
              selectedAssetFeature.setGeometry(new Point(fromLonLat([
                selectedAsset.currentPosition.movement.location.longitude,
                selectedAsset.currentPosition.movement.location.latitude
              ])));
          }else{
            this.removeTargetImageOnAsset(selectedAsset.asset.id);
          }
        });

        this.namesWereVisibleLastRerender = this.namesVisibleCalculated;
        this.speedsWereVisibleLastRerender = this.speedsVisibleCalculated;
        this.renderedAssetIds = newRenderedAssetIds;
      }
    }
  }

  addTargetImageOnAsset(assetFeature) {
    let style = assetFeature.getStyle();

    style[this.TARGET_STYLE] = new Style({
      image: new Icon({
        src : '/assets/target.png',
        color: '#FF0000',
        opacity: 1
      })
    });

    assetFeature.setStyle(style);
  }

  removeTargetImageOnAsset(assetFeature) {
    assetFeature.setStyle(assetFeature.getStyle()[this.BASE_STYLE]);
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

  createFeatureFromAsset(asset: AssetTypes.AssetMovementWithAsset) {
    const assetMovement = asset.assetMovement;
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

    const stylePropertiesTarget: any = {
      image: new Icon({
        src: '/assets/target.png',
        opacity: 1,
        color: '#FF0000'
      })
    };
    
    if (this.namesVisibleCalculated || this.speedsVisibleCalculated) {
      styleProperties.text = this.getTextStyleForName(asset);
    }

    const assetBaseStyle = new Style(styleProperties);
    // styleArray always consists of two array indexes
    const styleArray = [assetBaseStyle, new Style()];
    // add target image to style array if asset is selected
    if(this.selectedAssets.length && asset && asset.asset && asset.asset.id){
      this.selectedAssets.forEach(selectedAsset => {
        selectedAsset.asset.id === asset.asset.id ? styleArray[this.TARGET_STYLE] = new Style(stylePropertiesTarget) : null;
      });
    }
    assetFeature.setStyle(styleArray);
    assetFeature.setId(assetMovement.asset);

    if(asset.assetMovement.decayPercentage !== undefined) {
      assetFeature.getStyle()[this.BASE_STYLE].getImage().setOpacity(asset.assetMovement.decayPercentage);
    }

    const currentAssetPosition = [
      asset.assetMovement.movement.location.latitude,
      asset.assetMovement.movement.location.longitude,
      asset.assetMovement.movement.heading,
      asset.assetMovement.decayPercentage,
      typeof asset.asset === 'undefined'
    ];
    this.assetLastUpdateHash[asset.assetMovement.asset] = currentAssetPosition;
    return assetFeature;
  }

  getOldSystemShipColor(asset: AssetTypes.AssetMovementWithAsset) {
    if(
      typeof asset.asset === 'undefined' ||
      asset.asset.vesselType === null ||
      typeof asset.asset.vesselType === 'undefined'
    ) {
      return '#FFFFFF';
    }

    const typeName = asset.asset.vesselType;

    if(typeName === 'Fishing') {
      return '#F1FF62';
    }

    if(['Law Enforcement', 'Military', 'WIG', 'Other'].includes(typeName)) {
      if(typeName === 'Law Enforcement' && asset.asset.name.includes('KBV')) {
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

    if(asset.asset.vesselType === 'No such code : 0') {
      return '#FFFFFF';
    }

    return '#F82ACE';
  }

  getShipColorByLength(asset: AssetTypes.AssetMovementWithAsset) {
    if(
      typeof asset.asset === 'undefined' ||
      asset.asset.lengthOverAll === null ||
      typeof asset.asset.lengthOverAll === 'undefined'
    ) {
      return '#FFFFFF';
    }
    let color;
    if(asset.asset.lengthOverAll < 20) {
      color = (Math.round((asset.asset.lengthOverAll) / 20 * 200) + 55).toString(16).toUpperCase();
      if(color.length === 1) {
        color = `0${color}`;
      }
      return `#${color}0000`;
    } else if(asset.asset.lengthOverAll < 30) {
      color = (Math.round((asset.asset.lengthOverAll - 20) / 10 * 200) + 55).toString(16).toUpperCase();
      if(color.length === 1) {
        color = `0${color}`;
      }
      return `#00${color}00`;
    } else {
      color = ((asset.asset.lengthOverAll - 30) / 10 * 200) + 55;
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

  getShipColorByShiptype(asset: AssetTypes.AssetMovementWithAsset) {
    if(
      typeof asset.asset === 'undefined' ||
      asset.asset.vesselType === null ||
      typeof asset.asset.vesselType === 'undefined' ||
      asset.asset.vesselType === 'No such code : 0'
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

    const vesselType = asset.asset.vesselType.toUpperCase();
    if(typeof this.allocatedColors.shiptype[vesselType] === 'undefined') {
      if(this.allocatedIndex.shiptype + 1 >= this.colors.length) {
        this.allocatedColors.shiptype[vesselType] = '#' + intToRGB(hashCode(vesselType));
      } else {
        this.allocatedColors.shiptype[vesselType] = this.colors[this.allocatedIndex.shiptype++];
      }
    }
    return this.allocatedColors.shiptype[vesselType];
  }

  getShipColorByFlagstate(asset: AssetTypes.AssetMovementWithAsset) {
    if(
      typeof asset.asset === 'undefined' ||
      asset.asset.flagStateCode === null ||
      typeof asset.asset.flagStateCode === 'undefined' ||
      asset.asset.flagStateCode === 'UNK' ||
      asset.asset.flagStateCode === 'ERR'
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

    if(typeof this.allocatedColors.flagstate[asset.asset.flagStateCode] === 'undefined') {
      if(this.allocatedIndex.flagstate + 1 >= this.colors.length) {
        this.allocatedColors.flagstate[asset.asset.flagStateCode] =
          '#' + intToRGB(hashCode(getCountryName(asset.asset.flagStateCode, 'en') || asset.asset.flagStateCode));
      } else {
        this.allocatedColors.flagstate[asset.asset.flagStateCode] = this.colors[this.allocatedIndex.flagstate++];
      }
    }
    return this.allocatedColors.flagstate[asset.asset.flagStateCode];
  }

  getShipColor(asset: AssetTypes.AssetMovementWithAsset) {
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

  updateFeatureFromAsset(assetFeature: Feature, asset: AssetTypes.AssetMovementWithAsset) {
    const currentAssetPosition = [
      asset.assetMovement.movement.location.latitude,
      asset.assetMovement.movement.location.longitude,
      asset.assetMovement.movement.heading,
      asset.assetMovement.decayPercentage,
      typeof asset.asset === 'undefined'
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
      style[this.BASE_STYLE].getImage().setRotation(deg2rad(asset.assetMovement.movement.heading));
      this.assetLastUpdateHash[asset.assetMovement.asset] = currentAssetPosition;
    }
    if(oldStuff === undefined || oldStuff[3] !== currentAssetPosition[3]) {
      assetFeature.getStyle()[this.BASE_STYLE].getImage().setOpacity(asset.assetMovement.decayPercentage);
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
        style[this.BASE_STYLE].setText(this.getTextStyleForName(asset));
      } else {
        style[this.BASE_STYLE].setText(null);
      }
    }
    
    if(oldStuff === undefined || oldStuff[4] !== currentAssetPosition[4]) {
      const style = assetFeature.getStyle();
      let actualStyle = style[this.BASE_STYLE];
      actualStyle.setImage(new Icon({
        src: '/assets/Vessel.png',
        opacity: actualStyle.getImage().getOpacity(),
        rotation: deg2rad(asset.assetMovement.movement.heading),
        color: this.getShipColor(asset)
      }));
    }
    return assetFeature;
  }

  getTextStyleForName(asset: AssetTypes.AssetMovementWithAsset) {
    let text = null;
    let offsetY = 20;
    let currentPosition = asset.assetMovement.movement.location.latitude + '' + ':' +
      asset.assetMovement.movement.location.longitude + '';

    if (this.namesVisibleCalculated && asset.asset !== undefined) {
      if(asset.asset.name !== undefined){
        text = asset.asset.name;
      }
      if(asset.asset.name === undefined && asset.asset.externalMarking !== undefined){
        text = asset.asset.externalMarking;
      }
      if(asset.asset.name === 'NO NAME' 
      && asset.asset.flagStateCode === 'POL'
      && asset.asset.externalMarking !== undefined){
        text = asset.asset.externalMarking;
      }

    // this.numberOfVesselsOnPosition[currentPosition] is used for offsetting text if several assets is in the same location
    if(asset.assetMovement.movement.location.latitude && asset.assetMovement.movement.location.longitude 
      && currentPosition ){
        if(!this.numberOfVesselsOnPosition[currentPosition] ){
          this.numberOfVesselsOnPosition[currentPosition] = 1;
        }else if(this.numberOfVesselsOnPosition[currentPosition] === 1 && Math.floor(this.mapZoom) >= 16){
          offsetY = offsetY + (20 * this.numberOfVesselsOnPosition[currentPosition]);
          this.numberOfVesselsOnPosition[currentPosition] = this.numberOfVesselsOnPosition[currentPosition] + 1;
        }else if(this.numberOfVesselsOnPosition[currentPosition] > 1 && Math.floor(this.mapZoom) >= 16){
          offsetY = offsetY + (20 * this.numberOfVesselsOnPosition[currentPosition]);
          this.numberOfVesselsOnPosition[currentPosition] = this.numberOfVesselsOnPosition[currentPosition] + 1;
          this.reRenderAssetIds.push(asset.asset.id);
        }
      }
    }
    if (this.speedsVisibleCalculated && asset.assetMovement.movement.speed !== null) {
      if (text !== null) {
        text += '\n' + asset.assetMovement.movement.speed.toFixed(2) + ' kts';
        offsetY = offsetY + (10 * this.numberOfVesselsOnPosition[currentPosition]);
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
