import { Component, Input, OnInit, OnChanges } from '@angular/core';
import Map from 'ol/Map';

import { formatUnixtime } from '@app/helpers/datetime-formatter';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';
import { AssetTypes } from '@data/asset';
import { MobileTerminalTypes } from '@data/mobile-terminal';

@Component({
  selector: 'map-asset-poll',
  templateUrl: './asset-poll.component.html',
  styleUrls: ['./asset-poll.component.scss']
})
export class AssetPollComponent implements OnInit, OnChanges {
  @Input() asset: AssetTypes.Asset;
  @Input() polls: ReadonlyArray<AssetTypes.Poll>;
  @Input() pollAsset: (assetId: string, pollPostObject: AssetTypes.PollPostObject) => void;
  @Input() getLatestPollsForAsset: (assetId: string) => void;
  @Input() mobileTerminals: Readonly<{ [mobileTerminalId: string]: MobileTerminalTypes.MobileTerminal }>;

  public formActive = true;
  public pollsActive = true;

  public sortedPolls: ReadonlyArray<AssetTypes.Poll>;
  public pollsExpanded: ReadonlyArray<string> = [];

  public ngOnInit() {
    this.getLatestPollsForAsset(this.asset.id);
  }

  public ngOnChanges() {
    if(typeof this.polls === 'undefined') {
      this.sortedPolls = [];
    } else {
      this.sortedPolls = [ ...this.polls ].sort((a, b) => {
        return b.pollInfo.updateTime - a.pollInfo.updateTime;
      });
    }
  }

  public trackByPollId = (index: number, poll: AssetTypes.Poll) =>  {
    return poll.pollInfo.id;
  }

  public toggleFormActive = () => {
    this.formActive = !this.formActive;
  }

  public togglePollsActive = () => {
    this.pollsActive = !this.pollsActive;
  }

  public isProgramPoll = (poll: AssetTypes.Poll) => {
    return poll.pollInfo.pollTypeEnum === AssetTypes.PollType.PROGRAM_POLL;
  }
}
