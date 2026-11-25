import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-partner',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.scss']
})
export class PartnerComponent {
  inquiry = { name: '', company: '', phone: '', interest: '', message: '' };

  submit(form: NgForm): void {
    if (form.invalid) return;
    const subject = encodeURIComponent('Rainbow inquiry — ' + this.inquiry.interest);
    const body = encodeURIComponent(
      'Name: ' + this.inquiry.name + '\nCompany: ' + this.inquiry.company +
      '\nPhone: ' + this.inquiry.phone +
      '\nInterest: ' + this.inquiry.interest + '\n\n' + this.inquiry.message
    );
    window.location.href = 'mailto:online@rainbowcc.com.pk?subject=' + subject + '&body=' + body;
  }
}
