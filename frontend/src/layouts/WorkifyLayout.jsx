import React from 'react'
import { Outlet } from 'react-router-dom'
import WorkifyNavbar from '../components/WorkifyNavbar'
import WorkifySidebar from '../components/WorkifySidebar'
import '../styles/WorkifyLayout.css'

const WorkifyLayout = () => {
  return (
    <div className="workify-layout">
      <WorkifyNavbar />
      <div className="workify-content">
        <WorkifySidebar />
        <main className="workify-main">
          <div className="workify-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default WorkifyLayout
