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
import AddQuestionBank from "./admin/AddQuestionBank";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("Add Question Bank");

  return (
    <Layout>
      <div className="p-6">
        {activeTab === "Add Question Bank" && <AddQuestionBank />}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
