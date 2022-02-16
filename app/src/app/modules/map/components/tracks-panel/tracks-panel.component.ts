import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { formatUnixtimeSeconds } from '@app/helpers/datetime-formatter';
import { compareTableSortNumber, compareTableSortString } from '@app/helpers/helpers';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';
import { ActivityTypes } from '@data/activity';
import { AssetTypes } from '@data/asset';

type ExtendedTrack = Readonly<{
  id: string;
  timestamp: number;
  formattedTimestamp: string;
  latitude: number;
  longitude: number;
  locationDDM: {
    latitude: string;
    longitude: string;
  }
  speed: number | null;
  formattedSpeed: string;
  formattedCalculatedSpeed?: string;
  heading: number | null;
  type: string;
  oceanRegion?: string;
  movement?: AssetTypes.Movement;
  activity?: ActivityTypes.Activity;
}>;

@Component({
  selector: 'map-tracks-panel',
  templateUrl: './tracks-panel.component.html',
  styleUrls: ['./tracks-panel.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TracksPanelComponent implements OnChanges {

  @Input() track: Readonly<AssetTypes.AssetTrack>;
  @Input() activityTracks: { [assetId: string]: ReadonlyArray<ActivityTypes.Activity> };
  @Input() selectedMovement: string;
  @Input() selectMovement: (movementId: string) => void;
  @Input() selectedActivity: string;
  @Input() selectActivity: (activityId: string) => void;
  @Input() panelExpanded: boolean;
  @Input() userTimezone: string; // Ensure the component is updated when the timezone changes.

  public formattedTrack: ReadonlyArray<ExtendedTrack>;
  public sortedTrack: Array<ExtendedTrack>;
  public sortedAndPaginatedTrack: ReadonlyArray<ExtendedTrack>;
  public expandedElement: ExtendedTrack | null;

  public displayedColumns: string[] = ['timestamp', 'type'];

  public showVms: boolean = true;
  public hasVms: boolean = false;
  public showAis: boolean = true;
  public hasAis: boolean = false;
  public showActivities: boolean = true;
  public hasActivities: boolean = false;

  private defaultSorting: Sort = { active: 'timestamp', direction: 'desc' };
  public currentSorting: Sort = this.defaultSorting;

  private latestPanelExpanded: boolean;
  private currentPageSize: number = 100;
  private currentPageIndex: number = 1;

  ngOnChanges() {
    if(this.panelExpanded) {
      this.displayedColumns = ['timestamp', 'latitude', 'longitude', 'speed', 'heading', 'type'];
    } else {
      this.displayedColumns = ['timestamp', 'type'];
    }
    if (this.latestPanelExpanded !== this.panelExpanded) {
      this.expandedElement = null;
      this.currentSorting = this.defaultSorting;
    }
    this.latestPanelExpanded = this.panelExpanded;
    if(typeof this.track === 'undefined' || typeof this.track.tracks === 'undefined') {
      this.formattedTrack = [];
    } else {
      this.formattedTrack = this.track.tracks.map(position => ({
        id: position.id,
        timestamp: position.timestamp,
        formattedTimestamp: formatUnixtimeSeconds(position.timestamp),
        latitude: position.location.latitude,
        longitude: position.location.longitude,
        locationDDM: convertDDToDDM(position.location.latitude, position.location.longitude, 2),
        speed: position.speed,
        formattedSpeed: typeof position.speed === 'number' ? position.speed.toFixed(2) : '',
        heading: position.heading,
        formattedCalculatedSpeed: typeof position.calculatedSpeed === 'number' ? position.speed.toFixed(2) : '',
        oceanRegion: AssetTypes.OceanRegionTranslation[position.sourceSatelliteId],
        type: position.source === 'AIS' ? position.source : 'VMS',
        movement: position
      }));
      if (typeof this.activityTracks[this.track.assetId] !== 'undefined') {
        const activities: ReadonlyArray<ExtendedTrack> = this.activityTracks[this.track.assetId].reduce((acc, activity) => {
          if (activity.relatedActivities.length > 0) {
            acc = acc.concat(activity.relatedActivities.map(relatedActivity => ({
              id: activity.faReportID + '-' + relatedActivity.activityType,
              timestamp: relatedActivity.occurence,
              formattedTimestamp: formatUnixtimeSeconds(relatedActivity.occurence),
              latitude: relatedActivity.latitude,
              longitude: relatedActivity.longitude,
              locationDDM: convertDDToDDM(relatedActivity.latitude, relatedActivity.longitude, 2),
              speed: null,
              formattedSpeed: '',
              heading: null,
              type: relatedActivity.activityType.toLowerCase().replace(/^_*(.)|_+(.)/g, (s, c, d) => c ? c.toUpperCase() : ' ' + d.toUpperCase()),
              activity: activity
            })))
          } else {
            acc.push({
              id: activity.faReportID + '-' + activity.activityType,
              timestamp: activity.startDate,
              formattedTimestamp: formatUnixtimeSeconds(activity.startDate),
              latitude: activity.latitude ? activity.latitude : 0,
              longitude: activity.longitude ? activity.longitude : 0,
              locationDDM: convertDDToDDM(activity.latitude, activity.longitude, 2),
              speed: null,
              formattedSpeed: '',
              heading: null,
              type: activity.activityType.toLowerCase().replace(/^_*(.)|_+(.)/g, (s, c, d) => c ? c.toUpperCase() : ' ' + d.toUpperCase()),
              activity: activity
            });
          }
          return acc;
        }, []);
        this.formattedTrack = this.formattedTrack.concat(activities);
      }
      this.hasVms = this.formattedTrack.some(position => position.type === 'VMS');
      this.hasAis = this.formattedTrack.some(position => position.type === 'AIS');
      this.hasActivities = this.formattedTrack.some(position => position.type !== 'VMS' && position.type !== 'AIS');
      this.sortAndFilterData(this.currentSorting);
    }
  }

  sortAndFilterData(sort: Sort) {
    this.currentSorting = sort;
    const positions = this.formattedTrack.slice();

    const filteredPositions = positions.filter(position =>
      this.showVms && position.type === 'VMS' ||
      this.showAis && position.type == 'AIS' ||
      this.showActivities && position.type != 'VMS' && position.type != 'AIS'
    );

    if (!sort.active || sort.direction === '') {
      this.sortedTrack = filteredPositions;
      return;
    }

    this.sortedTrack = filteredPositions.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'timestamp': return compareTableSortNumber(a.timestamp, b.timestamp, isAsc);
        case 'latitude': return compareTableSortNumber(a.latitude, b.latitude, isAsc);
        case 'longitude': return compareTableSortNumber(a.longitude, b.longitude, isAsc);
        case 'speed': return compareTableSortNumber(a.speed, b.speed, isAsc);
        case 'heading': return compareTableSortNumber(a.heading, b.heading, isAsc);
        case 'type': return compareTableSortString(a.type, b.type, isAsc);
        default: return 0;
      }
    });
    const track = this.sortedTrack.slice();
    this.sortedAndPaginatedTrack = track.splice((this.currentPageIndex - 1) * this.currentPageSize, this.currentPageSize );
  }

  selectRow(row: ExtendedTrack) {
    if (typeof row.movement !== 'undefined') {
      this.selectMovement(row.id);
    } else if (row.latitude !== 0 && row.longitude !== 0) {
      this.selectActivity(row.id);
    }
  }

  unselectRow(row: ExtendedTrack) {
    if (typeof row.movement !== 'undefined') {
      this.selectMovement(null);
    } else {
      this.selectActivity(null);
    }
  }

  formatDate(dateTime: number) {
    return formatUnixtimeSeconds(dateTime);
  }

  selectPage(event: PageEvent) {
    this.currentPageIndex = event.pageIndex;
    this.currentPageSize = event.pageSize;
    const track = this.sortedTrack.slice();
    this.sortedAndPaginatedTrack = track.splice((event.pageIndex - 1) * event.pageSize, event.pageSize );
  }
}
