import React, { useState } from "react";
import { FileText, Target, HelpCircle, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import ActionCard from "./ActionCard";
import InterviewTable from "./InterviewTable";
import { useNavigate } from "react-router-dom";
import JobReadinessAssessmentForm from "./job_readiness/Forms";
import JobReadinessGoalSelector from "./job_readiness/JobReadinessGoalSelector";
import { MockInterviewForm } from "./mock/MockInterviewForm";
import InterviewReminder from "./mock/InterviewReminder";

const MockInterviewDashboard = () => {
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showMockInterviewForm, setMockInterviewForm] = useState(false);
  const navigate = useNavigate();

  const handleSelectExisting = (goal) => {
    setSelectedGoal(goal);
    setShowGoalSelector(false);
    setShowAssessmentForm(true);
    console.log("Selected existing goal:", goal);
  };

  const handleCreateNew = () => {
    setShowGoalSelector(false);
    setShowAssessmentForm(true);
  };

  const handleCardClick = (cardType) => {
    if (cardType === "Job Readiness Assessment") {
      setShowGoalSelector(true);
    } else if (cardType === "Mock Interview") {
      setMockInterviewForm(true);
    } else if (cardType === "Practicing Questions") {
      navigate("/practicing-questions");
    } else {
      console.log(`Clicked on ${cardType}`);
    }
  };

  const features = [
    "AI-powered realistic interview simulations",
    "Instant feedback on your responses",
    "Role-specific question customization",
    "Track your improvement over time",
  ];

  return (
    <div className="flex-1 overflow-auto bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="p-8">
          <InterviewReminder />
          
          {/* Hero Section */}
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-indigo-600">AI-Powered Interview Prep</span>
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-3">
                Mock Interview Dashboard
              </h1>
              <p className="text-slate-600 text-base leading-relaxed max-w-2xl mb-6">
                Sharpen your interview skills with our AI-powered mock interviews. 
                Get realistic practice sessions, instant feedback, and tailored questions 
                based on your target role. Build confidence before your next big interview.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-sm text-slate-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Action Cards Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ActionCard
              icon={FileText}
              title="Job Readiness Assessment"
              description="Evaluate your job-seeking preparedness"
              onClick={() => handleCardClick("Job Readiness Assessment")}
            />
            <ActionCard
              icon={Target}
              title="Mock Interview"
              description="Practice with AI-powered interviews"
              onClick={() => handleCardClick("Mock Interview")}
              primary
            />
            <ActionCard
              icon={HelpCircle}
              title="Practice Questions"
              description="Study common interview questions"
              onClick={() => handleCardClick("Practicing Questions")}
            />
          </div>
        </div>

        {/* Interview History Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Recent Interviews</h2>
            <p className="text-sm text-slate-500 mt-0.5">Track your interview history and performance</p>
          </div>
          <InterviewTable />
        </div>
      </div>

      {/* Modals */}
      {showGoalSelector && (
        <JobReadinessGoalSelector
          onSelectExisting={handleSelectExisting}
          onCreateNew={handleCreateNew}
        />
      )}

      <JobReadinessAssessmentForm
        open={showAssessmentForm}
        onClose={() => setShowAssessmentForm(false)}
        selectedGoal={selectedGoal}
      />

      <MockInterviewForm
        open={showMockInterviewForm}
        onClose={() => setMockInterviewForm(false)}
      />
    </div>
  );
};

export default MockInterviewDashboard;
