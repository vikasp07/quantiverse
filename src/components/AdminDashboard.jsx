// import React from "react";
// import Sidebar from "./Sidebar"; // adjust path if needed

// const AdminDashboard = () => {
//   return (
//     <div className="flex min-h-screen bg-gray-800 text-white">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Content */}
//       <div className="flex-1 p-6">
//         <h1 className="text-2xl font-bold mb-4">Hello There I m admin</h1>
//         {/* Add admin-specific dashboard content here */}
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useState } from "react";
import Layout from "./Layout";
// import AddQuestionBank from "./admin/AddQuestionBank"; // Disabled

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <Layout>
      <div className="p-6">
        {/* Question Bank Feature Disabled */}
        {/* {activeTab === "Add Question Bank" && <AddQuestionBank />} */}
        <div className="text-center py-12">
          <p className="text-slate-600">Question Bank feature is currently disabled.</p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
