// @ts-nocheck

import React, { useState } from 'react';
import { FaCalendarAlt, FaGift, FaFileAlt, FaSignOutAlt, FaTachometerAlt, FaBars, FaUser, FaCaretDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CardAccordion = ({ title, image, details }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <img src={image} alt={title} className="w-full h-32 object-cover mb-4 rounded-lg" />
      <ul className="text-gray-600">
        {Object.entries(details).map(([key, value]) => (
          <li key={key} className="mb-2">
            <strong>{key}:</strong> {value}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBusinessOpen, setIsBusinessOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleBusiness = () => {
    setIsBusinessOpen(!isBusinessOpen);
  };

  const cardData = [
    {
      title: 'Card 1 title',
      image: 'https://www.w3schools.com/w3images/lights.jpg',
      details: { Description: 'Sample content for dashboard card 1', Date: '2023-10-01' },
    },
    {
      title: 'Card 2 title',
      image: 'https://www.w3schools.com/w3images/nature.jpg',
      details: { Description: 'Sample content for dashboard card 2', Date: '2023-10-02' },
    },
    {
      title: 'Card 3 title',
      image: 'https://www.w3schools.com/w3images/mountains.jpg',
      details: { Description: 'Sample content for dashboard card 3', Date: '2023-10-03' },
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col md:flex-row">
        <div className="flex md:hidden pl-4 pt-2 justify-between items-center mb-2">
          <button
            className="p-4"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <FaBars className="text-xl" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">Welcome Back!</h2>
          <div className="md:hidden flex mr-6">
            <span className="text-gray-600 text-sm mr-2 mt-1">John Doe</span>
            <div className="bg-blue-100 rounded-full p-2">
              <FaUser className="text-blue-500" />
            </div>
          </div>
        </div>
        <div className={`w-full md:w-64 bg-white h-auto md:h-screen shadow-md ${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
          <div className="p-4 flex flex-col justify-between h-full">
            <div>
              <h1 className="text-[22px] font-bold text-blue-600 mb-4 flex items-center hidden md:flex">
                Dashboard
                <FaBars className="ml-24 text-[26px] text-gray-600" />
              </h1>
              <div className="flex items-center border border-gray-300 rounded-lg p-2">
                <img src="https://www.w3schools.com/w3images/avatar2.png" alt="Logo" className="mr-2 w-8 h-8" />
                <span className="text-lg text-gray-600">Acme Corp</span>
                <button className="ml-2"><FaCaretDown /></button>
              </div>
              <ul>
                <li className="mb-2">
                  <a href="#" className="flex items-center p-2 text-blue-600 hover:bg-blue-100 rounded">
                    <FaTachometerAlt className="mr-2" /> Dashboard
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
                    <FaFileAlt className="mr-2" /> Posts
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
                    <FaCalendarAlt className="mr-2" /> Calendar
                  </a>
                </li>
                <li className="mb-2">
                  <button onClick={toggleBusiness} className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded w-full text-left">
                    <FaGift className="mr-2" /> Business
                    <FaCaretDown className={`ml-auto transform ${isBusinessOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isBusinessOpen && (
                    <ul className="pl-6 mt-2">
                      <li className="mb-2">
                        <a href="" onClick={() => navigate('/profile')} className="text-gray-700 hover:bg-gray-100 rounded block p-2">Profile</a>
                      </li>
                      <li className="mb-2">
                        <a href="#" className="text-gray-700 hover:bg-gray-100 rounded block p-2">Branding</a>
                      </li>
                      <li className="mb-2">
                        <a href="#" className="text-gray-700 hover:bg-gray-100 rounded block p-2">Socials</a>
                      </li>
                      <li className="mb-2">
                        <a href="#" className="text-gray-700 hover:bg-gray-100 rounded block p-2">Team</a>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </div>
            <div className="mt-4">
              <a href="#" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
                <FaSignOutAlt className="mr-2" /> Logout
              </a>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-blue-50">
          <div className='bg-white h-[8%]'>
            <div className="hidden md:flex items-center justify-end mr-8 pt-4">
              <span className="text-gray-600 mr-2">John Doe</span>
              <div className="bg-blue-100 rounded-full p-2">
                <FaUser className="text-blue-500" />
              </div>
            </div>
          </div>
          <div className="hidden md:flex md:pl-6 pt-6 items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Welcome Back!</h2>
          </div>
          <div className="grid pl-6 pr-6 mt-7 md:mt-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cardData.map((card, index) => (
              <CardAccordion key={index} title={card.title} image={card.image} details={card.details} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;