import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import type { Question } from '../../core/models/question.model';

@Component({
  selector: 'app-question-card',
  imports: [CommonModule],
  templateUrl: './question-card.component.html',
  styleUrl: './question-card.component.scss',
})
export class QuestionCardComponent {
  @Input({ required: true }) question!: Question;
  @Input() questionNumber = 1;
  @Input() totalQuestions = 1;
  @Input() disabled = false;

  @Output() answerSelected = new EventEmitter<string[]>();

  protected readonly selectedAnswers = signal<Set<string>>(new Set());
  protected readonly hasSelection = computed(() => this.selectedAnswers().size > 0);

  toggleAnswer(answerId: string): void {
    if (this.disabled) {
      return;
    }

    const current = new Set(this.selectedAnswers());

    if (this.question.isMultipleChoice) {
      // Multiple choice: toggle selection
      if (current.has(answerId)) {
        current.delete(answerId);
      } else {
        current.add(answerId);
      }
    } else {
      current.clear();
      current.add(answerId);
    }

    this.selectedAnswers.set(current);
    this.answerSelected.emit(Array.from(current));
  }

  isSelected(answerId: string): boolean {
    return this.selectedAnswers().has(answerId);
  }

  reset(): void {
    this.selectedAnswers.set(new Set());
  }
}
