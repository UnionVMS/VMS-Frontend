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

  toggleMapLayer(layerName: string) {
    if(!this.activeMapLayers.includes(layerName)) {
      this.addActiveLayerFunction(layerName);
    } else {
      this.removeActiveLayerFunction(layerName);
    }
  }

  toggleOpenStreetMap() {
    if(!this.activeMapLayers.includes('openstreetmap')) {
      this.addActiveLayerFunction('openstreetmap');
    } else {
      this.removeActiveLayerFunction('openstreetmap');
    }
  }
}
