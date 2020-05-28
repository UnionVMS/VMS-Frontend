import { Subscriber } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export const SimulateMovement = (observer: Subscriber<any>, assetId: string, interval: number) => {
  const t = {
    data: {
      asset: assetId,
      microMove: {
        heading: 309.29998779296875,
        location: {
          latitude: 57.71614,
          longitude: 10.586350000000001
        },
        source: 'AIS',
        speed: 2.0,
        timestamp: 1590500930000
      }
    },
    type: 'Movement'
  };

  let counter = 0;

  setInterval(() => {
    counter++;
    observer.next({
      ...t,
      data: {
        ...t.data,
        microMove: {
          ...t.data.microMove,
          id: uuidv4(),
          location: {
            ...t.data.microMove.location,
            latitude: t.data.microMove.location.latitude + (
              counter % 2 === 0
              ? 0.02 * (counter - 1)
              : 0.02 * (counter + 1)
            ),
            longitude: t.data.microMove.location.longitude + (
              counter % 2 === 0
              ? 0.01 * (counter + 1)
              : 0.01 * (counter - 1)
            )
          },
          speed: 2 + (counter % 12 < 6 ? 0 : 4),
          timestamp: Date.now() + (
            counter % 2 === 0
            ? -4000
            : 0
          )
        }
      }
    });
  }, interval);
};
