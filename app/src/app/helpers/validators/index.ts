import { alphanumeric } from './alphanumeric';
import { validateEmail } from './email';
import { minLengthOfNumber, maxLengthOfNumber } from './numberLength';
import { phoneNumber, swedishPhoneNumber } from './phone-number';
import { momentValid, momentOnlyInThePast, momentNotInTheFuture } from './moment';

const CustomValidators = {
  alphanumeric,
  validateEmail,
  maxLengthOfNumber,
  minLengthOfNumber,
  phoneNumber,
  swedishPhoneNumber,
  momentValid,
  momentOnlyInThePast,
  momentNotInTheFuture
};

export default CustomValidators;
