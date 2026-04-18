# Java Quiz App

A TypeScript/Angular quiz application for practicing Java programming knowledge with timed multiple-choice questions.

## Purpose

This project serves two main purposes:
1. Learning and practicing TypeScript and Angular fundamentals
2. Providing a customizable quiz tool for technical assessments with multiple-choice questions

## Installation

### Prerequisites
- Node.js (version 18 or higher)
- npm (version 10 or higher)

### Setup Steps

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:4200
```

## Adding Your Own Questions

Questions are stored in `src/app/core/data/questions.data.ts`.

### Question Structure

Each question must follow this model:

```typescript
{
  id: string;              // Unique identifier (e.g., '1', '2', '3')
  text: string;            // The question text
  code?: string;           // Optional code snippet
  answers: Answer[];       // Array of answer options
  isMultipleChoice: boolean; // true if multiple answers can be selected
  points: number;          // Always set to 1
}
```

### Answer Structure

```typescript
{
  id: string;        // Unique identifier (e.g., 'a', 'b', 'c')
  text: string;      // The answer text
  isCorrect: boolean; // true if this is a correct answer
}
```

### Example Question

```typescript
{
  id: '1',
  text: 'What is the correct way to declare a variable in Java?',
  answers: [
    { id: 'a', text: 'int x = 5;', isCorrect: true },
    { id: 'b', text: 'variable x = 5;', isCorrect: false },
    { id: 'c', text: 'x := 5;', isCorrect: false },
  ],
  isMultipleChoice: false,
  points: 1,
}
```

### Example with Code Snippet

```typescript
{
  id: '2',
  text: 'What will this code output?',
  code: `public class Main {
    public static void main(String[] args) {
        int x = 5;
        System.out.println(x);
    }
}`,
  answers: [
    { id: 'a', text: '5', isCorrect: true },
    { id: 'b', text: '0', isCorrect: false },
  ],
  isMultipleChoice: false,
  points: 1,
}
```

### Example with Multiple Correct Answers

```typescript
{
  id: '3',
  text: 'Which of the following are valid Java access modifiers?',
  answers: [
    { id: 'a', text: 'public', isCorrect: true },
    { id: 'b', text: 'private', isCorrect: true },
    { id: 'c', text: 'protected', isCorrect: true },
    { id: 'd', text: 'internal', isCorrect: false },
  ],
  isMultipleChoice: true,  // Note: set to true
  points: 1,
}
```

## Quiz Features

- Three quiz modes:
  - All Questions: Answer all available questions
  - Random 23 (Fixed): 23 random questions with answers in original order
  - Random 23 (Shuffled): 23 random questions with randomized answer order

- 60-second timer per question
- Speed bonus/penalty system
- Detailed results with question-by-question breakdown
- Responsive design for mobile and desktop

## Running Tests

```bash
npm test
```

## Building for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

## Technology Stack

- Angular 21.2
- TypeScript 5.9
- RxJS 7.8
- Jest (testing)
- SCSS (styling)


