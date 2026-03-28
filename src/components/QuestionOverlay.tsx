"use client";

import { motion } from "framer-motion";
import AnswerButton from "./AnswerButton";

interface QuestionOverlayProps {
  question: string;
  answers: string[];
  onAnswer: (answer: string) => void;
  answered?: boolean;
  correctAnswer?: string;
  overlaySettings?: {
    height?: number; // percentage
    blur?: number; // px
  };
}

export default function QuestionOverlay({
  question,
  answers,
  onAnswer,
  answered = false,
  correctAnswer,
  overlaySettings = { height: 55, blur: 8 },
}: QuestionOverlayProps) {
  const handleAnswerClick = (answer: string) => {
    if (!answered) {
      onAnswer(answer);
    }
  };

  const getAnswerState = (answer: string) => {
    if (!answered) return "default";

    if (correctAnswer === answer) {
      return "correct";
    }

    if (answer === correctAnswer) {
      return "reveal";
    }

    return "wrong";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="overlay-gradient absolute inset-x-0 bottom-0 z-20 flex flex-col"
      style={{
        height: `${overlaySettings.height}%`,
        backdropFilter: `blur(${overlaySettings.blur}px)`,
      }}
    >
      <div className="flex-1 flex flex-col justify-between p-6 md:p-8">
        {/* Question Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 md:mb-8"
        >
          <h2 className="font-display font-700 text-xl md:text-2xl text-cream leading-tight">
            {question}
          </h2>
        </motion.div>

        {/* Answer Buttons Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-3 md:space-y-4"
        >
          {answers.map((answer, index) => (
            <AnswerButton
              key={`${answer}-${index}`}
              text={answer}
              onClick={() => handleAnswerClick(answer)}
              state={getAnswerState(answer) as "default" | "correct" | "reveal" | "wrong"}
              index={index}
              disabled={answered}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
