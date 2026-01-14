import React, { useState } from "react";
import { CheckCircle, Star } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Feedback = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();


  const questions = [
    {
      question: "How likely are you to recommend our Mock Interview to a friend?",
      type: "rating",
    },
    {
      question: "What problem do you want the Mock Interview to help with?",
      type: "multipleChoice",
      options: [
        "Nailing technical questions",
        "Crushing behavioral interviews",
        "Getting comfy with the whole process",
        "Improving my interview chat game",
        "Other (Tell us!)",
      ],
    },
    {
      question: "How do you feel about the pacing of the interaction with the copilot avatar?",
      type: "multipleChoice",
      options: ["Too slow", "Too fast", "Just right"],
    },
    {
      question: "How satisfied are you with the responses the copilot provides?",
      type: "multipleChoice",
      options: ["Super helpful!", "Meh, could be better", "Not helpful at all"],
    },
    {
      question: "Do you have any additional comments or suggestions?",
      type: "text",
    },
  ];

  const handleResponse = (value) => {
    setResponses({ ...responses, [currentQuestionIndex]: value });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setSubmitted(true);
    }
  };

  const renderQuestion = () => {
    const q = questions[currentQuestionIndex];

    if (q.type === "rating") {
      const rating = responses[currentQuestionIndex] || 0;
      return (
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleResponse(star)}
              className={`p-2 rounded ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
                
              <Star className="w-6 h-6" fill={star <= rating ? "#facc15" : "none"} />
            </button>
          ))}
        </div>
      );
    }

    if (q.type === "multipleChoice") {
      return (
        <div className="space-y-2">
          {q.options.map((option, idx) => (
            <label key={idx} className="flex items-center gap-2">
              <input
                type="radio"
                name={`q-${currentQuestionIndex}`}
                value={option}
                checked={responses[currentQuestionIndex] === option}
                onChange={() => handleResponse(option)}
                className="accent-blue-600"
              />
              {option}
            </label>
          ))}
        </div>
      );
    }

    if (q.type === "text") {
      return (
        <textarea
          rows={4}
          placeholder="Type anything you wish to share..."
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={responses[currentQuestionIndex] || ""}
          onChange={(e) => handleResponse(e.target.value)}
        />
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-radial-blue">
      <span className="text-9xl p-6">🎉</span>
      <h2 className="text-2xl p-2 font-semibold mb-4 text-center">
        Well done! You’ve finished your mock interview.
      </h2>
      <button
        className="button button-lg"
        onClick={() => navigate('/internship')}
      >
        Go to Dashboard
      </button>
      
      {!submitted ? (
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 mt-4">
          <h3 className="text-lg font-medium mb-4">
            {questions[currentQuestionIndex].question}
          </h3>
          {renderQuestion()}
          <button
            onClick={handleNext}
            className="button button-m w-full  mt-5"
          >
            {currentQuestionIndex < questions.length - 1 ? "Next" : "Submit"}
          </button>
        </div>
      ) : (
        <div className="mt-6 w-full max-w-md p-4 text-center bg-white rounded-2xl shadow-2xl">
            <p className="text-2xl font-semibold text-blue-950 mb-4">
                Thank you for your feedback!
            </p>
        </div>

      )}
    </div>
  );
};

export default Feedback;
