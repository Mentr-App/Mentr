import React from 'react'
import './Navbar.css'
import logo_img from '../../assets/logo.png'
import profile_img from '../../assets/user.png'
import search_img from '../../assets/search.png'
import chat_img from '../../assets/chat.png'
import create_img from '../../assets/create2.png'
import people_img from '../../assets/people.png'

const Navbar = () => {
  return (
    <div className='navbar'>
        <img src={logo_img} alt='' className='logo'/>
        <ul>
            <li>
                <img src={people_img}/>
            </li>
            <li>
                <img src={chat_img}/>
            </li>
            <li>
                <img src={create_img}/>
            </li>
        </ul>

        <div className='search-box'>
            <input type="text" placeholder="Search"/>
            <img src={search_img} alt=''/>
        </div>

        <img src={profile_img} alt='' className='user-icon'/>
    </div>
  )
}

export default Navbar