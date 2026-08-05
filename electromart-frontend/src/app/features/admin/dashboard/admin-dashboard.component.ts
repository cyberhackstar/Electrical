import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardStatsResponse } from '../../../core/models/dashboard.model';
import { DashboardService } from '../../../core/services/dashboard.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private seoService = inject(SeoService);

  stats = signal<DashboardStatsResponse | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.seoService.updateMetaTags({ title: 'Admin Dashboard', description: 'ElectroMart admin dashboard.', noIndex: true });
    this.dashboardService.getStats().subscribe({
      next: res => {
        this.stats.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
