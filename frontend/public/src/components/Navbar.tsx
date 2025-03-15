// @ts-nocheck

import React from 'react';
import { FaUserAlt } from 'react-icons/fa';

const Navbar = () => {
  return (
    <div className=''>
    <div className='bg-white h-16 '>
      <div className="hidden md:flex items-center justify-end mr-8 pt-4">
        <span className="text-gray-600 mr-2">John Doe</span>
        <div className="bg-blue-100 rounded-full p-2">
          <FaUserAlt className="text-blue-500" />
        </div>
      </div>
    </div>
    </div>
  );
};

export default Navbar;