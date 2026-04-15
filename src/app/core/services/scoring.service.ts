import { Injectable } from '@angular/core';
import { Question, UserAnswer } from '../models/question.model';
import { QuestionResult, QuizResult } from '../models/quiz-result.model';
@Injectable({
  providedIn: 'root',
})
export class ScoringService {
  // Speed Bonus configuration
  private readonly OPTIMAL_TIME = 30; // Sweet spot for answering (30 seconds)
  private readonly MAX_TIME = 60;
  private readonly MAX_SPEED_BONUS = 0.25; // 25% bonus for very fast, accurate answers
  private readonly MIN_SPEED_PENALTY = -0.1; // 10% penalty for very slow answers

  constructor() {}

  /**
   * Calculate speed bonus/penalty based on time spent
   * Formula: 
   * - Fast answers (< OPTIMAL_TIME): Bonus increases as time decreases
   * - Slow answers (> OPTIMAL_TIME): Small penalty increases as time increases
   * - Very slow answers (near MAX_TIME): Capped penalty to avoid over-punishing
   * 
   * The formula rewards speed but doesn't excessively punish accuracy
   */
  calculateSpeedBonus(timeSpent: number, isCorrect: boolean): number{
    // No bonus for incorrect answers
    if(!isCorrect){
      return 0;
    }

    // Clamp time to max allowed
    const clampedTime = Math.min(timeSpent, this.MAX_TIME);

    if (clampedTime <= this.OPTIMAL_TIME) {
      // Fast answer: Give bonus (exponential curve for faster answers)
      // At 10 seconds: ~0.22 bonus (22%)
      // At 20 seconds: ~0.10 bonus (10%)
      // At 30 seconds: 0 bonus
      const timeRatio = clampedTime / this.OPTIMAL_TIME;
      return this.MAX_SPEED_BONUS * (1 - Math.pow(timeRatio, 2));
    }
    else{
      // Slow answer: Apply small penalty (linear decrease)
      // At 40 seconds: ~-0.033 penalty (-3.3%)
      // At 50 seconds: ~-0.067 penalty (-6.7%)
      // At 60 seconds: -0.1 penalty (-10%)
      const excessTime = clampedTime - this.OPTIMAL_TIME;
      const maxExcessTime = this.MAX_TIME - this.OPTIMAL_TIME;
      return this.MIN_SPEED_PENALTY * (excessTime/ maxExcessTime);
    }
  }

  /**
   * Check if user's answer is correct
   */
  checkAnswer(question: Question, selectedAnswerIds: string[]): boolean {
    // Get all correct answers IDs
    const correctAnswerIds = question.answers
      .filter(answer => answer.isCorrect)
      .map(answer => answer.id)
      .sort();

    // Compare selected answers with correct answers
    const sortedSelectedIds = [...selectedAnswerIds].sort();

    // Must match exactly (same length and same IDs)
    return (
      correctAnswerIds.length == sortedSelectedIds.length &&
      correctAnswerIds.every((id, index) => id === sortedSelectedIds[index])
    );
  }

  /**
   * Calculate individual question score with speed bonus
   */
  calculateQuestionScore(
    question: Question,
    userAnswer: UserAnswer
  ): QuestionResult {

    const baseScore = userAnswer.isCorrect ? question.points : 0;
    const speedBonus = this.calculateSpeedBonus(
      userAnswer.timeSpent,
      userAnswer.isCorrect
    );
    const bonusPoints = baseScore * speedBonus;
    const finalScore = baseScore + bonusPoints;

    return {
      questionId: question.id,
      questionText: question.text,
      isCorrect: userAnswer.isCorrect,
      timeSpent: userAnswer.timeSpent,
      speedBonus: speedBonus,
      finalScore: Math.max(0, finalScore) // Ensure non-negative
    };
  };

  /**
   * Calculate final quiz results
   */
  calculateQuizResults(
    questions: Question[],
    userAnswers: UserAnswer[]
  ): QuizResult{

    const questionResults: QuestionResult[] = [];
    let rawScore = 0;
    let speedBonusTotal = 0;
    let totalTimeSpent = 0;

    // Calculate score for each question
    questions.forEach(question => {
      const userAnswer = userAnswers.find(
        ua => ua.questionId == question.id
      );

      if (userAnswer) {
        const questionResult = this.calculateQuestionScore(question, userAnswer);
        questionResults.push(questionResult);

        if (questionResult.isCorrect) {
          rawScore += question.points;
        }
        speedBonusTotal += questionResult.speedBonus * question.points;
        totalTimeSpent += userAnswer.timeSpent;
      }
    });

    const finalScore = rawScore + speedBonusTotal;
    const maxPossibleScore = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = (finalScore / maxPossibleScore) * 100;

    return {
      totalQuestions: questions.length,
      correctAnswers: rawScore, // Since each question is 1 point
      rawScore,
      speedBonusTotal,
      finalScore: Math.max(0, finalScore), // Ensure non-negative
      percentage: Math.max(0, Math.min(100, percentage)), // Clamp to 0-100
      totalTimeSpent,
      averageTimePerQuestion: totalTimeSpent / questions.length,
      questionResults,
      userAnswers
    };
  }

  getPerformanceLevel(percentage: number): string {
    if (percentage == 100) return 'Congratulations, you got an interview!!';
    if (percentage >= 95) return 'Very Good - but not good enough!!'
    return 'Unfortunately, we are moving on with other candidates...';
  }
}
