// @ts-nocheck

import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard'; // Import Dashboard component
import SignUp from './pages/SignUp'; // Import SignUp component
import ProtectedRoute from './ProtectedRoute';
import NotFound from './pages/NotFound'; // Assuming you have a NotFound component
import Profile from './components/profile'; // Import Profile component
import Posts from './components/Posts'; // Import Posts component
import Editor from './components/Editor'; // Import Editor component
import ImageEditor from './components/ImageEditor'; // Import ImageEditor component
import FullEditor from './pages/ImageEditor/FullEditor'; // Import FullEditor component
function App() {
  return (
    <Router>
      <Routes>
        {/* The "landing" route */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home/>}/>
        {/* If user not authenticated, they can sign up or log in */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Example protected routes (you can also do a custom check in each page) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/imageEditor" element={<ImageEditor />} />
        <Route path="/fullEditor" element={<FullEditor />} />

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}


export default App;