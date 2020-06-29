import { Action, createReducer, on } from '@ngrx/store';
import { v4 as uuidv4 } from 'uuid';

import * as AssetActions from './asset.actions';
import * as Types from './asset.types';
import { TimePosition } from '@data/generic.types';
import { hashCode } from '@app/helpers/helpers';

export const initialState: Types.State = {
  selectedAssets: [],
  selectedAsset: null,
  assetTrips: {},
  assetTripGranularity: 15,
  assetTripTimestamp: undefined,
  assets: {},
  assetsEssentials: {},
  assetLists: {},
  currentAssetList: null,
  lastUserAssetSearch: null,
  assetMovements: {},
  assetTracks: {},
  lastFullPositions: {},
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
    const newAssetMovements = Object.keys(assetMovements).reduce((rNewAssetMovements, assetId) => {
      if(
        typeof rNewAssetMovements[assetId] === 'undefined' ||
        assetMovements[assetId].microMove.timestamp > rNewAssetMovements[assetId].microMove.timestamp
      ) {
        // Instead of spreading the object and making new instances we have to mutate the object inside this reduce-function
        // Otherwise we take a performance hit that make the map go from 3 ms loadtime to 6 seconds loadtime.
        rNewAssetMovements[assetId] = assetMovements[assetId];
      }
      return rNewAssetMovements;
    }, { ...state.assetMovements });

    let newAssetTracks = state.assetTracks;
    if(Object.keys(state.assetTracks).length > 0) {
      newAssetTracks = Object.keys(assetMovements).reduce((assetTracks, assetId, index) => {
        // Notice: In this function we loop reversed since we know that the positions is going to be added to the end of the
        // sections the majority of the time.
        // We also have to do some consessions to not using immutabilty to be able to preform some of the operations
        // Effectivley enough since we are lacking the tools to do it the correct efficently enough for the page not to slow down.
        // Maybe it would be better to add a new dependency such as lodash?
        if(
          typeof state.assetTracks[assetId] !== 'undefined' &&
          typeof assetTracks[assetId].sources !== 'undefined' &&
          (
            assetTracks[assetId].sources.length === 0 ||
            assetTracks[assetId].sources.includes(assetMovements[assetId].microMove.source)
          )
        ) {
          const lineSegments = assetTracks[assetId].lineSegments;
          const segmentSpeed = speeds.find((speed) => assetMovements[assetId].microMove.speed < speed);

          const timePosition = { ...assetMovements[assetId].microMove.location, time: assetMovements[assetId].microMove.timestamp };

          const reverseIndexs = assetTracks[assetId].lineSegments.slice().reverse().reduce((acc, lineSegment, segmentReverseIndex) => {
            if(typeof acc.positionReverseIndex !== 'undefined') {
              return acc;
            }
            const positionReverseIndex = lineSegment.positions.slice().reverse().findIndex(
              (position) => position.time < timePosition.time
            );
            if(positionReverseIndex !== -1) {
              return { segmentReverseIndex, positionReverseIndex };
            }

            return acc;
          }, {} as { segmentReverseIndex: number, positionReverseIndex: number } );

          let newLineSegments = assetTracks[assetId].lineSegments as ReadonlyArray<Types.LineSegment>;

          const segmentIndex = newLineSegments.length - 1 - reverseIndexs.segmentReverseIndex;
          const positionIndex = newLineSegments[segmentIndex].positions.length - reverseIndexs.positionReverseIndex;

          newLineSegments = Object.assign([], newLineSegments, {
            [segmentIndex]: {
              ...newLineSegments[segmentIndex],
              positions: [
                ...newLineSegments[segmentIndex].positions.slice(0, positionIndex),
                timePosition,
                ...newLineSegments[segmentIndex].positions.slice(positionIndex)
              ]
            }
          });

          if (newLineSegments[segmentIndex].speed !== segmentSpeed) {
            const mutateableSegmentsArray = newLineSegments.slice();
            mutateableSegmentsArray.splice(segmentIndex, 1, {
              ...newLineSegments[segmentIndex],
              positions: newLineSegments[segmentIndex].positions.slice(0, positionIndex)
            });
            mutateableSegmentsArray.splice(segmentIndex + 1, 0, {
              id: uuidv4(),
              speed: segmentSpeed,
              positions: newLineSegments[segmentIndex].positions.slice(positionIndex - 1, positionIndex + 1),
              color: speedSegments[segmentSpeed]
            });
            if(reverseIndexs.positionReverseIndex !== 0) {
              mutateableSegmentsArray.splice(segmentIndex + 2, 0, {
                ...newLineSegments[segmentIndex],
                id: uuidv4(),
                positions: newLineSegments[segmentIndex].positions.slice(positionIndex)
              });
            }
            newLineSegments = mutateableSegmentsArray.slice();
          }

          const trackIndex = assetTracks[assetId].tracks.length - assetTracks[assetId].tracks.slice().reverse().findIndex(
            (position) => position.timestamp < assetMovements[assetId].microMove.timestamp
          );

          assetTracks[assetId] = {
            ...assetTracks[assetId],
            tracks: [
              ...assetTracks[assetId].tracks.slice(0, trackIndex),
              assetMovements[assetId].microMove,
              ...assetTracks[assetId].tracks.slice(trackIndex),
            ],
            lineSegments: newLineSegments,
            lastAddedTracks: [
              ...assetTracks[assetId].lastAddedTracks,
              assetMovements[assetId].microMove
            ]
          };
        }
        return assetTracks;
      }, {
        // Clear all lastAddedTracks so we can fill it upp again with the new stuff.
        ...Object.keys(state.assetTracks).reduce((acc, assetId) => ({
          ...acc,
          [assetId]: {
            ...state.assetTracks[assetId],
            lastAddedTracks: []
          }
        }), {})
      });
    }

    return {
      ...state,
      assetMovements: newAssetMovements,
      assetTracks: newAssetTracks
    };
  }),
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
  on(AssetActions.removeTracks, (state) => ({
    ...state,
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
      const timestampOfMovement = movement.microMove.timestamp;
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
  on(AssetActions.setAssetList, (state, { searchQuery, assets, userSearch }) => {
    const identifier = `i-${hashCode(JSON.stringify(searchQuery))}`;
    return { ...state,
      assets: {
        ...state.assets,
        ...assets
      },
      assetLists: {
        ...state.assetLists,
        [identifier]: {
          searchQuery,
          assets: Object.keys(assets)
        }
      },
      currentAssetList: identifier,
      lastUserAssetSearch: userSearch ? identifier : state.lastUserAssetSearch
    };
  }),
  on(AssetActions.setCurrentAssetList, (state, { assetListIdentifier }) => ({
    ...state,
    currentAssetList: assetListIdentifier
  })),
  on(AssetActions.setLastFullPositions, (state, { fullPositionsByAsset }) => ({
    ...state,
    lastFullPositions: {
      ...state.lastFullPositions,
      ...fullPositionsByAsset
    }
  })),
  on(AssetActions.setTracksForAsset, (state, { tracks, assetId, sources }) => {
    const finishedLineSegments = tracks.reduce((lineSegments, position) => {
      const lastSegment = lineSegments[lineSegments.length - 1];
      const segmentSpeed = speeds.find((speed) => position.speed < speed);
      const timePosition = { ...position.location, time: position.timestamp };
      if (lineSegments.length === 0) {
        lineSegments = [{
          id: uuidv4(),
          speed: segmentSpeed,
          positions: [ timePosition],
          color: speedSegments[segmentSpeed]
        }];
      } else if (lastSegment.speed === segmentSpeed) {
        lastSegment.positions.push(timePosition);
      } else {
        // Add the last position in both the old segment and the new so there are no spaces in the drawn line.
        lastSegment.positions.push(timePosition);
        lineSegments.push({
          id: uuidv4(),
          speed: segmentSpeed,
          positions: [timePosition],
          color: speedSegments[segmentSpeed]
        });
      }
      return lineSegments;
    }, []);
    return { ...state, assetTracks: {
      ...state.assetTracks,
      [assetId]: { tracks, assetId, sources, lineSegments: finishedLineSegments, lastAddedTracks: tracks }
    }};
  }),
  on(AssetActions.setTracks, (state, { tracksByAsset }) => {
    const tracksAndLineSegmentsByAsset = Object.keys(tracksByAsset).reduce((accTracksAndLineSegmentsByAsset, assetId) => {
      const tracksForAsset = tracksByAsset[assetId];
      accTracksAndLineSegmentsByAsset[assetId] = {
        tracks: tracksForAsset,
        assetId,
        lastAddedTracks: tracksForAsset,
        lineSegments: tracksForAsset.reduce((lineSegments, position) => {
          const segmentSpeed = speeds.find((speed) => position.speed < speed);
          const timePosition = { ...position.location, time: position.timestamp };
          if (lineSegments.length === 0) {
            lineSegments.push({
              id: uuidv4(),
              speed: segmentSpeed,
              positions: [timePosition],
              color: speedSegments[segmentSpeed]
            });
          } else {
            const lastSegment = lineSegments[lineSegments.length - 1];
            if (lastSegment.speed === segmentSpeed) {
              lastSegment.positions.push(timePosition);
            } else {
              // Add the last position in both the old segment and the new so there are no spaces in the drawn line.
              lastSegment.positions.push(timePosition);
              lineSegments.push({
                id: uuidv4(),
                speed: segmentSpeed,
                positions: [timePosition],
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
        track => track.timestamp > unixtime
      );

      let newTracks = [ ...assetTrack.tracks ];
      let newLineSegments = [ ...assetTrack.lineSegments ];
      if(indexOfFirstPositionAfterGivenTime > 0) {
        newTracks = assetTrack.tracks.slice(indexOfFirstPositionAfterGivenTime);
        let filteringDone = false;
        // tslint:disable-next-line:no-shadowed-variable
        newLineSegments = assetTrack.lineSegments.reduce((
          lineSegments: ReadonlyArray<Types.LineSegment>,
          lineSegment: Types.LineSegment
        ) => {
          if(!filteringDone) {
            const newLineSegment = {
              ...lineSegment,
              positions: lineSegment.positions.filter((timePosition: TimePosition) => timePosition.time > unixtime)
            };

            if(newLineSegment.positions.length !== 0) {
              lineSegments = [ ...lineSegments, newLineSegment ];
              if(newLineSegment.positions.length === lineSegment.positions.length) {
                filteringDone = true;
              }
            }
          } else {
            lineSegments = [ ...lineSegments, lineSegment ];
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
