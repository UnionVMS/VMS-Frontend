import { Action } from '@ngrx/store';
import { ActionTypes } from './asset.actions';

export interface Asset {
  location: any;
  heading: number;
  guid: string;
  asset: string;
  timestamp: string;
  speed: number;
  flagstate: string;
  assetName: string;
};

export interface State {
  assets: { [uid: string]: Asset };
};

const initialState: State = {
  assets: {
    "6b39d6e2-87ee-4492-9027-51cfbf84989c": {
      "location": {
        "longitude":12.635330000000002,"latitude":55.676465
      },
      "heading": 32.900001525878906,
      "guid": "3ee04158-2e77-4b67-9869-ec59aafd72eb",
      "asset":"6b39d6e2-87ee-4492-9027-51cfbf84989c",
      "timestamp":"2019-03-11T13:13:56.624Z",
      "speed":0.0,
      "flagstate":"BHS",
      "assetName":"NORDANVIK"
    }
  }
};

export function authReducer(state = initialState, action: Action) {
  switch (action.type) {
    case ActionTypes.AssetMoved:
      return { ...state, assets: {
        ...state.assets,
        [action.payload.asset]: action.payload
      } };
    case ActionTypes.AssetsMoved:
      return { ...state, assets: {
        ...state.assets,
        ...action.payload
      } };
    default:
      return state;
  }
}

//
// {
//   "location": {
//     "longitude":12.635330000000002,"latitude":55.676465
//   },
//   "heading": 32.900001525878906,
//   "guid": "3ee04158-2e77-4b67-9869-ec59aafd72eb",
//   "asset":"6b39d6e2-87ee-4492-9027-51cfbf84989c",
//   "timestamp":"2019-03-11T13:13:56.624Z",
//   "speed":0.0,
//   "flagstate":"BHS",
//   "assetName":"NORDANVIK"
// }
