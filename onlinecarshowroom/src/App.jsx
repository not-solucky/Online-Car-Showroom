import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CarPage from './pages/CarPage';
import RentPage from './pages/RentPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './admin/dashboard';
import OrderPage from './pages/orderPage';
import ProfilePage from './profile/profile';
import './App.css'



function App() {
  return (
    <>
        <div className="relative flex flex-col root-container">
        <Router>
          <Navbar />
          <Routes>
            <Route exact path="/" element={<HomePage />} />
            <Route exact path="/cars" element={<CarPage />} />
            <Route exact path="/order/:carId" element={<OrderPage />} />
            <Route exact path='/login' element={<LoginPage />} />
            <Route exact path='/signup' element={<SignupPage />} />
            <Route exact path='/dashboard' element={<DashboardPage />} />
            <Route exact path='/profile' element={<ProfilePage />} />
          </Routes>
        </Router>
          
        </div>
    </>
  )
}

export default App
