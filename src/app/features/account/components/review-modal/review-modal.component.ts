import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-modal.component.html',
  styleUrls: ['./review-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewModalComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) orderId = '';
  @Output() close = new EventEmitter<void>();
  @Output() submitReview = new EventEmitter<{ rating: number; feedback: string }>();
  @ViewChild('dialog') dialog?: ElementRef<HTMLElement>;

  readonly stars = [1, 2, 3, 4, 5];
  readonly ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great!', 'Exceptional!'];
  readonly ratingEmojis = ['', '😞', '🙁', '🙂', '😃', '🤩'];
  rating = 0;
  hoverRating = 0;
  feedback = '';
  private previousBodyOverflow = '';

  ngAfterViewInit(): void {
    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.dialog?.nativeElement.focus();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.previousBodyOverflow;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.rating < 1) return;
    this.submitReview.emit({ rating: this.rating, feedback: this.feedback });
  }
}
