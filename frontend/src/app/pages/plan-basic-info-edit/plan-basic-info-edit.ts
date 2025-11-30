import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { SharedImports } from '../../shared/shared-imports/shared-imports';
import { Button } from '../components/ui/buttons/button/button';
import { FormIcon } from '../components/ui/form-icon/form-icon';
import { TopBarPlan } from '../components/plan/top-bar-plan/top-bar-plan';
import { GoogleMapComponent, MapPlace } from '../components/maps/google-map/google-map';

@Component({
  selector: 'app-plan-basic-info-edit',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, SharedImports, Button, FormIcon, TopBarPlan, GoogleMapComponent],
  templateUrl: './plan-basic-info-edit.html',
  styleUrl: './plan-basic-info-edit.scss',
})
export class PlanBasicInfoEdit {
  form: FormGroup;
  newCustomType = '';

  tripTypes = [
    { id: '1', name: 'Wypoczynek' },
    { id: '2', name: 'Zwiedzanie' },
    { id: '3', name: 'Biznes' },
    { id: '4', name: 'Romantyczny' },
    { id: '5', name: 'Rodzinny' },
    { id: '6', name: 'Przygoda' },
  ];

  currencies = [
    { code: 'PLN', symbol: 'zł', name: 'Polski złoty' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'Dolar amerykański' },
    { code: 'GBP', symbol: '£', name: 'Funt brytyjski' },
    { code: 'CZK', symbol: 'Kč', name: 'Korona czeska' },
  ];

  customTripTypes: string[] = [];
  showAddDropdown = false;
  showAddCustomInput = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: [''],
      description: [''],
      location: [''],
      destination: [''],
      startDate: [''],
      endDate: [''],
      tripTypeIds: this.fb.array([]),
      customTripTypes: this.fb.array([]),
      budgetAmount: [''],
      budgetCurrency: ['PLN'],
      coverImgUrl: ['']
    });
  }

  get tripTypeIdsFormArray(): FormArray {
    return this.form.get('tripTypeIds') as FormArray;
  }

  get customTripTypesFormArray(): FormArray {
    return this.form.get('customTripTypes') as FormArray;
  }

  onTripTypeToggle(tripTypeId: string) {
    const formArray = this.tripTypeIdsFormArray;
    const isSelected = this.isTripTypeSelected(tripTypeId);
    
    if (isSelected) {
      const index = formArray.controls.findIndex(control => control.value === tripTypeId);
      if (index >= 0) {
        formArray.removeAt(index);
      }
    } else {
      formArray.push(this.fb.control(tripTypeId));
    }
  }

  isTripTypeSelected(tripTypeId: string): boolean {
    return this.tripTypeIdsFormArray.value.includes(tripTypeId);
  }

  onCustomTypeToggle(customType: string) {
    const formArray = this.customTripTypesFormArray;
    const isSelected = this.isCustomTypeSelected(customType);
    
    if (isSelected) {
      const index = formArray.controls.findIndex(control => control.value === customType);
      if (index >= 0) {
        formArray.removeAt(index);
      }
    } else {
      formArray.push(this.fb.control(customType));
    }
  }

  isCustomTypeSelected(customType: string): boolean {
    return this.customTripTypesFormArray.value.includes(customType);
  }

  toggleAddDropdown() {
    this.showAddDropdown = !this.showAddDropdown;
    this.showAddCustomInput = false;
  }

  addCustomType() {
    if (this.newCustomType.trim() && !this.customTripTypes.includes(this.newCustomType.trim())) {
      const newType = this.newCustomType.trim();
      this.customTripTypes.push(newType);
      // Automatycznie zaznacz nowo dodany typ
      this.customTripTypesFormArray.push(this.fb.control(newType));
      this.newCustomType = '';
      this.showAddCustomInput = false;
      this.showAddDropdown = false;
    }
  }

  toggleAddCustomInput() {
    this.showAddCustomInput = !this.showAddCustomInput;
    if (this.showAddCustomInput) {
      // Focus na input po pokazaniu
      setTimeout(() => {
        const input = document.querySelector('.basic-info-form__custom-input') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }, 0);
    }
  }

  onCustomInputBlur() {
    if (!this.newCustomType.trim()) {
      this.showAddCustomInput = false;
    }
  }

  onCustomInputEscape() {
    this.showAddCustomInput = false;
    this.newCustomType = '';
  }

  onSelectUnselectedType(tripTypeId: string) {
    this.onTripTypeToggle(tripTypeId);
    this.showAddDropdown = false;
  }

  onSelectUnselectedCustomType(customType: string) {
    this.onCustomTypeToggle(customType);
    this.showAddDropdown = false;
  }

  removeCustomType(customType: string) {
    const index = this.customTripTypes.indexOf(customType);
    if (index >= 0) {
      this.customTripTypes.splice(index, 1);
      // Usuń też z formArray jeśli jest zaznaczony
      const formArray = this.customTripTypesFormArray;
      const formIndex = formArray.controls.findIndex(control => control.value === customType);
      if (formIndex >= 0) {
        formArray.removeAt(formIndex);
      }
    }
  }

  onImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // W przyszłości: upload do serwera i otrzymanie URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.form.patchValue({ coverImgUrl: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }



  // Mapa - miejsca do wyświetlenia
  get placesForMap(): MapPlace[] {
    const places: MapPlace[] = [];
    const location = this.form.get('location')?.value;
    const destination = this.form.get('destination')?.value;

    if (location && location.trim()) {
      places.push({
        id: 1,
        name: 'Lokalizacja',
        address: location,
        placeType: 'city'
      });
    }

    if (destination && destination.trim()) {
      places.push({
        id: 2,
        name: 'Cel podróży',
        address: destination,
        placeType: 'city'
      });
    }

    return places;
  }
}
