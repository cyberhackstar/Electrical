import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact.component.html',
})
export class ContactComponent implements OnInit {
  private fb = inject(FormBuilder);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'Contact Us',
      description: 'Get in touch with the ElectroMart team for product questions, bulk orders, or support.',
      url: '/contact',
    });
  }

  /**
   * NOTE: there's no backend endpoint for contact-form submissions yet.
   * This opens the visitor's email client pre-filled, so the form is functional today.
   * Wire this to a real POST /api/contact endpoint (with its own email-notification service)
   * when you're ready to collect these server-side instead.
   */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, message } = this.form.getRawValue();
    const subject = encodeURIComponent(`Website inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:support@electromart.com?subject=${subject}&body=${body}`;
    this.toast.success('Opening your email client...');
  }
}
