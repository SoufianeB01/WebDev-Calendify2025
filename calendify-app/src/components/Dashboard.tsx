import React from 'react';

export default class Dashboard extends React.Component {
  render() {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-2xl font-semibold text-teal-700">Dashboard</p>
        {/* placeholder content */}
        <div className="text-sm text-teal-800">Welcome.</div>
      </div>
    );
  }
}
