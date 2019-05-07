import { Action } from '@ngrx/store';
import { ActionTypes } from './asset.actions';
import * as Interfaces from './asset.interfaces';

export const initialState: Interfaces.State = {
  selectedAsset: null,
  assets: {},
  assetMovements: {},
  assetTracks: {},
  forecasts: [],
  positionsForInspection: {},
  searchQuery: '',
  filterQuery: '',
};

const speedSegments = {
  4: '#00FF00',
  8: '#0000FF',
  12: '#FFA500',
  100000: '#FF0000'
};
const speeds = Object.keys(speedSegments).map(speed => parseInt(speed, 10));

export function assetReducer(state = initialState, { type, payload }) {
  switch (type) {
    case ActionTypes.SetAutocompleteQuery:
      return { ...state, searchQuery: payload.searchQuery };

    case ActionTypes.SetFilterQuery:
      return { ...state, filterQuery: payload.filterQuery };

    case ActionTypes.AssetMoved:
      return { ...state, assetMovements: {
        ...state.assetMovements,
        [payload.asset]: payload
      } };

    case ActionTypes.AssetsMoved:
      const newState = { ...state, assetMovements: {
        ...state.assetMovements,
        ...payload
      } };
      Object.keys(payload).map((assetId) => {
        if(typeof newState.assetTracks[assetId] !== 'undefined') {
          newState.assetTracks[assetId].tracks.push(payload[assetId].microMove);
          // tslint:disable-next-line:no-shadowed-variable
          const lineSegments = newState.assetTracks[assetId].lineSegments;
          const lastSegment = lineSegments[lineSegments.length - 1];
          const segmentSpeed = speeds.find((speed) => newState.assetMovements[assetId].microMove.speed < speed);
          // Add the last position in last segment eiter way so there is no spaces in the draw line.
          lastSegment.positions.push(newState.assetMovements[assetId].microMove.location);
          if (lastSegment.speed !== segmentSpeed) {
            lineSegments.push({
              speed: segmentSpeed,
              positions: [newState.assetMovements[assetId].microMove.location],
              color: speedSegments[segmentSpeed]
            });
          }
        }
      });
      return newState;

    case ActionTypes.TrimTracksThatPassedTimeCap:
      // tslint:disable-next-line:no-shadowed-variable
      const newAssetTracks = Object.keys(state.assetTracks).reduce((assetTracks, assetId) => {
        const assetTrack = state.assetTracks[assetId];
        const indexOfFirstPositionAfterGivenTime = assetTrack.tracks.findIndex(
          track => new Date(track.timestamp).getTime() > payload.unixtime
        );
        if(indexOfFirstPositionAfterGivenTime > 0) {
          assetTrack.tracks = assetTrack.tracks.slice(indexOfFirstPositionAfterGivenTime);
          let positionsLeftToRemove = indexOfFirstPositionAfterGivenTime;
          // tslint:disable-next-line:no-shadowed-variable
          assetTrack.lineSegments = assetTrack.lineSegments.reduce((lineSegments, lineSegment) => {
            if(positionsLeftToRemove === 0) {
              lineSegments.push(lineSegment);
            } else if(lineSegment.positions.length < positionsLeftToRemove) {
              positionsLeftToRemove -= lineSegment.positions.length;
            } else {
              lineSegment.positions = lineSegment.positions.filter((position, index) => positionsLeftToRemove < index + 1);
              lineSegments.push(lineSegment);
              positionsLeftToRemove = 0;
            }
            return lineSegments;
          }, []);
        }
        assetTracks[assetId] = assetTrack;
        return assetTracks;
      }, {});

      return { ...state, assetTracks: newAssetTracks };

    case ActionTypes.AddForecast:
      return { ...state, forecasts: [
        ...state.forecasts, payload
      ].filter((v, i, a) => a.indexOf(v) === i)};

    case ActionTypes.RemoveForecast:
      return { ...state, forecasts: state.forecasts.filter(assetId => assetId !== payload)};

    case ActionTypes.ClearForecasts:
      return { ...state, forecasts: [] };

    case ActionTypes.SetFullAsset:
      return { ...state, assets: {
        ...state.assets,
        [payload.historyId]: payload
      }};

    case ActionTypes.SelectAsset:
      return { ...state, selectedAsset: payload };

    case ActionTypes.SetAssetTrack:
      // tslint:disable-next-line:no-shadowed-variable
      const lineSegments = payload.tracks.reduce((lineSegments, position) => {
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
        [payload.assetId]: { ...payload, lineSegments }
      }};

    case ActionTypes.UntrackAsset:
      const assetTracks = { ...state.assetTracks };
      delete assetTracks[payload];
      return { ...state, assetTracks };

    case ActionTypes.ClearTracks:
      return { ...state, assetTracks: {}, positionsForInspection: {} };

    case ActionTypes.AddPositionForInspection:
      // tslint:disable-next-line:no-shadowed-variable
      const positionsForInspectionKeys = Object.keys(state.positionsForInspection).map(key => parseInt(key, 10));
      const key = positionsForInspectionKeys.length === 0 ? 1 : positionsForInspectionKeys[positionsForInspectionKeys.length - 1] + 1;
      return { ...state,
        positionsForInspection: { ...state.positionsForInspection,
          [key]: payload
        }
      };

    case ActionTypes.RemovePositionForInspection:
      const positionsForInspection = { ...state.positionsForInspection };
      delete positionsForInspection[payload];
      return { ...state,
        positionsForInspection
      };

    default:
      return state;
  }
}
