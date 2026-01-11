import React from "react";
import Layout from "../components/Layout";
import UploadResume from "../components/preparation_hub/UploadResume";

const PreparationHub = () => {
  return (
    <Layout>
      <div className="p-6">
        <UploadResume />
      </div>
    </Layout>
  );
};

export default PreparationHub;
