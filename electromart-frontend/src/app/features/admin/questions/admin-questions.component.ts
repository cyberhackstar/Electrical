import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminProductService } from '../../../core/services/admin-product.service';
import { ProductResponse } from '../../../core/models/product.model';
import { QuestionResponse } from '../../../core/models/question.model';
import { QuestionService } from '../../../core/services/question.service';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-questions.component.html',
})
export class AdminQuestionsComponent implements OnInit {
  private productService = inject(AdminProductService);
  private questionService = inject(QuestionService);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);

  products = signal<ProductResponse[]>([]);
  questionsByProduct = signal<Map<number, QuestionResponse[]>>(new Map());
  loading = signal(true);
  answerDrafts: Record<number, string> = {};
  submittingId = signal<number | null>(null);

  ngOnInit(): void {
    this.seoService.updateMetaTags({ title: 'Product Questions', description: 'Answer customer product questions.', noIndex: true });
    this.loadAll();
  }

  private loadAll(): void {
    this.loading.set(true);
    // Pull a page of products, then fetch questions per product — fine at catalog sizes this app targets.
    this.productService.getAll(0, 50).subscribe(res => {
      this.products.set(res.data.content);
      const map = new Map<number, QuestionResponse[]>();
      let remaining = res.data.content.length;

      if (remaining === 0) {
        this.loading.set(false);
        return;
      }

      res.data.content.forEach(product => {
        this.questionService.getForProduct(product.id).subscribe(qRes => {
          const unanswered = qRes.data.filter(q => !q.answerText);
          if (unanswered.length > 0) {
            map.set(product.id, unanswered);
          }
          remaining--;
          if (remaining === 0) {
            this.questionsByProduct.set(new Map(map));
            this.loading.set(false);
          }
        });
      });
    });
  }

  productName(id: number): string {
    return this.products().find(p => p.id === id)?.name ?? '';
  }

  get entries(): [number, QuestionResponse[]][] {
    return Array.from(this.questionsByProduct().entries());
  }

  submitAnswer(question: QuestionResponse): void {
    const answerText = this.answerDrafts[question.id]?.trim();
    if (!answerText) return;

    this.submittingId.set(question.id);
    this.questionService.answer(question.id, { answerText }).subscribe({
      next: () => {
        this.toast.success('Answer submitted');
        this.submittingId.set(null);
        delete this.answerDrafts[question.id];
        this.loadAll();
      },
      error: () => this.submittingId.set(null),
    });
  }
}
