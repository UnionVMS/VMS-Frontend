import { alphanumeric } from './alphanumeric';
import { validateEmail } from './email';
import { minLengthOfNumber, maxLengthOfNumber } from './numberLength';
import { phoneNumber, swedishPhoneNumber } from './phone-number';

const CustomValidators = {
  alphanumeric,
  validateEmail,
  maxLengthOfNumber,
  minLengthOfNumber,
  phoneNumber,
  swedishPhoneNumber,
};

export default CustomValidators;
