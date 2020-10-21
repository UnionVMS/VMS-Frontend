import { Component, Input, OnInit, OnChanges } from '@angular/core';
import Map from 'ol/Map';

import { formatUnixtime } from '@app/helpers/datetime-formatter';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';
import { AssetTypes } from '@data/asset';
import { MobileTerminalTypes } from '@data/mobile-terminal';

type ExtendedPoll = Readonly<AssetTypes.Poll & {
  formattedTimestamp: string;
  oceanRegions: Array<string>;
  transponder: string;
  identifier: string;
  startDateFormatted: string;
  endDateFormatted: string;
  frequencyFormatted: string;
}>;

@Component({
  selector: 'map-asset-poll-program',
  templateUrl: './asset-poll-program.component.html',
  styleUrls: ['./asset-poll-program.component.scss']
})
export class AssetPollProgramComponent implements OnChanges {
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
    let channel: MobileTerminalTypes.Channel;
    if(this.mobileTerminal) {
      if(this.mobileTerminal.eastAtlanticOceanRegion) { oceanRegions.push('East Atlantic'); }
      if(this.mobileTerminal.indianOceanRegion) { oceanRegions.push('Indian'); }
      if(this.mobileTerminal.pacificOceanRegion) { oceanRegions.push('Pacific'); }
      if(this.mobileTerminal.westAtlanticOceanRegion) { oceanRegions.push('West Atlantic'); }

      channel = this.mobileTerminal.channels.find((iChannel) => this.poll.pollInfo.channelId === iChannel.id);
    }

    const identifier = channel ? channel.dnid + '.' + channel.memberNumber : '';

    const frequencyHours = (this.poll.pollInfo.frequency / 3600);
    const frequencyMinutes = ((this.poll.pollInfo.frequency / 60) % 60);
    let frequency = '';

    if(frequencyHours >= 1) {
      frequency = frequencyHours.toFixed(0) + 'h ';
    }
    if(frequencyMinutes >= 1) {
      frequency += frequencyMinutes.toFixed(0) + 'min';
    }


    this.formattedPoll = {
      ...this.poll,
      formattedTimestamp: formatUnixtime(this.poll.pollInfo.createTime),
      oceanRegions,
      transponder: this.mobileTerminal ? this.mobileTerminal.mobileTerminalType : '',
      identifier,
      startDateFormatted: formatUnixtime(this.poll.pollInfo.startDate),
      endDateFormatted: formatUnixtime(this.poll.pollInfo.endDate),
      frequencyFormatted: frequency,
    };
  }

  public isPollSuccessful(poll: ExtendedPoll) {
    return poll.pollStatus.history[0].status === AssetTypes.PollStatus.SUCCESSFUL;
  }

  public isPollFailedOrTimedOut(poll: ExtendedPoll) {
    return [
      AssetTypes.PollStatus.TIMED_OUT,
      AssetTypes.PollStatus.FAILED
    ].includes(poll.pollStatus.history[0].status);
  }
}
