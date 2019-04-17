import { AssetTrack } from '../asset.interfaces';

const AssetTrackStub: AssetTrack = {
  tracks: [
      {
        location: {
          longitude: 11.642,
          latitude: 57.470666666666666
        },
        heading: 359,
        guid: 'e8d0109e-d6a8-4960-8af5-0506625a6e20',
        timestamp: '2019-04-10T10:57:52Z',
        speed: 7.900000095367432
      },
      {
        location: {
          longitude: 11.642,
          latitude: 57.469500000000004
        },
        heading: 359,
        guid: 'a8405e49-5132-4ea9-b40a-403ec431b4cf',
        timestamp: '2019-04-10T10:57:22Z',
        speed: 7.900000095367432
      },
      {
        location: {
          longitude: 11.642,
          latitude: 57.4685
        },
        heading: 359,
        guid: '01ca8272-417e-4ac4-a8b7-467c5567973c',
        timestamp: '2019-04-10T10:56:52Z',
        speed: 7.900000095367432
      },
      {
        location: {
          longitude: 11.642,
          latitude: 57.47166666666667
        },
        heading: 359,
        guid: '1fdb9ec2-882c-43e5-beea-b69263ab6da6',
        timestamp: '2019-04-10T10:58:20Z',
        speed: 7.800000190734863
      }
    ],
  assetId: '6938453e-8ea7-4e55-b646-921b9c866e58',
  visible: true,
  lineSegments: [
    {
      speed: 8,
      positions: [
        {
          longitude: 11.642,
          latitude: 57.470666666666666
        },
        {
          longitude: 11.642,
          latitude: 57.469500000000004
        },
        {
          longitude: 11.642,
          latitude: 57.4685
        },
        {
          longitude: 11.642,
          latitude: 57.47166666666667
        }
      ],
      color: '#0000FF'
    }
  ]
};

export default AssetTrackStub;
