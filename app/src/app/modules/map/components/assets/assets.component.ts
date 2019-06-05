import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';
import { deg2rad, intToRGB, hashCode } from '@app/helpers';

import Map from 'ol/Map';
import { Fill, Stroke, Style, Icon, Text } from 'ol/style.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import Select from 'ol/interaction/Select.js';

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
  @Input() selectedAsset: any;
  // tslint:disable:ban-types
  @Input() selectAsset: Function;
  @Input() registerOnClickFunction: Function;
  @Input() unregisterOnClickFunction: Function;
  // tslint:enable:ban-types

  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer;
  private layerTitle = 'Asset Layer';
  private namesWereVisibleLastRerender: boolean;
  private speedsWereVisibleLastRerender: boolean;
  private selection: Select;
  private assetSpeedsPreviouslyRendered: { [key: string]: string } = {};
  private renderedAssetIds: Array<string> = [];
  private previouslySelectedAssetId = '';
  private i = 0;

  ngOnInit() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      title: this.layerTitle,
      source: this.vectorSource,
      renderBuffer: 200
    });
    this.map.addLayer(this.vectorLayer);
    this.registerOnClickFunction(this.layerTitle, (event) => {
      if (
        typeof event.selected[0] !== 'undefined' &&
        this.vectorSource.getFeatureById(event.selected[0].id_) !== null
      ) {
        this.selectAsset(event.selected[0].id_);
      }
    });

    this.vectorSource.addFeatures(this.assets.map((asset) => {
      this.renderedAssetIds.push(asset.assetMovement.asset);
      return this.createFeatureFromAsset(asset);
    }));

    this.vectorLayer.getSource().changed();
    this.vectorLayer.getSource().refresh();
  }

  ngOnChanges() {
    // ngOnChange runs before ngOnInit when component mounts, we don't want to run this code then, only on updates.
    if (typeof this.vectorSource !== 'undefined') {
      const newRenderedAssetIds = [];
      this.renderedAssetIds.map((assetId) => {
        if(!this.assets.find((asset) => asset.assetMovement.asset === assetId)) {
          this.removeAsset(assetId);
        } else {
          newRenderedAssetIds.push(assetId);
        }
      });
      this.vectorSource.addFeatures(
        this.assets.reduce((acc, asset) => {
          if(newRenderedAssetIds.indexOf(asset.assetMovement.asset) === -1) {
            newRenderedAssetIds.push(asset.assetMovement.asset);
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

      if(typeof this.selectedAsset.asset !== 'undefined' && this.previouslySelectedAssetId !== this.selectedAsset.asset.id) {
        const previouslySelectedAssetFeature = this.vectorSource.getFeatureById(this.previouslySelectedAssetId);
        if(typeof previouslySelectedAssetFeature !== 'undefined' && previouslySelectedAssetFeature !== null) {
          const previouslySelectedAsset = this.assets.find((asset) => asset.assetEssentials.assetId === this.previouslySelectedAssetId);
          this.updateImageOnAsset(
            previouslySelectedAssetFeature,
            '/assets/arrow_640_rotated_4p.png',
            this.getShipColor(previouslySelectedAsset),
            previouslySelectedAsset.assetMovement.microMove.heading
          );
        }

        const selectedAsset = this.vectorSource.getFeatureById(this.selectedAsset.asset.id);
        this.updateImageOnAsset(
          selectedAsset,
          '/assets/arrow_640_rotated_4p_selected.png',
          this.getShipColor({ assetEssentials: this.selectedAsset.asset }),
          this.selectedAsset.currentPosition.microMove.heading
        );

        this.previouslySelectedAssetId = this.selectedAsset.asset.id;
      }

      this.vectorLayer.getSource().changed();
      this.vectorLayer.getSource().refresh();
      this.namesWereVisibleLastRerender = this.namesVisible;
      this.speedsWereVisibleLastRerender = this.speedsVisible;
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
    this.unregisterOnClickFunction(this.layerTitle);
    this.map.removeLayer(this.vectorLayer);
  }

  removeAsset(assetId) {
    this.vectorSource.getFeatures().map((feature) => {
      if(feature.getId().includes(assetId)) {
        this.vectorSource.removeFeature(feature);
      }
    });
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
    if (this.namesVisible || this.speedsVisible) {
      styleProperties.text = this.getTextStyleForName(asset);
    }

    const assetStyle = new Style(styleProperties);

    assetFeature.setStyle(assetStyle);
    assetFeature.getStyle().getImage().setOpacity(1);
    assetFeature.getStyle().getImage().setRotation(deg2rad(assetMovement.microMove.heading));
    assetFeature.setId(assetMovement.asset);
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
        return '#' + intToRGB(hashCode(asset.assetEssentials.flagstate));
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
    assetFeature.setGeometry(new Point(fromLonLat([
      asset.assetMovement.microMove.location.longitude, asset.assetMovement.microMove.location.latitude
    ])));
    assetFeature.getStyle().getImage().setRotation(deg2rad(asset.assetMovement.microMove.heading));
    if (
      this.namesWereVisibleLastRerender !== this.namesVisible ||
      this.speedsWereVisibleLastRerender !== this.speedsVisible ||
      (
        this.speedsVisible &&
        this.assetSpeedsPreviouslyRendered[asset.assetMovement.asset] !== asset.assetMovement.microMove.speed.toFixed(2)
      )
    ) {
      if (this.namesVisible || this.speedsVisible) {
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
    if (this.namesVisible) {
      text = asset.assetEssentials.assetName;
    }
    if (this.speedsVisible) {
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
        width: 2
      }),
      offsetY,
      text
    });
  }

}
