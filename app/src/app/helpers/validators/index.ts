import { validateEmail } from './email';
import { phoneNumber, swedishPhoneNumber } from './phone-number';
import { alphanumeric } from './alphanumeric';

const CustomValidators = {
  validateEmail,
  phoneNumber,
  swedishPhoneNumber,
  alphanumeric
};

export default CustomValidators;
