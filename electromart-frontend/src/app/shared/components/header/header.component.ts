import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);
  private router = inject(Router);

  mobileMenuOpen = signal(false);
  searchQuery = '';

  readonly categories = [
    { name: 'Wiring & Cables', slug: 'wiring-cables' },
    { name: 'Switches & Sockets', slug: 'switches-sockets' },
    { name: 'MCBs & Breakers', slug: 'mcbs-breakers' },
    { name: 'Lighting', slug: 'lighting' },
    { name: 'Fans', slug: 'fans' },
    { name: 'Tools', slug: 'tools' },
  ];

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (q) {
      this.router.navigate(['/products'], { queryParams: { keyword: q } });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }
}
