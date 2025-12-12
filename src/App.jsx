import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Chatbot from './components/chatbot/ChatBot';

// Pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetailsPage from './pages/EventDetailsPage';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import VerifyTicket from './pages/VerifyTicket';
import ContactUs from './pages/ContactUs';

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetailsPage />} />
                <Route path="/login" element={<Login />} />
                {/* <Route path="/register" element={<Register />} /> */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-ticket/:token" element={<VerifyTicket />} />
                <Route path="/contact" element={<ContactUs />} /> 


                {/* Protected Routes - User */}
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute allowedRoles={['User']}>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Routes - Organizer */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['Organizer']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Routes - Admin */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Routes - All Authenticated Users */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }  

  
                />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Chatbot />
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;