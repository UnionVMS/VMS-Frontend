import { Component, Input, OnInit, OnChanges } from '@angular/core';
import Map from 'ol/Map';

import { formatUnixtime } from '@app/helpers/datetime-formatter';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';
import { AssetTypes } from '@data/asset';

type ExtendedMovement = Readonly<AssetTypes.FullMovement & {
  locationDDM: { latitude: string, longitude: string };
  formattedTimestamp: string;
  formattedSpeed: string,
  formattedOceanRegion: string;
}>;

@Component({
  selector: 'map-asset-poll',
  templateUrl: './asset-poll.component.html',
  styleUrls: ['./asset-poll.component.scss']
})
export class AssetPollComponent implements OnInit, OnChanges {
  @Input() asset: AssetTypes.Asset;
  @Input() polls: ReadonlyArray<AssetTypes.Poll>;
  @Input() pollAsset: (assetId: string, comment: string) => void;
  @Input() getLatestPollsForAsset: (assetId: string) => void;

  public formActive = true;
  public positionsActive = true;

  public extendedPositions: ReadonlyArray<ExtendedMovement>;

  public sourcesToExclude: ReadonlyArray<string> = ['AIS'];

  public ngOnInit() {
    this.getLatestPollsForAsset(this.asset.id);
  }


  public ngOnChanges() {
    // if(typeof this.positions === 'undefined') {
    //   this.extendedPositions = [];
    // } else {
    //   this.extendedPositions = this.positions.map(position => ({
    //     ...position,
    //     locationDDM: convertDDToDDM(position.location.latitude, position.location.longitude, 2),
    //     formattedTimestamp: formatUnixtime(position.timestamp),
    //     formattedSpeed: position.speed.toFixed(2),
    //     formattedOceanRegion: AssetTypes.OceanRegionTranslation[position.sourceSatelliteId]
    //   })).sort((a, b) => {
    //     return b.timestamp - a.timestamp;
    //   });
    // }
  }

  public createManualMovementCurried = (movement: AssetTypes.Movement) => {
    // setTimeout(() => this.getLastFullPositionsForAsset(this.asset.id, 20, this.sourcesToExclude, true), 1000);
    // return this.createManualMovement({
    //   movement,
    //   asset: {
    //     cfr: this.asset.cfr,
    //     ircs: this.asset.ircs
    //   }
    // });
  }

  public trackByPositionId = (position: AssetTypes.FullMovement) =>  {
    return position;
  }

  public toggleFormActive = () => {
    this.formActive = !this.formActive;
  }

  public togglePositionsActive = () => {
    this.positionsActive = !this.positionsActive;
  }
}
