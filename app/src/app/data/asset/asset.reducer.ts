import { Action, createReducer, on } from '@ngrx/store';
import * as AssetActions from './asset.actions';
import * as Interfaces from './asset.interfaces';
import { hashCode } from '@app/helpers/helpers';

export const initialState: Interfaces.State = {
  assetGroups: [],
  selectedAssetGroups: [],
  selectedAssets: [],
  selectedAsset: null,
  assetTrips: {},
  assetTripGranularity: 15,
  assetTripTimestamp: undefined,
  assets: {},
  assetsEssentials: {},
  assetLists: {},
  assetNotSendingIncidents: {},
  currentAssetList: null,
  assetMovements: {},
  assetTracks: {},
  forecasts: [],
  positionsForInspection: {},
  searchQuery: '',
  filterQuery: [],
  unitTonnages: [],
};

const speedSegments = {
  4: '#FF0000',
  8: '#FFA500',
  12: '#0000FF',
  100000: '#00FF00'
};
const speeds = Object.keys(speedSegments).map(speed => parseInt(speed, 10));

export const assetReducer = createReducer(initialState,
  on(AssetActions.addForecast, (state, { assetId }) => ({
    ...state,
    forecasts: [
      ...state.forecasts, assetId
    ].filter((v, i, a) => a.indexOf(v) === i)
  })),
  on(AssetActions.addPositionForInspection, (state, { positionForInspection }) => {
    const positionsForInspectionKeys = Object.keys(state.positionsForInspection).map(index => parseInt(index, 10));
    const key = positionsForInspectionKeys.length === 0 ? 1 : positionsForInspectionKeys[positionsForInspectionKeys.length - 1] + 1;
    return { ...state,
      positionsForInspection: { ...state.positionsForInspection,
        [key]: positionForInspection
      }
    };
  }),
  on(AssetActions.assetMoved, (state, { assetMovement }) => ({
    ...state,
    assetMovements: {
      ...state.assetMovements,
      [assetMovement.asset]: assetMovement
    }
  })),
  on(AssetActions.setAssetPositionsWithoutAffectingTracks, (state, { movementsByAsset }) => ({
    ...state,
    assetMovements: movementsByAsset
  })),
  on(AssetActions.setAssetPositionsFromTripByTimestamp, (state, { assetTripTimestamp }) => ({
    ...state,
    assetTripTimestamp,
    assetMovements: state.assetTrips[assetTripTimestamp]
  })),
  on(AssetActions.assetsMoved, (state, { assetMovements }) => {
    const newAssetMovements = {
      ...state.assetMovements,
      ...assetMovements
    };
    let newAssetTracks = state.assetTracks;
    if(Object.keys(state.assetTracks).length > 0) {
      newAssetTracks = Object.keys(assetMovements).reduce((assetTracks, assetId, index) => {
        if(typeof state.assetTracks[assetId] !== 'undefined') {
          const lineSegments = assetTracks[assetId].lineSegments;
          const lastSegment = lineSegments[lineSegments.length - 1];
          const segmentSpeed = speeds.find((speed) => newAssetMovements[assetId].microMove.speed < speed);

          let newLineSegments = Object.assign([], assetTracks[assetId].lineSegments, {
            [lineSegments.length - 1]: {
              ...lastSegment,
              positions: [ ...lastSegment.positions, newAssetMovements[assetId].microMove.location ]
            }
          });
          if (lastSegment.speed !== segmentSpeed) {
            newLineSegments = [
              ...newLineSegments,
              {
                speed: segmentSpeed,
                positions: [newAssetMovements[assetId].microMove.location],
                color: speedSegments[segmentSpeed]
              }
            ];
          }
          assetTracks[assetId] = {
            ...assetTracks[assetId],
            tracks: [
              ...assetTracks[assetId].tracks,
              assetMovements[assetId].microMove
            ],
            lineSegments: newLineSegments
          };
        }
        return assetTracks;
      }, { ...state.assetTracks });
    }
    return {
      ...state,
      assetMovements: newAssetMovements,
      assetTracks: newAssetTracks
    };
  }),
  on(AssetActions.clearAssetGroup, (state, { assetGroup }) => ({
    ...state,
    selectedAssetGroups: state.selectedAssetGroups.filter((selectedAssetGroup) => selectedAssetGroup.id !== assetGroup.id)
  })),
  on(AssetActions.clearForecasts, (state) => ({ ...state, forecasts: [] })),
  on(AssetActions.clearTracks, (state) => ({ ...state, assetTracks: {}, positionsForInspection: {} })),
  on(AssetActions.clearSelectedAssets, (state) => ({ ...state, selectedAsset: null, selectedAssets: [] })),
  on(AssetActions.deselectAsset, (state, { assetId }) => {
    let selectedAsset = state.selectedAsset;
    const selectedAssets = state.selectedAssets.filter((selectedAssetId) => selectedAssetId !== assetId);
    if(assetId === selectedAsset) {
      selectedAsset = selectedAssets[0];
    }
    return { ...state, selectedAssets, selectedAsset };
  }),
  on(AssetActions.removeAssets, (state, { assetIds }) => {
    const result = Object.values(state.assetMovements).reduce((acc, movement) => {
      if(!assetIds.includes(movement.asset)) {
        acc.assetMovements[movement.asset] = movement;
        if(typeof state.assetTracks[movement.asset] !== 'undefined') {
          acc.assetTracks[movement.asset] = state.assetTracks[movement.asset];
        }
        if(typeof state.assetsEssentials[movement.asset] !== 'undefined') {
          acc.assetsEssentials[movement.asset] = state.assetsEssentials[movement.asset];
        }
        if(typeof state.assets[movement.asset] !== 'undefined') {
          acc.assets[movement.asset] = state.assets[movement.asset];
        }
        if(state.selectedAssets.includes(movement.asset)) {
          acc.selectedAssets = [ ...acc.selectedAssets, movement.asset ];
        }
      }
      return acc;
    }, { assetMovements: {}, assetTracks: {}, assetsEssentials: {}, assets: {}, selectedAssets: []});
    return {
      ...state,
      assetMovements: { ...result.assetMovements },
      assetTracks: { ...result.assetTracks },
      assetsEssentials: { ...result.assetsEssentials },
      assets: { ...result.assets },
      selectedAssets: [ ...result.selectedAssets ]
    };
  }),
  on(AssetActions.removeForecast, (state, { assetId }) => ({
    ...state,
    forecasts: state.forecasts.filter(forecastAssetId => forecastAssetId !== assetId)
  })),
  on(AssetActions.removePositionForInspection, (state, { inspectionId }) => {
    const positionsForInspection = { ...state.positionsForInspection };
    delete positionsForInspection[inspectionId];
    return { ...state,
      positionsForInspection
    };
  }),
  on(AssetActions.removeMovementsAndTracks, (state) => ({
    ...state,
    assetMovements: {},
    assetTracks: {},
  })),
  on(AssetActions.selectAsset, (state, { assetId }) => {
    let returnState = { ...state, selectedAsset: assetId };
    if(!state.selectedAssets.some((selectedAssetId) => selectedAssetId === assetId )) {
      returnState = { ...returnState, selectedAssets: [ ...state.selectedAssets, assetId] };
    }
    return returnState;
  }),
  on(AssetActions.selectIncident, (state, { incident, incidentType }) => {
    let returnState = { ...state, selectedAsset: incident.assetId };
    if(!state.selectedAssets.some((selectedAssetId) => selectedAssetId === incident.assetId )) {
      returnState = { ...returnState, selectedAssets: [ ...state.selectedAssets, incident.assetId] };
    }

    return state;
  }),
  on(AssetActions.setAssetTripGranularity, (state, { assetTripGranularity }) => ({ ...state, assetTripGranularity })),
  on(AssetActions.setAssetTrips, (state, { assetMovements }) => {
    const granularityInSeconds = state.assetTripGranularity * 60;
    const assetTrips = assetMovements.reduce((tripAccumilator, movement) => {
      const timestamps = Object.keys(tripAccumilator);
      const timestampOfMovement = Date.parse(movement.microMove.timestamp) / 1000;
      if(timestamps.length === 0) {
        return { [timestampOfMovement + granularityInSeconds]: { [movement.asset]: movement } };
      } else {
        const lastTimestamp = parseInt(timestamps[timestamps.length - 1], 10);
        if(lastTimestamp >= timestampOfMovement) {
          return { ...tripAccumilator, [lastTimestamp]: {
            ...tripAccumilator[lastTimestamp],
            [movement.asset]: movement
          }};
        } else {
          return { ...tripAccumilator, [timestampOfMovement + granularityInSeconds]: {
            ...tripAccumilator[lastTimestamp],
            [movement.asset]: movement
          }};
        }
      }
    }, {});
    const finalTimestamps = Object.keys(assetTrips);
    const assetTripTimestamp = parseInt(finalTimestamps[finalTimestamps.length - 1], 10);
    return { ...state, assetTrips, assetTripTimestamp };
  }),
  on(AssetActions.setAsset, (state, { asset }) => ({ ...state, assets: { ...state.assets, [asset.id]: asset }})),
  on(AssetActions.setAssetGroup, (state, { assetGroup }) => {
    let newState = { ...state };
    if (!state.selectedAssetGroups.some((selectedAssetGroup) => selectedAssetGroup.id === assetGroup.id)) {
      newState = { ...state, selectedAssetGroups: [ ...state.selectedAssetGroups, assetGroup ]};
    }
    return newState;
  }),
  on(AssetActions.setAssetGroups, (state, { assetGroups }) => ({
    ...state,
    assetGroups
  })),
  on(AssetActions.setAssetList, (state, { searchParams, assets, currentPage, totalNumberOfPages }) => {
    const identifier = `i-${hashCode(JSON.stringify(searchParams))}`;
    return { ...state,
      assets: {
        ...state.assets,
        ...assets
      },
      assetLists: {
        ...state.assetLists,
        [identifier]: {
          resultPages: {
            ...state.assetLists.resultPages,
            [currentPage]: Object.keys(assets)
          },
          totalNumberOfPages,
          pageSize: searchParams.pageSize
        }
      },
      currentAssetList: {
        listIdentifier: identifier,
        currentPage
      }
    };
  }),
  on(AssetActions.setAssetNotSendingIncidents, (state, { assetNotSendingIncidents }) => ({
    ...state,
    assetNotSendingIncidents
  })),
  on(AssetActions.setTracksForAsset, (state, { tracks, assetId }) => {
    const finishedLineSegments = tracks.reduce((lineSegments, position) => {
      const lastSegment = lineSegments[lineSegments.length - 1];
      const segmentSpeed = speeds.find((speed) => position.speed < speed);
      if (lineSegments.length === 0) {
        lineSegments.push({
          speed: segmentSpeed,
          positions: [position.location],
          color: speedSegments[segmentSpeed]
        });
      } else if (lastSegment.speed === segmentSpeed) {
        lastSegment.positions.push(position.location);
      } else {
        // Add the last position in both the old segment and the new so there are no spaces in the drawn line.
        lastSegment.positions.push(position.location);
        lineSegments.push({
          speed: segmentSpeed,
          positions: [position.location],
          color: speedSegments[segmentSpeed]
        });
      }
      return lineSegments;
    }, []);
    return { ...state, assetTracks: {
      ...state.assetTracks,
      [assetId]: { tracks, assetId, lineSegments: finishedLineSegments }
    }};
  }),
  on(AssetActions.setTracks, (state, { tracksByAsset }) => {
    const tracksAndLineSegmentsByAsset = Object.keys(tracksByAsset).reduce((accTracksAndLineSegmentsByAsset, assetId) => {
      const tracksForAsset = tracksByAsset[assetId];
      accTracksAndLineSegmentsByAsset[assetId] = {
        tracks: tracksForAsset,
        assetId,
        lineSegments: tracksForAsset.reduce((lineSegments, position) => {
          const segmentSpeed = speeds.find((speed) => position.speed < speed);
          if (lineSegments.length === 0) {
            lineSegments.push({
              speed: segmentSpeed,
              positions: [position.location],
              color: speedSegments[segmentSpeed]
            });
          } else {
            const lastSegment = lineSegments[lineSegments.length - 1];
            if (lastSegment.speed === segmentSpeed) {
              lastSegment.positions.push(position.location);
            } else {
              // Add the last position in both the old segment and the new so there are no spaces in the drawn line.
              lastSegment.positions.push(position.location);
              lineSegments.push({
                speed: segmentSpeed,
                positions: [position.location],
                color: speedSegments[segmentSpeed]
              });
            }
          }
          return lineSegments;
        }, [])
      };
      return accTracksAndLineSegmentsByAsset;
    }, {});

    return { ...state, assetTracks: {
      ...state.assetTracks,
      ...tracksAndLineSegmentsByAsset
    }};
  }),

  on(AssetActions.setAutocompleteQuery, (state, { searchQuery }) => ({
    ...state,
    searchQuery
  })),
  on(AssetActions.setEssentialProperties, (state, { assetEssentialProperties }) => ({
    ...state,
    assetsEssentials: {
      ...state.assetsEssentials,
      ...assetEssentialProperties
    }
  })),
  on(AssetActions.setFilterQuery, (state, { filterQuery }) => ({
    ...state,
    filterQuery
  })),
  on(AssetActions.setUnitTonnage, (state, { unitTonnages }) => ({
    ...state,
    unitTonnages
  })),
  on(AssetActions.setFullAsset, (state, { asset }) => ({
    ...state,
    assets: {
      ...state.assets,
      [asset.id]: asset
    }
  })),
  on(AssetActions.trimTracksThatPassedTimeCap, (state, { unixtime }) => {
    const newAssetTracks = Object.keys(state.assetTracks).reduce((assetTracks, assetId) => {
      const assetTrack = state.assetTracks[assetId];

      const indexOfFirstPositionAfterGivenTime = assetTrack.tracks.findIndex(
        track => new Date(track.timestamp).getTime() > unixtime
      );
      let newTracks = assetTrack.tracks;
      let newLineSegments = assetTrack.lineSegments;
      if(indexOfFirstPositionAfterGivenTime > 0) {
        newTracks = assetTrack.tracks.slice(indexOfFirstPositionAfterGivenTime);
        let positionsLeftToRemove = indexOfFirstPositionAfterGivenTime;
        // tslint:disable-next-line:no-shadowed-variable
        newLineSegments = assetTrack.lineSegments.reduce((lineSegments, lineSegment) => {
          if(positionsLeftToRemove === 0) {
            lineSegments.push(lineSegment);
          } else if(lineSegment.positions.length < positionsLeftToRemove) {
            positionsLeftToRemove -= lineSegment.positions.length;
          } else {
            lineSegments.push({
              ...lineSegment,
              positions: lineSegment.positions.filter((position, index) => positionsLeftToRemove < index + 1)
            });
            positionsLeftToRemove = 0;
          }
          return lineSegments;
        }, []);
      }
      assetTracks[assetId] = {
        ...state.assetTracks[assetId],
        tracks: newTracks,
        lineSegments: newLineSegments
      };
      return assetTracks;
    }, {});

    return { ...state, assetTracks: newAssetTracks };
  }),
  on(AssetActions.updateDecayOnAssetPosition, (state, { assetMovements }) => {
    return { ...state, assetMovements:  { ...state.assetMovements, ...assetMovements } };
  }),
  on(AssetActions.untrackAsset, (state, { assetId }) => {
    const assetTracks = { ...state.assetTracks };
    delete assetTracks[assetId];
    return { ...state, assetTracks };
  }),
);
