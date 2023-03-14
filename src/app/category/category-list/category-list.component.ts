import { Component, OnInit } from '@angular/core';
import { CategoryModalComponent } from '../category-modal/category-modal.component';
import { InfiniteScrollCustomEvent, ModalController, RefresherCustomEvent } from '@ionic/angular';
import { Category, CategoryCriteria } from '../../shared/domain';
import { CategoryService } from '../category.service';
import { ToastService } from '../../shared/service/toast.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
})
export class CategoryListComponent implements OnInit {
  constructor(
    private readonly modalCtrl: ModalController,
    private readonly categoryService: CategoryService,
    private readonly toastService: ToastService
) {}

  categories: Category[] = [];
  readonly initialSort = 'name,asc';
  lastPageReached = false;
  loading = false;
  searchCriteria: CategoryCriteria = { page: 0, size: 25, sort: this.initialSort};
  async openModal(category?: Category): Promise<void> {
    const modal = await this.modalCtrl.create({ component: CategoryModalComponent });
    modal.present();
    const { role } = await modal.onWillDismiss();
    if (role === 'refresh') this.loadCategories();
    console.log('role', role);
  }


  private loadCategories(next: () => void = () => {}): void {
    if (!this.searchCriteria.name) delete this.searchCriteria.name;
    this.loading = true;
    this.categoryService.getCategories(this.searchCriteria).subscribe({
      next: (categories) => {
        if (this.searchCriteria.page === 0 || !this.categories) this.categories = [];
        this.categories.push(...categories.content);
        this.lastPageReached = categories.last;
        next();
        this.loading = false;
      },
      error: (error) => {
        this.toastService.displayErrorToast('Could not load categories', error);
        this.loading = false;
      },
    });
  }
  ngOnInit(): void {
    this.loadCategories();
  }
  loadNextCategoryPage($event: any) {
    this.searchCriteria.page++;
    this.loadCategories(() => ($event as InfiniteScrollCustomEvent).target.complete());
  }
  reloadCategories($event?: any): void {
    this.searchCriteria.page = 0;
    this.loadCategories(() => ($event ? ($event as RefresherCustomEvent).target.complete() : {}));
  }
}

