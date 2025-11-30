import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedImports } from '../../shared/shared-imports/shared-imports';
import { Button } from '../components/ui/buttons/button/button';
import { TopBarPlan } from '../components/plan/top-bar-plan/top-bar-plan';
import { SearchBar } from '../components/home/search-bar/search-bar';
import { FormIcon, IconName } from '../components/ui/form-icon/form-icon';

interface ChecklistItem {
  id: number;
  text: string;
  checked: boolean;
  category: string;
}

interface ChecklistCategory {
  id: string;
  name: string;
  icon: string | IconName; // Może być emoji lub nazwa ikony z form-icon
  iconType?: 'emoji' | 'icon'; // Typ ikony
  items: ChecklistItem[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-plan-checklist',
  imports: [CommonModule, FormsModule, SharedImports, Button, TopBarPlan, SearchBar, FormIcon],
  templateUrl: './plan-checklist.html',
  styleUrl: './plan-checklist.scss',
})
export class PlanChecklist {
  searchQuery: string = '';
  filterType: 'all' | 'checked' | 'unchecked' = 'all';

  categories: ChecklistCategory[] = [
    {
      id: 'documents',
      name: 'Dokumenty',
      icon: 'file-text',
      iconType: 'icon',
      isExpanded: true,
      items: [
        { id: 1, text: 'Paszport / Dowód osobisty', checked: false, category: 'documents' },
        { id: 2, text: 'Wiza (jeśli wymagana)', checked: false, category: 'documents' },
        { id: 3, text: 'Bilety lotnicze / kolejowe', checked: false, category: 'documents' },
        { id: 4, text: 'Potwierdzenia rezerwacji', checked: false, category: 'documents' },
        { id: 5, text: 'Ubezpieczenie podróżne', checked: false, category: 'documents' },
        { id: 6, text: 'Prawo jazdy (jeśli potrzebne)', checked: false, category: 'documents' },
        { id: 7, text: 'Karty kredytowe / debetowe', checked: false, category: 'documents' },
      ]
    },
    {
      id: 'clothes',
      name: 'Ubrania',
      icon: 'shirt',
      iconType: 'icon',
      isExpanded: true,
      items: [
        { id: 8, text: 'Bielizna', checked: false, category: 'clothes' },
        { id: 9, text: 'Skarpetki', checked: false, category: 'clothes' },
        { id: 10, text: 'Koszule / T-shirty', checked: false, category: 'clothes' },
        { id: 11, text: 'Spodnie / Spódnice', checked: false, category: 'clothes' },
        { id: 12, text: 'Sweter / Bluza', checked: false, category: 'clothes' },
        { id: 13, text: 'Kurtka / Płaszcz', checked: false, category: 'clothes' },
        { id: 14, text: 'Buty wygodne', checked: false, category: 'clothes' },
        { id: 15, text: 'Buty eleganckie', checked: false, category: 'clothes' },
        { id: 16, text: 'Strój kąpielowy', checked: false, category: 'clothes' },
      ]
    },
    {
      id: 'electronics',
      name: 'Elektronika',
      icon: 'smartphone',
      iconType: 'icon',
      isExpanded: true,
      items: [
        { id: 17, text: 'Telefon komórkowy', checked: false, category: 'electronics' },
        { id: 18, text: 'Ładowarka do telefonu', checked: false, category: 'electronics' },
        { id: 19, text: 'Laptop / Tablet', checked: false, category: 'electronics' },
        { id: 20, text: 'Ładowarka do laptopa', checked: false, category: 'electronics' },
        { id: 21, text: 'Powerbank', checked: false, category: 'electronics' },
        { id: 22, text: 'Słuchawki', checked: false, category: 'electronics' },
        { id: 23, text: 'Aparat fotograficzny', checked: false, category: 'electronics' },
        { id: 24, text: 'Adaptery do gniazdek', checked: false, category: 'electronics' },
      ]
    },
    {
      id: 'medicine',
      name: 'Apteczka',
      icon: 'pill',
      iconType: 'icon',
      isExpanded: true,
      items: [
        { id: 25, text: 'Leki na receptę', checked: false, category: 'medicine' },
        { id: 26, text: 'Środki przeciwbólowe', checked: false, category: 'medicine' },
        { id: 27, text: 'Plastry opatrunkowe', checked: false, category: 'medicine' },
        { id: 28, text: 'Środki na przeziębienie', checked: false, category: 'medicine' },
        { id: 29, text: 'Środki na biegunkę', checked: false, category: 'medicine' },
        { id: 30, text: 'Środki przeciwalergiczne', checked: false, category: 'medicine' },
      ]
    },
    {
      id: 'other',
      name: 'Inne',
      icon: 'backpack',
      iconType: 'icon',
      isExpanded: true,
      items: [
        { id: 31, text: 'Walizka / Plecak', checked: false, category: 'other' },
        { id: 32, text: 'Kosmetyki', checked: false, category: 'other' },
        { id: 33, text: 'Szczoteczka do zębów', checked: false, category: 'other' },
        { id: 34, text: 'Pasta do zębów', checked: false, category: 'other' },
        { id: 35, text: 'Szampon / Odżywka', checked: false, category: 'other' },
        { id: 36, text: 'Ręcznik', checked: false, category: 'other' },
        { id: 37, text: 'Okulary / Soczewki', checked: false, category: 'other' },
        { id: 38, text: 'Książka / E-book', checked: false, category: 'other' },
      ]
    }
  ];

