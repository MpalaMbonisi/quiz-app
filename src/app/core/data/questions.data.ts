import { Question } from '../models/question.model';

/**
 * Sample Java quiz questions
 */
export const JAVA_QUESTIONS: Question[] = [
  {
    id: '1',
    text: 'What is the correct way to declare a variable in Java?',
    answers: [
      { id: 'a', text: 'int x = 5;', isCorrect: true },
      { id: 'b', text: 'variable x = 5;', isCorrect: false },
      { id: 'c', text: 'x := 5;', isCorrect: false },
      { id: 'd', text: 'def x = 5;', isCorrect: false },
    ],
    isMultipleChoice: false,
    points: 1,
  },
  {
    id: '2',
    text: 'Which of the following are valid Java access modifiers?',
    answers: [
      { id: 'a', text: 'public', isCorrect: true },
      { id: 'b', text: 'private', isCorrect: true },
      { id: 'c', text: 'protected', isCorrect: true },
      { id: 'd', text: 'internal', isCorrect: false },
    ],
    isMultipleChoice: true,
    points: 1,
  },
  {
    id: '3',
    text: 'What will this code output?',
    code: `public class Main {
    public static void main(String[] args) {
        int x = 5;
        int y = 10;
        System.out.println(x + y);
    }
}`,
    answers: [
      { id: 'a', text: '15', isCorrect: true },
      { id: 'b', text: '510', isCorrect: false },
      { id: 'c', text: 'xy', isCorrect: false },
      { id: 'd', text: 'Compilation error', isCorrect: false },
    ],
    isMultipleChoice: false,
    points: 1,
  },
  {
    id: '4',
    text: 'What is the purpose of the "static" keyword in Java?',
    answers: [
      {
        id: 'a',
        text: 'Makes a method or variable belong to the class rather than instances',
        isCorrect: true,
      },
      { id: 'b', text: 'Prevents a variable from being modified', isCorrect: false },
      { id: 'c', text: 'Makes a method run faster', isCorrect: false },
      { id: 'd', text: 'Declares a constant value', isCorrect: false },
    ],
    isMultipleChoice: false,
    points: 1,
  },
  {
    id: '5',
    text: 'Which statements about Java inheritance are correct?',
    answers: [
      { id: 'a', text: 'Java supports single inheritance for classes', isCorrect: true },
      { id: 'b', text: 'A class can implement multiple interfaces', isCorrect: true },
      { id: 'c', text: 'Java supports multiple inheritance for classes', isCorrect: false },
      { id: 'd', text: 'The extends keyword is used for inheritance', isCorrect: true },
    ],
    isMultipleChoice: true,
    points: 1,
  },
];
