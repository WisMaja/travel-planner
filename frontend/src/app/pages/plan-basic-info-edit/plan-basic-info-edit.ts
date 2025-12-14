import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { SharedImports } from '../../shared/shared-imports/shared-imports';
import { Button } from '../components/ui/buttons/button/button';
import { FormIcon } from '../components/ui/form-icon/form-icon';
import { TopBarPlan } from '../components/plan/top-bar-plan/top-bar-plan';
import { GoogleMapComponent, MapPlace } from '../components/maps/google-map/google-map';
import { PlansBasicInfoService } from '../../services/plans-basic-info.service';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-plan-basic-info-edit',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, SharedImports, Button, FormIcon, TopBarPlan, GoogleMapComponent],
  templateUrl: './plan-basic-info-edit.html',
  styleUrl: './plan-basic-info-edit.scss',
})
export class PlanBasicInfoEdit implements OnInit {
  form: FormGroup;
  newCustomType = '';
  planId: string | null = null;
  isLoading = false;
  isSaving = false;
  isUploading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  coverImageMode: 'url' | 'upload' = 'url'; // Tryb: URL lub upload pliku
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;

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
    private router: Router,
    private route: ActivatedRoute,
    private plansBasicInfoService: PlansBasicInfoService,
    private fileUploadService: FileUploadService
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

  ngOnInit(): void {
    // Pobierz planId z queryParams
    this.route.queryParams.subscribe(params => {
      this.planId = params['planId'] || null;
      if (this.planId) {
        this.loadPlanData();
      } else {
        this.errorMessage = 'Brak ID planu. Nie można załadować danych.';
      }
    });
  }

