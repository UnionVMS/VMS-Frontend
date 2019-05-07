import { AssetMovement } from '../asset.interfaces';

const AssetStub: AssetMovement = {
  microMove: {
    location: {
      longitude: 23.17178167666667,
      latitude:  65.15318167666667
    },
    heading: 189,
    guid: '4eea28b6-0844-4a6b-f5be-6b655a4e0343',
    timestamp: '2019-05-02T09:04:58Z',
    speed: 11.2,
  },
  asset: 'ba498d76-ecd1-486a-9302-728367b237a7',
  flagstate: 'GBR',
  assetName: 'Test boat'
};

export default AssetStub;
