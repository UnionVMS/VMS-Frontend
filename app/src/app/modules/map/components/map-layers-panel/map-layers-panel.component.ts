import { Component, Input, ViewEncapsulation } from '@angular/core';
import { MapLayersTypes } from '@data/map-layers';

@Component({
  selector: 'map-layers-panel',
  templateUrl: './map-layers-panel.component.html',
  styleUrls: ['./map-layers-panel.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MapLayersPanelComponent {

  @Input() activeMapLayers: Array<string>;
  @Input() mapLayers: Array<MapLayersTypes.MapLayer>;
  @Input() cascadedLayers: Array<MapLayersTypes.CascadedLayer>;
  @Input() addActiveLayerFunction: (layerName: string) => void;
  @Input() removeActiveLayerFunction: (layerName: string) => void;

  toggleMapLayer(mapLayer: MapLayersTypes.MapLayer) {
    if(!this.activeMapLayers.includes(mapLayer.typeName)) {
      this.addActiveLayerFunction(mapLayer.typeName);
    } else {
      this.removeActiveLayerFunction(mapLayer.typeName);
    }
  }

  toggleOpenStreetMap() {
    if(!this.activeMapLayers.includes('openstreetmap')) {
      this.addActiveLayerFunction('openstreetmap');
    } else {
      this.removeActiveLayerFunction('openstreetmap');
    }
  }

  toggleCascadedLayer(layer: MapLayersTypes.CascadedLayer) {
    if(!this.activeMapLayers.includes(layer.name)) {
      this.addActiveLayerFunction(layer.name);
    } else {
      this.removeActiveLayerFunction(layer.name);
    }
  }
}
