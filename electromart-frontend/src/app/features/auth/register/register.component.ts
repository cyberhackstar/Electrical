import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);

  step = signal<'form' | 'otp'>('form');
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  registeredEmail = '';

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  otpForm = this.fb.nonNullable.group({
    otpCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  constructor() {
    this.seoService.updateMetaTags({
      title: 'Create Account',
      description: 'Create your free ElectroMart account to shop genuine electrical products with fast delivery.',
      noIndex: true,
    });
  }

  get f() {
    return this.form.controls;
  }

  submitRegistration(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    const value = this.form.getRawValue();

    this.authService.register(value).subscribe({
      next: () => {
        this.loading.set(false);
        this.registeredEmail = value.email;
        this.step.set('otp');
        this.toast.success('OTP sent to your email');
      },
      error: err => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Registration failed. Please try again.');
      },
    });
  }

  submitOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.verifySignupOtp({
      email: this.registeredEmail,
      otpCode: this.otpForm.getRawValue().otpCode,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Welcome to ElectroMart!');
        this.router.navigate(['/']);
      },
      error: err => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Invalid or expired OTP.');
      },
    });
  }
}
