import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';
import { deg2rad, intToRGB, hashCode } from '@app/helpers';

import Map from 'ol/Map';
import { Circle as CircleStyle, Fill, Stroke, Style, Icon, Text } from 'ol/style.js';
import VectorLayer from 'ol/layer/Vector';
// import VectorSource from 'ol/source/Vector';
import { Cluster, Vector as VectorSource } from 'ol/source.js';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
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

  @Input() assets: Array<AssetInterfaces.AssetMovementWithEssentials>;
  @Input() map: Map;
  @Input() namesVisible: boolean;
  @Input() speedsVisible: boolean;
  @Input() shipColorLogic: string;
  @Input() selectedAssets: any;
  @Input() mapZoom: number;
  @Input() selectAsset: (assetId: string) => void;
  @Input() registerOnSelectFunction: (key: string, selectFunction: (event) => void) => void;
  @Input() unregisterOnSelectFunction: (key: string) => void;

  private vectorSource: VectorSource;
  private clusterSource: Cluster;
  private vectorLayer: VectorLayer;
  private layerTitle = 'Asset Layer';
  private namesWereVisibleLastRerender: boolean;
  private speedsWereVisibleLastRerender: boolean;
  private selection: Select;
  private assetSpeedsPreviouslyRendered: { [key: string]: string } = {};
  private assetLastUpdateHash: { [assetId: string]: Array<number>} = {};
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
      renderBuffer: 200,
    });
    this.map.addLayer(this.vectorLayer);
    this.registerOnSelectFunction(this.layerTitle, (event) => {
      if (
        typeof event.selected[0] !== 'undefined' &&
        typeof event.selected[0].id_ !== 'undefined' &&
        this.vectorSource.getFeatureById(event.selected[0].id_) !== null
      ) {
        this.selectAsset(event.selected[0].id_);
      }
    });

    this.vectorSource.addFeatures(this.assets.map((asset) => {
      this.renderedAssetIds[asset.assetMovement.asset] = true;
      return this.createFeatureFromAsset(asset);
    }));

    this.vectorLayer.getSource().changed();
    this.vectorLayer.getSource().refresh();
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
          this.updateImageOnAsset(
            selectedAssetFeature,
            '/assets/arrow_640_rotated_4p_selected.png',
            this.getShipColor({
              assetEssentials: {
                assetId: selectedAsset.asset.id,
                flagstate: selectedAsset.asset.flagStateCode,
                assetName: selectedAsset.asset.name,
                vesselType: selectedAsset.asset.vesselType,
                ircs: selectedAsset.asset.ircs,
                cfr: selectedAsset.asset.cfr,
                externalMarking: selectedAsset.asset.externalMarkin,
                lengthOverAll: selectedAsset.asset.lengthOverAll,
              },
              assetMovement: selectedAsset.currentPosition
            }),
            selectedAsset.currentPosition.microMove.heading
          );

          // We need to reset position to force rerender of asset.
          selectedAssetFeature.setGeometry(new Point(fromLonLat([
            selectedAsset.currentPosition.microMove.location.longitude,
            selectedAsset.currentPosition.microMove.location.latitude
          ])));
        }
      });

      this.previouslySelectedAssetIds.map((previouslySelectedAssetId) => {
        if(!currentlySelectedIds.some((assetId) => assetId === previouslySelectedAssetId)) {
          const previouslySelectedAssetFeature = this.vectorSource.getFeatureById(previouslySelectedAssetId);
          if(typeof previouslySelectedAssetFeature !== 'undefined' && previouslySelectedAssetFeature !== null) {
            const previouslySelectedAsset = this.assets.find((asset) => asset.assetMovement.asset === previouslySelectedAssetId);
            this.updateImageOnAsset(
              previouslySelectedAssetFeature,
              '/assets/arrow_640_rotated_4p.png',
              this.getShipColor(previouslySelectedAsset),
              previouslySelectedAsset.assetMovement.microMove.heading
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

  updateImageOnAsset(assetFeature, src, color, heading) {
    assetFeature.getStyle().setImage(new Icon({
      src,
      scale: 0.8,
      color
    }));
    assetFeature.getStyle().getImage().setOpacity(1);
    assetFeature.getStyle().getImage().setRotation(deg2rad(heading));
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

  createFeatureFromAsset(asset: AssetInterfaces.AssetMovementWithEssentials) {
    const assetMovement = asset.assetMovement;
    const assetEssentials = asset.assetEssentials;
    const assetFeature = new Feature(new Point(fromLonLat([
      assetMovement.microMove.location.longitude, assetMovement.microMove.location.latitude
    ])));

    const styleProperties: any = {
      image: new Icon({
        src: '/assets/arrow_640_rotated_4p.png',
        scale: 0.8,
        color: this.getShipColor(asset)
      })
    };
    if (this.namesVisibleCalculated || this.speedsVisibleCalculated) {
      styleProperties.text = this.getTextStyleForName(asset);
    }

    const assetStyle = new Style(styleProperties);

    assetFeature.setStyle(assetStyle);
    assetFeature.getStyle().getImage().setOpacity(1);
    assetFeature.getStyle().getImage().setRotation(deg2rad(assetMovement.microMove.heading));
    assetFeature.setId(assetMovement.asset);

    const currentAssetPosition = [
      asset.assetMovement.microMove.location.latitude,
      asset.assetMovement.microMove.location.longitude,
      asset.assetMovement.microMove.heading
    ];
    this.assetLastUpdateHash[asset.assetMovement.asset] = currentAssetPosition;
    return assetFeature;
  }

  getShipColor(asset) {
    switch (this.shipColorLogic) {
      case 'Shiptype':
        if(typeof asset.assetEssentials === 'undefined' || asset.assetEssentials.vesselType === null) {
          return '#FFFFFF';
        }
        return '#' + intToRGB(hashCode(asset.assetEssentials.vesselType));
      case 'Flagstate':
        if(typeof asset.assetEssentials === 'undefined' || asset.assetEssentials.flagstate === null) {
          return '#FFFFFF';
        }
        const country = getCountryName(asset.assetEssentials.flagstate, 'en') || asset.assetEssentials.flagstate;
        return '#' + intToRGB(hashCode(country));
      case 'Size (length)':
        if(typeof asset.assetEssentials === 'undefined' || asset.assetEssentials.lengthOverAll === null) {
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

  updateFeatureFromAsset(assetFeature: Feature, asset: AssetInterfaces.AssetMovementWithEssentials) {
    const currentAssetPosition = [
      asset.assetMovement.microMove.location.latitude,
      asset.assetMovement.microMove.location.longitude,
      asset.assetMovement.microMove.heading
    ];
    const oldStuff = this.assetLastUpdateHash[asset.assetMovement.asset];
    if(
      oldStuff === undefined ||
      oldStuff[0] !== currentAssetPosition[0] || oldStuff[1] !== currentAssetPosition[1] || oldStuff[2] !== currentAssetPosition[2]
    ) {
      assetFeature.setGeometry(new Point(fromLonLat(
        [asset.assetMovement.microMove.location.longitude, asset.assetMovement.microMove.location.latitude]
      )));
      assetFeature.getStyle().getImage().setRotation(deg2rad(asset.assetMovement.microMove.heading));
      this.assetLastUpdateHash[asset.assetMovement.asset] = currentAssetPosition;
    }
    if (
      this.namesWereVisibleLastRerender !== this.namesVisibleCalculated ||
      this.speedsWereVisibleLastRerender !== this.speedsVisibleCalculated ||
      (
        this.speedsVisibleCalculated &&
        this.assetSpeedsPreviouslyRendered[asset.assetMovement.asset] !== asset.assetMovement.microMove.speed.toFixed(2)
      )
    ) {
      if (this.namesVisibleCalculated || this.speedsVisibleCalculated) {
        assetFeature.getStyle().setText(this.getTextStyleForName(asset));
      } else {
        assetFeature.getStyle().setText(null);
      }
    }
    return assetFeature;
  }

  getTextStyleForName(asset: AssetInterfaces.AssetMovementWithEssentials) {
    let text = null;
    let offsetY = 20;
    if (this.namesVisibleCalculated && asset.assetEssentials !== undefined) {
      text = asset.assetEssentials.assetName;
    }
    if (this.speedsVisibleCalculated) {
      if (text !== null) {
        text += '\n' + asset.assetMovement.microMove.speed.toFixed(2) + ' kts';
        offsetY = 30;
      } else {
        text = asset.assetMovement.microMove.speed.toFixed(2) + ' kts';
      }
      this.assetSpeedsPreviouslyRendered[asset.assetMovement.asset] = asset.assetMovement.microMove.speed.toFixed(2);
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
