import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ActionSheetService } from '../../shared/service/action-sheet.service';
import { filter, from, mergeMap } from 'rxjs';
import { CategoryService } from '../category.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastService} from '../../shared/service/toast.service';
import { Category} from '../../shared/domain';
import { FormGroup} from '@angular/forms';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
})
export class CategoryModalComponent implements OnInit {
  ngOnInit(): void {
    this.categoryForm.patchValue(this.category);
  }
  category: Category = {} as Category;
  constructor(
    private readonly actionSheetService: ActionSheetService,
    private readonly categoryService: CategoryService,
    private readonly formBuilder: FormBuilder,
    private readonly modalCtrl: ModalController,
    private readonly toastService: ToastService
  ) {
    this.categoryForm = this.formBuilder.group({
      id: [], //hidden
      name: ['', [Validators.required, Validators.maxLength(40)]],
    });
  }


  readonly categoryForm: FormGroup;
  submitting = false;
  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
  save(): void {
    this.submitting = true;
    this.categoryService.upsertCategory(this.categoryForm.value).subscribe({
      next: () => {
        this.toastService.displaySuccessToast('Category saved');
        this.modalCtrl.dismiss(null, 'refresh');
        this.submitting = false;
      },
      error: (error) => {
        this.toastService.displayErrorToast('Could not save category', error);
        this.submitting = false;
      },
    });
  }
  delete(): void {
    from(this.actionSheetService.showDeletionConfirmation('Are you sure you want to delete this category?'))
      .pipe(
        filter((action) => action === 'delete'),
        mergeMap(() => {
      this.submitting = true;
      return this.categoryService.deleteCategory(this.category.id!);
    })
  )
        .subscribe({
        next: () => {
          this.toastService.displaySuccessToast('Category deleted');
          this.modalCtrl.dismiss(null, 'refresh');
          this.submitting = false;
        },
        error: (error) => {
          this.toastService.displayErrorToast('Could not delete category', error);
          this.submitting = false;
        },
      });
  }
}
