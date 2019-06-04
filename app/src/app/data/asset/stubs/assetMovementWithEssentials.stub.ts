import { AssetMovementWithEssentials } from '../asset.interfaces';
import AssetMovementStub from './assetMovement.stub';
import AssetEssentialsStub from './assetEssentials.stub';

const AssetMovementWithEssentialsStub: AssetMovementWithEssentials = {
  assetEssentials: AssetEssentialsStub,
  assetMovement: AssetMovementStub,
};

export default AssetMovementWithEssentialsStub;
