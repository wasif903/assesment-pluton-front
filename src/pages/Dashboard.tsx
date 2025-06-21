import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-center text-blue-700">Admin Dashboard</h1>
      <p className="text-center mt-4">This page is only accessible to Admin users.</p>
    </div>
  );
};

export default Dashboard; 