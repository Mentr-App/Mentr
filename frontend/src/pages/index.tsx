import React from 'react'
import Forum from '../components/Forum/Forum'
import Navbar from '../components/Navbar/Navbar'
import Sidebar from '../components/Sidebar/Sidebar'



export default function Home()  {
  return (
    <div className='bg-[#1E252B] w-screen min-h-screen'>
        <Navbar/>
        <div className='flex flex-row'>
            <Sidebar/>
            <Forum/>
        </div>
    </div>
  )
}