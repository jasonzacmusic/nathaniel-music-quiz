"use client";

import { useState, useEffect, useCallback } from "react";
import { QuestionWithShuffledAnswers } from "@/lib/queries";

export interface UseQuizProps {
  questions: QuestionWithShuffledAnswers[];
}

export interface UseQuizReturn {
  currentQuestion: QuestionWithShuffledAnswers | null;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  streak: number;
  bestStreak: number;
  answered: boolean;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  shuffledAnswers: string[];
  timeElapsed: number;
  questionTimes: number[];
  isComplete: boolean;
  handleAnswer: (answer: string) => void;
  nextQuestion: () => void;
  restartQuiz: () => void;
}

export function useQuiz({ questions }: UseQuizProps): UseQuizReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionTimes, setQuestionTimes] = useState<number[]>([]);

  const currentQuestion = questions[currentIndex] || null;
  const totalQuestions = questions.length;
  const isComplete = currentIndex >= totalQuestions && answered;

  // Initialize shuffled answers when current question changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.answers) {
      // Answers are already shuffled from the server, but ensure they're set
      setShuffledAnswers([...currentQuestion.answers]);
    }
    setAnswered(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setQuestionStartTime(Date.now());
  }, [currentIndex, currentQuestion]);

  // Timer for total time elapsed — stops when quiz is complete
  useEffect(() => {
    if (isComplete) return;
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isComplete]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (answered || !currentQuestion) return;

      const correct = answer === currentQuestion.correct_answer;
      const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);

      setSelectedAnswer(answer);
      setIsCorrect(correct);
      setAnswered(true);
      setQuestionTimes((prev) => [...prev, timeTaken]);

      if (correct) {
        setScore((prev) => prev + 1);
        setStreak((prev) => {
          const newStreak = prev + 1;
          if (newStreak > bestStreak) {
            setBestStreak(newStreak);
          }
          return newStreak;
        });
      } else {
        setStreak(0);
      }
    },
    [answered, currentQuestion, questionStartTime, bestStreak]
  );

  const nextQuestion = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setAnswered(true);
    }
  }, [currentIndex, totalQuestions]);

  const restartQuiz = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimeElapsed(0);
    setQuestionTimes([]);
    setQuestionStartTime(Date.now());
  }, []);

  return {
    currentQuestion,
    currentIndex,
    totalQuestions,
    score,
    streak,
    bestStreak,
    answered,
    selectedAnswer,
    isCorrect,
    shuffledAnswers,
    timeElapsed,
    questionTimes,
    isComplete,
    handleAnswer,
    nextQuestion,
    restartQuiz,
  };
}
