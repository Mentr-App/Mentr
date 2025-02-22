import React from 'react'
import Forum from '../components/Forum/Forum'
import Navbar from '../components/Navbar/Navbar'
import Sidebar from '../components/Sidebar/Sidebar'

const Home = () => {
  return (
    <div className='container'>
        <Navbar/>
        <div className='app-container'>
            <Sidebar/>
            <Forum/>
        </div>
    </div>
  )
}

export default Home