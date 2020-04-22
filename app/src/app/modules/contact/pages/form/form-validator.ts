import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContactTypes } from '@data/contact';
import CustomValidators from '@validators/.';

export const createContactFormValidator = (contact: ContactTypes.Contact) => {
  return new FormGroup({
    essentailFields: new FormGroup({
      name: new FormControl(contact.name, Validators.required),
      type: new FormControl(contact.type, Validators.required),
    }),
    contact: new FormGroup({
      email: new FormControl(contact.email, CustomValidators.validateEmail),
      phone: new FormControl(contact.phoneNumber, CustomValidators.phoneNumber),
    }),
    address: new FormGroup({
      country: new FormControl(contact.country),
      city: new FormControl(contact.cityName),
      street: new FormControl(contact.streetName),
      postOfficeBox: new FormControl(contact.postOfficeBox),
      postalArea: new FormControl(contact.postalArea),
      zipCode: new FormControl(contact.zipCode),
    }),
    other: new FormGroup({
      nationality: new FormControl(contact.nationality),
      owner: new FormControl(contact.owner),
      source: new FormControl(contact.source),
    }),
  });
};