  toggleItem(categoryId: string, itemId: number): void {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      const item = category.items.find(i => i.id === itemId);
      if (item) {
        item.checked = !item.checked;
      }
    }
  }

  getTotalItems(): number {
    return this.categories.reduce((sum, cat) => sum + cat.items.length, 0);
  }

  getCheckedItems(): number {
    return this.categories.reduce((sum, cat) => 
      sum + cat.items.filter(item => item.checked).length, 0
    );
  }

  getProgressPercentage(): number {
    const total = this.getTotalItems();
    if (total === 0) return 0;
    return Math.round((this.getCheckedItems() / total) * 100);
  }

  getCategoryProgress(category: ChecklistCategory): number {
    if (category.items.length === 0) return 0;
    const checked = category.items.filter(item => item.checked).length;
    return Math.round((checked / category.items.length) * 100);
  }

  getCategoryCheckedCount(category: ChecklistCategory): number {
    return category.items.filter(item => item.checked).length;
  }

  getCategoryTotalCount(category: ChecklistCategory): number {
    return category.items.length;
  }

  toggleCategory(categoryId: string): void {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      category.isExpanded = !category.isExpanded;
    }
  }

  onSearchChange(query: string): void {
    this.searchQuery = query.toLowerCase();
  }

  onFilterChange(filter: 'all' | 'checked' | 'unchecked'): void {
    this.filterType = filter;
  }

  getFilteredCategories(): ChecklistCategory[] {
    return this.categories.map(category => {
      let filteredItems = category.items;

      // Filtrowanie po wyszukiwaniu
      if (this.searchQuery.trim()) {
        filteredItems = filteredItems.filter(item =>
          item.text.toLowerCase().includes(this.searchQuery)
        );
      }

      // Filtrowanie po statusie (zaznaczone/niezaznaczone)
      if (this.filterType === 'checked') {
        filteredItems = filteredItems.filter(item => item.checked);
      } else if (this.filterType === 'unchecked') {
        filteredItems = filteredItems.filter(item => !item.checked);
      }

      return {
        ...category,
        items: filteredItems
      };
    }).filter(category => category.items.length > 0 || this.searchQuery.trim() === '');
  }

  expandAll(): void {
    this.categories.forEach(cat => cat.isExpanded = true);
  }

  collapseAll(): void {
    this.categories.forEach(cat => cat.isExpanded = false);
  }

  // Dodawanie nowej kategorii
  showAddCategoryDialog: boolean = false;
  newCategoryName: string = '';
  newCategoryIcon: IconName = 'clipboard';
  newCategoryIconType: 'emoji' | 'icon' = 'icon';
  
  availableIcons: { name: IconName; label: string }[] = [
    { name: 'clipboard', label: 'Lista' },
    { name: 'file-text', label: 'Dokumenty' },
    { name: 'shirt', label: 'Ubrania' },
    { name: 'smartphone', label: 'Elektronika' },
    { name: 'pill', label: 'Apteczka' },
    { name: 'backpack', label: 'Plecak' },
    { name: 'plane', label: 'Podróż' },
    { name: 'hotel', label: 'Hotel' },
    { name: 'utensils', label: 'Jedzenie' },
    { name: 'target', label: 'Cel' },
    { name: 'calendar', label: 'Kalendarz' },
    { name: 'map', label: 'Mapa' },
  ];

  openAddCategoryDialog(): void {
    this.showAddCategoryDialog = true;
    this.newCategoryName = '';
    this.newCategoryIcon = 'clipboard';
    this.newCategoryIconType = 'icon';
  }

  closeAddCategoryDialog(): void {
    this.showAddCategoryDialog = false;
    this.newCategoryName = '';
    this.newCategoryIcon = 'clipboard';
    this.newCategoryIconType = 'icon';
  }

  addNewCategory(): void {
    if (!this.newCategoryName.trim()) {
      return;
    }

    // Generuj unikalne ID
    const newId = 'category-' + Date.now();
    
    const newCategory: ChecklistCategory = {
      id: newId,
      name: this.newCategoryName.trim(),
      icon: this.newCategoryIcon,
      iconType: this.newCategoryIconType,
      isExpanded: true,
      items: []
    };

    this.categories.push(newCategory);
    this.closeAddCategoryDialog();
  }

  // Dodawanie nowego zadania do kategorii
  newItemTexts: { [key: string]: string } = {};
  showAddItemInput: { [key: string]: boolean } = {};

  toggleAddItemInput(categoryId: string): void {
    this.showAddItemInput[categoryId] = !this.showAddItemInput[categoryId];
    if (this.showAddItemInput[categoryId]) {
      this.newItemTexts[categoryId] = '';
    }
  }

  addItemToCategory(categoryId: string): void {
    const itemText = this.newItemTexts[categoryId]?.trim();
    if (!itemText) {
      return;
    }

    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      // Znajdź największe ID we wszystkich kategoriach
      const allIds = this.categories.flatMap(cat => cat.items.map(i => i.id));
      const maxId = allIds.length > 0 ? Math.max(...allIds) : 0;
      const newId = maxId + 1;

      const newItem: ChecklistItem = {
        id: newId,
        text: itemText,
        checked: false,
        category: categoryId
      };

      category.items.push(newItem);
      category.isExpanded = true;
      
      // Wyczyść pole i ukryj input
      this.newItemTexts[categoryId] = '';
      this.showAddItemInput[categoryId] = false;
    }
  }

  cancelAddItem(categoryId: string): void {
    this.newItemTexts[categoryId] = '';
    this.showAddItemInput[categoryId] = false;
  }

  // Edycja zadań
  editingItemId: number | null = null;
  editingItemText: string = '';

  startEditItem(categoryId: string, itemId: number): void {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      const item = category.items.find(i => i.id === itemId);
      if (item) {
        this.editingItemId = itemId;
        this.editingItemText = item.text;
      }
    }
  }

  saveEditItem(categoryId: string, itemId: number): void {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      const item = category.items.find(i => i.id === itemId);
      if (item && this.editingItemText.trim()) {
        item.text = this.editingItemText.trim();
        this.cancelEditItem();
      }
    }
  }

  cancelEditItem(): void {
    this.editingItemId = null;
    this.editingItemText = '';
  }

  // Usuwanie zadań
  deleteItem(categoryId: string, itemId: number): void {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      const index = category.items.findIndex(i => i.id === itemId);
      if (index > -1) {
        category.items.splice(index, 1);
      }
    }
  }

  // Usuwanie kategorii
  categoryToDelete: string | null = null;

  confirmDeleteCategory(categoryId: string): void {
    this.categoryToDelete = categoryId;
  }

  cancelDeleteCategory(): void {
    this.categoryToDelete = null;
  }

  deleteCategory(categoryId: string): void {
    const index = this.categories.findIndex(c => c.id === categoryId);
    if (index > -1) {
      this.categories.splice(index, 1);
      this.categoryToDelete = null;
    }
  }

  // Sprawdzenie czy są jakieś kategorie
  hasCategories(): boolean {
    return this.categories.length > 0;
  }

  // Pomocnicza metoda do konwersji ikony na IconName
  getIconName(icon: string | IconName): IconName {
    // Jeśli to już IconName, zwróć
    if (typeof icon === 'string' && this.isValidIconName(icon)) {
      return icon as IconName;
    }
    // Domyślnie zwróć clipboard
    return 'clipboard';
  }

  // Sprawdzenie czy string jest poprawnym IconName
  private isValidIconName(name: string): name is IconName {
    const validIcons: IconName[] = ['email', 'user', 'phone', 'eye', 'eye-off', 'plus', 'sort', 'calendar', 'map', 'location', 'trash', 'x', 'file-text', 'shirt', 'smartphone', 'pill', 'backpack', 'plane', 'hotel', 'utensils', 'target', 'clipboard'];
    return validIcons.includes(name as IconName);
  }
}
