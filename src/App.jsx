// import { Routes, Route } from "react-router-dom";
// import Index from "./pages/Index";
// import VideoCallContent from "./components/mock/VideoCallContent";
// import PracticingQuestions from "./components/practicing_questions/PracticingQuestions";
// import JobReadinessAssessment from "./components/job_readiness/JobReadinessAssessment";
// import Feedback from "./components/job_readiness/Feedback";
// import Signin from "./components/signin";
// import Signup from "./components/signup";

// function App() {
//   return (
//     <>
//       <p style={{ color: "white" }}>App Loaded</p>
//       <Routes>
//         <Route path="/" element={<Index />} />
//         <Route path="/signin" element={<Signin />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/mockInterview" element={<VideoCallContent />} />
//         <Route path="/practicing-questions" element={<PracticingQuestions />} />
//         <Route
//           path="/job-readiness-assessment"
//           element={<JobReadinessAssessment />}
//         />
//         <Route path="/feedback" element={<Feedback />} />
//       </Routes>
//     </>
//   );
// }

// export default App;

import { Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import "./styles.css";
// import VideoCallContent from "./components/mock/VideoCallContent";
import PracticingQuestions from "./components/practicing_questions/PracticingQuestions";
import JobReadinessAssessment from "./components/job_readiness/JobReadinessAssessment";
import Feedback from "./components/job_readiness/Feedback";
import Signin from "./components/Auth/signin";
import Signup from "./components/Auth/signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserAuth } from "./components/Auth/AuthContext";
import UpdatePassword from "./components/Auth/UpdatePassword";
import AdminDashboard from "./components/AdminDashboard";
import InterviewReminder from "./components/mock/InterviewReminder";
import ATSChecker from "./components/ATSChecker"; // Adjust path if needed
import PreparationHub from "./pages/PreparationHub";
import InternshipDashboard from "./components/internship/InternshipDashboard";
import SimulationDetail from "./components/internship/SimulationDetail";
import SimulationTaskPage from "./components/internship/SimulationTaskPage";
import ProgressPage from "./components/internship/ProgressPage";
import ResumeFromScratch from "./components/resume_from_scratch/ResumeFromScratch";
import ATSScanner from "./components/ATSChecker";
import ScanResults from "./components/ScanResults";

import AddInternship from "./components/admin/AddInternship";
import SimulationsManager from "./components/admin/SimulationsManager";
import Confirmation from "./components/admin/Confirmation";
import InternshipCandidates from "./components/internship/InternshipCandidates";
import InternshipSubmissions from "./components/internship/InternshipSubmissions";
import LandingPage from "./components/resume_builder/LandingPage";
import ResumeBuilder from "./components/resume_builder/ResumeBuilder";
import DocumentCenter from "./components/document_center/DocumentCenter";
import UserProfile from "./components/profile/UserProfile";
import ActivityTracker from "./components/utils/ActivityTracker";

function App() {
  const { session } = UserAuth();

  return (
    <>
      {/* Activity Tracker - tracks user activity when logged in */}
      {session?.user && <ActivityTracker />}
      <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/confirmation"
        element={
          <ProtectedRoute>
            <Confirmation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-internship"
        element={
          <ProtectedRoute>
            <AddInternship />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-internship"
        element={
          <ProtectedRoute>
            <SimulationsManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-internship/:id"
        element={
          <ProtectedRoute>
            <SimulationsManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/internship/:internshipId/candidates"
        element={
          <ProtectedRoute>
            <InternshipCandidates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/internship/:internshipId/submissions"
        element={
          <ProtectedRoute>
            <InternshipSubmissions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/user/:userId/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes */}
      {/* Mock Interview /home - Disabled
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <InterviewReminder />
            <Index />
          </ProtectedRoute>
        }
      />
      */}
      {/* Mock Interview /mockInterview - Disabled
      <Route
        path="/mockInterview"
        element={
          <ProtectedRoute>
            <VideoCallContent />
          </ProtectedRoute>
        }
      />
      */}
      <Route
        path="/practicing-questions"
        element={
          <ProtectedRoute>
            <PracticingQuestions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-readiness-assessment"
        element={
          <ProtectedRoute>
            <JobReadinessAssessment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <ProtectedRoute>
            <Feedback />
          </ProtectedRoute>
        }
      />
      {/* ATS Checker - Disabled
      <Route path="/ats-checker" element={<ATSChecker />} />
      */}

      {/* Preparation Hub - Disabled
      <Route
        path="/preparation-hub"
        element={
          <ProtectedRoute>
            <PracticingQuestions />
          </ProtectedRoute>
        }
      />
      */}

      <Route
        path="/internship"
        element={
          <ProtectedRoute>
            <InternshipDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/simulation/:id"
        element={
          <ProtectedRoute>
            <SimulationDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/internship/:id/task/:taskId"
        element={
          <ProtectedRoute>
            <SimulationTaskPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        }
      />

      {/* ATS Scanner - Disabled
      <Route
        path="/ats-scanner"
        element={
          <ProtectedRoute>
            <SimulationDetail />
          </ProtectedRoute>
        }
      />
      */}
      {/* ATS Results - Disabled
      <Route
        path="/results"
        element={
          <ProtectedRoute>
            <ScanResults />
          </ProtectedRoute>
        }
      />
      */}
      {/* Resume Builder - Disabled
      <Route path="/resume" element={<ResumeBuilder />} />
      <Route path="/land" element={<LandingPage />} />
      */}

      {/* Document Center - Disabled
      <Route
        path="/document-center"
        element={
          <ProtectedRoute>
            <DocumentCenter />
          </ProtectedRoute>
        }
      />
      */}

      {/* Resume From Scratch - Disabled
      <Route path="/resume-from-scratch" element={<ResumeFromScratch />} />
      */}
    </Routes>
    </>
  );
}

export default App;
