import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  private readonly alerts = inject(AlertService);
  formData = { name: '', email: '', subject: '', message: '' };

  onSubmit() {
    void this.alerts.show({ title: 'Contact form', message: 'This is a demo form. Your message has not been sent; please contact our customer service team directly.', kind: 'info' });
  }
}
