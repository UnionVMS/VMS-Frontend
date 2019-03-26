import { Action } from '@ngrx/store';
import { ActionTypes } from './asset.actions';

export interface Position {
  longitude: number;
  latitude: number;
}

export interface Movement {
  location: Position;
  heading: number;
  guid: string;
  timestamp: string;
  speed: number;
}

export interface Asset {
  microMove: Movement;
  asset: string;
  flagstate: string;
  assetName: string;
}

export interface LineSegment {
  speed: number;
  positions: Array<Position>;
  color: string;
}

export interface AssetTrack {
  tracks: Array<Movement>;
  visible: boolean;
  assetId: string;
  lineSegments: Array<LineSegment>
}

export interface State {
  selectedAsset: string|null;
  fullAssets: { [uid: string]: Asset };
  assets: { [uid: string]: Asset };
  assetTracks: { [assetId: string]: AssetTrack };
  positionsForInspection: any;
}

const initialState: State = {
  selectedAsset: null,
  fullAssets: {},
  assets: {},
  assetTracks: {},
  positionsForInspection: {}
  // assets: {
  //   '65860e1e-44d1-40b1-93bf-c76309db0823': {
  //     microMove: {
  //       location: {
  //         longitude: 18.277466666666665,
  //         latitude: 57.63371666666667
  //       },
  //       heading: 199,
  //       guid: 'aa006541-216d-4a21-82be-26d773d83fa8',
  //       timestamp: '2019-03-15T10:19:30.063Z',
  //       speed: 0
  //     },
  //     asset: '65860e1e-44d1-40b1-93bf-c76309db0823',
  //     flagstate: 'UNK',
  //     assetName: 'Unknown ship: 1686'
  //   },
  //   'ac8d0e48-2eb6-412e-8434-8faf91b8e02a': {
  //     microMove: {
  //       location: {
  //         longitude: 11.617801666666667,
  //         latitude: 57.772841666666665
  //       },
  //       heading: 267.5,
  //       guid: '718e4d7b-3003-45ca-8316-3f8e7d746bc9',
  //       timestamp: '2019-03-15T10:19:57.395Z',
  //       speed: 0
  //     },
  //     asset: 'ac8d0e48-2eb6-412e-8434-8faf91b8e02a',
  //     flagstate: 'SWE',
  //     assetName: 'ROSSÖ'
  //   },
  //   // 'ea52a248-4f98-4b91-afde-c4f47ac2b953': {
  //   //   microMove: {
  //   //     location: {
  //   //       longitude: 11.618536666666667,
  //   //       latitude: 57.75817
  //   //     },
  //   //     heading: 50.099998474121094,
  //   //     guid: '2983a7df-69cf-47a8-b56a-2441bd48901f',
  //   //     timestamp: '2019-03-15T10:19:57.398Z',
  //   //     speed: 4.900000095367432
  //   //   },
  //   //   asset: 'ea52a248-4f98-4b91-afde-c4f47ac2b953',
  //   //   flagstate: 'UNK',
  //   //   assetName: 'Unknown ship: 960'
  //   // },
  //   // '6f21d2e6-4bb6-4cbe-a734-34590b8e9803': {
  //   //   microMove: {
  //   //     location: {
  //   //       longitude: 11.956285000000001,
  //   //       latitude: 57.705891666666666
  //   //     },
  //   //     heading: 311.70001220703125,
  //   //     guid: 'e32746f4-e983-4412-943a-3e1e8608497d',
  //   //     timestamp: '2019-03-15T10:19:59.424Z',
  //   //     speed: 0.10000000149011612
  //   //   },
  //   //   asset: '6f21d2e6-4bb6-4cbe-a734-34590b8e9803',
  //   //   flagstate: 'UNK',
  //   //   assetName: 'Unknown ship: 746'
  //   // }
  // },
  // positionsForInspection: {
  //   1: {
  //     guid: "355da120-540c-43aa-ad95-1996ac7f2737",
  //     heading: 339.3999938964844,
  //     location: {longitude: 11.880608333333333, latitude: 56.785495},
  //     speed: 10,
  //     timestamp: "2019-03-18T22:11:24.408Z"
  //   },
  //   3: {
  //     guid: "c1757c1a-3d8c-425f-a73a-aae2a9294a9c",
  //     heading: 339.3999938964844,
  //     location: {longitude: 11.732553333333334, latitude: 57.02675},
  //     speed: 10,
  //     timestamp: "2019-03-18T23:42:26.493Z"
  //   }
  // }
};

const speedSegments = {
  4: '#00FF00',
  8: '#0000FF',
  12: '#FFA500',
  100000: '#FF0000'
};
const speeds = Object.keys(speedSegments).map(speed => parseInt(speed));

export function assetReducer(state = initialState, action: Action) {
  switch (action.type) {
    case ActionTypes.AssetMoved:
      return { ...state, assets: {
        ...state.assets,
        [action.payload.asset]: action.payload
      } };
    case ActionTypes.AssetsMoved:
      const newState = { ...state, assets: {
        ...state.assets,
        ...action.payload
      } };
      Object.keys(action.payload).map((assetId) => {
        if(typeof newState.assetTracks[assetId] !== 'undefined') {
          newState.assetTracks[assetId].tracks.push(action.payload[assetId].microMove);
          const lineSegments = newState.assetTracks[assetId].lineSegments;
          const lastSegment = lineSegments[lineSegments.length - 1];
          const segmentSpeed = speeds.find((speed) => newState.assets[assetId].microMove.speed < speed);
          // Add the last position in last segment eiter way so there is no spaces in the draw line.
          lastSegment.positions.push(newState.assets[assetId].microMove.location);
          if (lastSegment.speed !== segmentSpeed) {
            lineSegments.push({
              speed: segmentSpeed,
              positions: [newState.assets[assetId].microMove.location],
              color: speedSegments[segmentSpeed]
            });
          }
        }
      });
      return newState;
    case ActionTypes.SetFullAsset:
      return { ...state, fullAssets: {
        ...state.fullAssets,
        [action.payload.historyId]: action.payload
      }};
    case ActionTypes.SelectAsset:
      return { ...state, selectedAsset: action.payload };
    case ActionTypes.SetAssetTrack:
      const lineSegments = action.payload.tracks.reduce((lineSegments, position) => {
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
        [action.payload.assetId]: { ...action.payload, lineSegments }
      }}
    case ActionTypes.AddPositionForInspection:
      const positionsForInspectionKeys = Object.keys(state.positionsForInspection).map(key => parseInt(key));
      const key = positionsForInspectionKeys.length === 0 ? 1 : positionsForInspectionKeys[positionsForInspectionKeys.length - 1] + 1;
      return { ...state,
        positionsForInspection: { ...state.positionsForInspection,
          [key]: action.payload
        }
      };
      case ActionTypes.RemovePositionForInspection:
        const positionsForInspection = { ...state.positionsForInspection };
        delete positionsForInspection[action.payload];
        console.warn(positionsForInspection);
        return { ...state,
          positionsForInspection: positionsForInspection
        };
    default:
      return state;
  }
}