  loadPlanData(): void {
    if (!this.planId) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.plansBasicInfoService.getBasicInfo(this.planId).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.populateForm(data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading plan data:', error);
        this.errorMessage = 'Nie udało się załadować danych planu. Spróbuj ponownie.';
      }
    });
  }

  populateForm(data: any): void {
    // Wypełnij formularz danymi z API
    this.form.patchValue({
      title: data.title || '',
      description: data.description || '',
      location: data.location || '',
      destination: data.destination || '',
      startDate: data.startDate ? this.formatDateForInput(data.startDate) : '',
      endDate: data.endDate ? this.formatDateForInput(data.endDate) : '',
      budgetAmount: data.budgetAmount || '',
      budgetCurrency: data.budgetCurrency || 'PLN',
      coverImgUrl: data.coverImgUrl || data.coverImageUrl || ''
    });

    // Ustaw tryb na podstawie typu URL (lokalny plik vs zewnętrzny URL)
    const coverUrl = data.coverImgUrl || data.coverImageUrl || '';
    if (coverUrl) {
      this.coverImageMode = this.fileUploadService.isLocalFile(coverUrl) ? 'upload' : 'url';
    } else {
      this.coverImageMode = 'url'; // Domyślnie URL
    }

    // Obsługa typów podróży (na razie tylko pierwszy typ, bo backend ma tylko jeden TripTypeId)
    if (data.tripTypeId) {
      // Sprawdź czy tripTypeId jest prawidłowym Guid
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (guidRegex.test(data.tripTypeId)) {
        const tripTypeArray = this.tripTypeIdsFormArray;
        tripTypeArray.clear();
        // TripTypeId jest już Guid (string), więc używamy bezpośrednio
        tripTypeArray.push(this.fb.control(data.tripTypeId));
      }
    }

    // Custom trip types - jeśli backend będzie je obsługiwał w przyszłości
    // Na razie zostawiamy puste
  }

  formatDateForInput(dateString: string): string {
    // Konwertuj datę z formatu ISO (np. "2024-07-01T00:00:00Z") na format input date (YYYY-MM-DD)
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async onSave(): Promise<void> {
    if (!this.planId) {
      this.errorMessage = 'Brak ID planu. Nie można zapisać danych.';
      return;
    }

    if (this.form.invalid) {
      this.errorMessage = 'Formularz zawiera błędy. Sprawdź wprowadzone dane.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formValue = this.form.value;

    // Przygotuj dane do wysłania (zgodnie z UpdatePlansBasicInfoDto)
    const updateData: any = {
      title: formValue.title || null,
      description: formValue.description || null,
      location: formValue.location || null,
      destination: formValue.destination || null,
      startDate: formValue.startDate ? new Date(formValue.startDate).toISOString() : null,
      endDate: formValue.endDate ? new Date(formValue.endDate).toISOString() : null,
      budgetAmount: formValue.budgetAmount ? parseFloat(formValue.budgetAmount) : null,
      budgetCurrency: formValue.budgetCurrency || null,
      coverImgUrl: formValue.coverImgUrl || null,
      coverImageUrl: formValue.coverImgUrl || null, // Również dla Plans.CoverImageUrl
    };

    // Obsługa typów podróży - na razie tylko pierwszy typ (backend ma tylko TripTypeId: Guid?)
    const tripTypeIds = formValue.tripTypeIds || [];
    if (tripTypeIds.length > 0) {
      const tripTypeId = tripTypeIds[0];
      // Sprawdź czy tripTypeId jest prawidłowym Guid (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (tripTypeId && guidRegex.test(tripTypeId)) {
        updateData.tripTypeId = tripTypeId;
      }
      // Jeśli nie jest prawidłowym Guid, nie dodawaj go (backend użyje null)
    }
    // Jeśli nie ma wybranego trip type, nie dodawaj tripTypeId (backend użyje null)

    // Usuń null/undefined/puste wartości (ale zachowaj tripTypeId jeśli jest ustawiony)
    // UWAGA: Nie usuwaj coverImgUrl i coverImageUrl jeśli są puste - pozwól backendowi je wyczyścić
    Object.keys(updateData).forEach(key => {
      // Jeśli coverImgUrl lub coverImageUrl są puste stringi, zamień na null (backend wyczyści)
      if (key === 'coverImgUrl' || key === 'coverImageUrl') {
        if (updateData[key] === '') {
          updateData[key] = null;
        }
      } else if (updateData[key] === null || updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key];
      }
    });

    // Jeśli jest wybrany plik do uploadu, najpierw go prześlij
    if (this.selectedFile && this.coverImageMode === 'upload') {
      this.isUploading = true;
      try {
        const uploadResponse = await firstValueFrom(this.fileUploadService.uploadFile(this.selectedFile));
        if (uploadResponse) {
          const apiUrl = (window as any).__API_URL__ || 'http://localhost:5079';
          const fullUrl = uploadResponse.fileUrl.startsWith('http') 
            ? uploadResponse.fileUrl 
            : `${apiUrl}${uploadResponse.fileUrl}`;
          updateData.coverImgUrl = fullUrl;
          updateData.coverImageUrl = fullUrl;
        }
      } catch (error: any) {
        this.isUploading = false;
        this.isSaving = false;
        this.errorMessage = error.error?.message || 'Nie udało się przesłać zdjęcia. Spróbuj ponownie.';
        return;
      } finally {
        this.isUploading = false;
      }
    }

    this.plansBasicInfoService.updateBasicInfo(this.planId, updateData).subscribe({
      next: (updatedData) => {
        this.isSaving = false;
        this.successMessage = 'Dane zostały zapisane pomyślnie!';
        
        // Przekieruj po 1 sekundzie
        setTimeout(() => {
          this.router.navigate(['/plan/basic-info'], {
            queryParams: { planId: this.planId }
          });
        }, 1000);
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error saving plan data:', error);
        
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Nie udało się zapisać danych. Spróbuj ponownie.';
        }
      }
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

  /**
   * Zmienia tryb między URL a uploadem pliku
   */
  setCoverImageMode(mode: 'url' | 'upload'): void {
    this.coverImageMode = mode;
    if (mode === 'url') {
      this.selectedFile = null;
      this.imagePreviewUrl = null;
    } else {
      // Wyczyść URL gdy przełączamy na upload
      const currentUrl = this.form.get('coverImgUrl')?.value;
      if (currentUrl && !this.fileUploadService.isLocalFile(currentUrl)) {
        this.form.patchValue({ coverImgUrl: '' });
      }
    }
  }

  /**
   * Obsługuje wybór pliku do uploadu
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Walidacja rozmiaru (10 MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        this.errorMessage = 'Plik jest za duży. Maksymalny rozmiar to 10 MB.';
        input.value = '';
        return;
      }

      // Walidacja typu pliku
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Nieobsługiwany format pliku. Dozwolone formaty: JPG, PNG, GIF, WEBP.';
        input.value = '';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = null;

      // Pokaż podgląd
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Uploaduje wybrany plik na serwer
   */
  async uploadImage(): Promise<void> {
    if (!this.selectedFile) {
      this.errorMessage = 'Nie wybrano pliku.';
      return;
    }

    this.isUploading = true;
    this.errorMessage = null;

    try {
      const response = await firstValueFrom(this.fileUploadService.uploadFile(this.selectedFile));
      if (response) {
        // Ustaw URL przesłanego pliku w formularzu
        // Backend zwraca URL względny (np. /uploads/xxx.jpg), więc musimy dodać pełny URL
        const apiUrl = (window as any).__API_URL__ || 'http://localhost:5079';
        const fullUrl = response.fileUrl.startsWith('http') 
          ? response.fileUrl 
          : `${apiUrl}${response.fileUrl}`;
        
        this.form.patchValue({ coverImgUrl: fullUrl });
        this.successMessage = 'Zdjęcie zostało przesłane pomyślnie!';
        
        // Wyczyść podgląd i wybrany plik
        this.selectedFile = null;
        this.imagePreviewUrl = null;
        
        // Wyczyść input file
        const fileInput = document.getElementById('coverImgFile') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      this.errorMessage = error.error?.message || 'Nie udało się przesłać pliku. Spróbuj ponownie.';
    } finally {
      this.isUploading = false;
    }
  }

  /**
   * Usuwa wybrany plik (przed uploadem)
   */
  removeSelectedFile(): void {
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    const fileInput = document.getElementById('coverImgFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Usuwa obecne zdjęcie okładki
   */
  removeCoverImage(): void {
    this.form.patchValue({ coverImgUrl: '' });
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    const fileInput = document.getElementById('coverImgFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Sprawdza czy obecne zdjęcie to lokalny plik (z uploads)
   */
  isCurrentImageLocalFile(): boolean {
    const url = this.form.get('coverImgUrl')?.value;
    return this.fileUploadService.isLocalFile(url);
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
