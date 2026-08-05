import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);

  step = signal<'email' | 'reset'>('email');
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  submittedEmail = '';

  emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  resetForm = this.fb.nonNullable.group({
    otpCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    this.seoService.updateMetaTags({
      title: 'Forgot Password',
      description: 'Reset your ElectroMart account password.',
      noIndex: true,
    });
  }

  requestOtp(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    const email = this.emailForm.getRawValue().email;

    this.authService.forgotPassword({ email }).subscribe({
      next: () => {
        this.loading.set(false);
        this.submittedEmail = email;
        this.step.set('reset');
        this.toast.success('OTP sent to your email');
      },
      error: err => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Something went wrong. Please try again.');
      },
    });
  }

  resetPassword(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    const { otpCode, newPassword } = this.resetForm.getRawValue();

    this.authService.resetPassword({ email: this.submittedEmail, otpCode, newPassword }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Password reset successfully. Please log in.');
        this.router.navigate(['/auth/login']);
      },
      error: err => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Invalid or expired OTP.');
      },
    });
  }
}
