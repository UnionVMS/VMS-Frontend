import { Component, Input, OnInit, OnChanges } from '@angular/core';
import Map from 'ol/Map';

import { formatUnixtime } from '@app/helpers/datetime-formatter';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';
import { AssetTypes } from '@data/asset';
import { MobileTerminalTypes } from '@data/mobile-terminal';

type ExtendedPoll = Readonly<AssetTypes.Poll & {
  // locationDDM: { latitude: string, longitude: string };
  formattedTimestamp: string;
  formattedHistory: ReadonlyArray<Readonly<{
    status: string,
    formattedStatus: string,
    formattedDate: string
    formattedTime: string
  }>>;
  oceanRegions: Array<string>;
  transponder: string;
  // formattedSpeed: string,
  // formattedOceanRegion: string;
}>;

@Component({
  selector: 'map-asset-poll-manual',
  templateUrl: './asset-poll-manual.component.html',
  styleUrls: ['./asset-poll-manual.component.scss']
})
export class AssetPollManualComponent implements OnChanges {
  @Input() poll: AssetTypes.Poll;
  @Input() mobileTerminal: MobileTerminalTypes.MobileTerminal;
  @Input() index: number;
  @Input() userTimezone: string; // Ensure the component is updated when the timezone changes.

  public formActive = true;
  public pollsActive = true;

  public formattedPoll: ExtendedPoll;
  public expanded = false;

  public ngOnChanges() {
    const oceanRegions = [];
    if(this.mobileTerminal) {
      if(this.mobileTerminal.eastAtlanticOceanRegion) { oceanRegions.push('East Atlantic'); }
      if(this.mobileTerminal.indianOceanRegion) { oceanRegions.push('Indian'); }
      if(this.mobileTerminal.pacificOceanRegion) { oceanRegions.push('Pacific'); }
      if(this.mobileTerminal.westAtlanticOceanRegion) { oceanRegions.push('West Atlantic'); }
    }

    this.formattedPoll = {
      ...this.poll,
      formattedTimestamp: formatUnixtime(this.poll.pollInfo.updateTime),
      formattedHistory: this.poll.pollStatus.history.map((historyRow) => {
        const formattedTimestamp = formatUnixtime(historyRow.timestamp).split(' ');
        return {
          status: historyRow.status,
          formattedStatus: (historyRow.status.charAt(0) + historyRow.status.slice(1).toLowerCase()).replace('_', ' '),
          formattedDate: formattedTimestamp[0],
          formattedTime: formattedTimestamp[1]
        };
      }),
      oceanRegions,
      transponder: this.mobileTerminal ? this.mobileTerminal.mobileTerminalType : ''
      // locationDDM: convertDDToDDM(position.location.latitude, position.location.longitude, 2),
      // formattedSpeed: position.speed.toFixed(2),
      // formattedOceanRegion: AssetTypes.OceanRegionTranslation[position.sourceSatelliteId]
    };
  }

  public isPollSuccessful(poll: ExtendedPoll) {
    return poll.pollStatus.history[0].status === AssetTypes.PollStatus.SUCCESSFUL;
  }
}
