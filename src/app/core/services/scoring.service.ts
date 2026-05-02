import { Injectable } from '@angular/core';
import { Question, UserAnswer } from '../models/question.model';
import { QuestionResult, QuizResult } from '../models/quiz-result.model';

@Injectable({
  providedIn: 'root',
})
export class ScoringService {
  // Speed Multiplier configuration
  private readonly OPTIMAL_TIME = 20; // Answers within 20s get full 1.0 points
  private readonly MAX_TIME = 60; // Answers at 60s get the minimum points
  private readonly MIN_SPEED_FACTOR = 0.5; // Minimum 50% of the points if correct but slow

  /**
   * Calculates a multiplier between MIN_SPEED_FACTOR and 1.0
   */
  calculateSpeedMultiplier(timeSpent: number, isCorrect: boolean): number {
    if (!isCorrect) {
      return 0;
    }

    // Clamp time
    const clampedTime = Math.min(timeSpent, this.MAX_TIME);

    // If answered within optimal time, give full points (1.0)
    if (clampedTime <= this.OPTIMAL_TIME) {
      return 1.0;
    }

    // If slower than optimal, calculate a decay
    // Formula: Scale the remaining time between OPTIMAL and MAX into a 1.0 to MIN_SPEED_FACTOR range
    const excessTime = clampedTime - this.OPTIMAL_TIME;
    const maxExcessTime = this.MAX_TIME - this.OPTIMAL_TIME;

    const penalty = (1 - this.MIN_SPEED_FACTOR) * (excessTime / maxExcessTime);
    return 1.0 - penalty;
  }

  checkAnswer(question: Question, selectedAnswerIds: string[]): boolean {
    const correctAnswerIds = question.answers
      .filter(answer => answer.isCorrect)
      .map(answer => answer.id)
      .sort();

    const sortedSelectedIds = [...selectedAnswerIds].sort();

    return (
      correctAnswerIds.length === sortedSelectedIds.length &&
      correctAnswerIds.every((id, index) => id === sortedSelectedIds[index])
    );
  }

  calculateQuestionScore(question: Question, userAnswer: UserAnswer): QuestionResult {
    // We treat question.points as the max possible value (e.g., 1)
    const maxPoints = question.points || 1;

    const speedMultiplier = this.calculateSpeedMultiplier(
      userAnswer.timeSpent,
      userAnswer.isCorrect
    );

    const finalScore = maxPoints * speedMultiplier;

    return {
      questionId: question.id,
      questionText: question.text,
      isCorrect: userAnswer.isCorrect,
      timeSpent: userAnswer.timeSpent,
      speedBonus: speedMultiplier, // Renamed conceptually to multiplier
      finalScore: parseFloat(finalScore.toFixed(2)),
    };
  }

  calculateQuizResults(questions: Question[], userAnswers: UserAnswer[]): QuizResult {
    const questionResults: QuestionResult[] = [];
    let totalScore = 0;
    let totalTimeSpent = 0;
    let correctCount = 0;

    questions.forEach(question => {
      const userAnswer = userAnswers.find(ua => ua.questionId === question.id);

      if (userAnswer) {
        const result = this.calculateQuestionScore(question, userAnswer);
        questionResults.push(result);

        if (result.isCorrect) {
          correctCount++;
        }
        totalScore += result.finalScore;
        totalTimeSpent += userAnswer.timeSpent;
      }
    });

    const maxPossibleScore = questions.length; // Max 1 point per question
    const percentage = (totalScore / maxPossibleScore) * 100;

    return {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      rawScore: totalScore,
      speedBonusTotal: 0, // No longer additive bonus
      finalScore: totalScore,
      percentage: Math.min(100, percentage),
      totalTimeSpent,
      averageTimePerQuestion: totalTimeSpent / questions.length,
      questionResults,
      userAnswers,
    };
  }

  getPerformanceLevel(percentage: number): string {
    if (percentage >= 99) return 'Congratulations, you got an interview!!';
    if (percentage >= 80) return 'Very Good - but not quite there.';
    return 'Unfortunately, we are moving on with other candidates...';
  }
}
