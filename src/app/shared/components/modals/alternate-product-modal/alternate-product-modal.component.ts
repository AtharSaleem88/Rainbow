import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlternateModalService } from '../../../../core/services/alternate-modal.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-alternate-product-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alternate-product-modal.component.html',
  styleUrls: ['./alternate-product-modal.component.scss']
})
export class AlternateProductModalComponent {
  modalService = inject(AlternateModalService);

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.modalService.isOpen()) {
      this.modalService.close();
    }
  }
}
