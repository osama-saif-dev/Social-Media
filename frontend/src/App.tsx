import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import HomePage from "./Pages/HomePage";
import SignupPage from "./Pages/SignupPage";
import VerifyCode from "./Pages/VerifyCode";
import ForgetPassword from "./Pages/ForgetPassword";
import ResetPassword from "./Pages/ResetPassword";
import { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import Layout from "./Components/Layout";
import FriendRequests from "./Pages/FriendRequests";
import MessagesPage from "./Pages/MessagesPage";
import BookMarksPage from "./Pages/BookMarksPage";
import MyProfilePage from "./Pages/MyProfilePage";
import UserProfilePage from "./Pages/UserProfilePage";
import FriendsPage from "./Pages/FriendsPage";
import useSocket from "./hooks/useSocket";
import NotificationsPage from "./Pages/NotificationsPage";
import { ToastContainer } from 'react-toastify';
import PostPage from "./Pages/PostPage";
import SuggestedFriendsPage from "./Pages/SuggestedFriendsPage";
import MessagesNotification from "./Pages/MessagesNotification";

export default function App() {
  useSocket();
  const { accessToken } = useAuthStore();

  const location = useLocation();
  useEffect(() => {
    if (!location.pathname.startsWith('/verify-code')) {
      Cookies.remove('access_token');
    }
  }, [location.pathname]);

  const temporaryToken = Cookies.get('access_token');

  return (
    <div className="relative">
      <ToastContainer position="top-left"/>
      <Routes>
        <Route path="/" element={accessToken ? (
          <Layout showNav={true}>
            <HomePage />
          </Layout>
        ) : <Navigate to={'/login'} />} />

        <Route path="/profile" element={accessToken ? (
          <Layout showNav={true}>
            <MyProfilePage />
          </Layout>
        ) : <Navigate to={'/login'} />} />

        <Route path="/messages/:id" element={accessToken ? (
          <Layout showNav={true}>
            <MessagesPage />
          </Layout>
        ) : <Navigate to={'/login'} />} />

        <Route path="/messages" element={accessToken ? (
          <Layout showNav={true}>
            <MessagesNotification />
          </Layout>
        ) : <Navigate to={'/login'} />} />

        <Route path="/book-marks" element={accessToken ? (
          <Layout showNav={true}>
            <BookMarksPage />
          </Layout>
        ) : <Navigate to={'/login'} />} />

        <Route path="/friend-request" element={accessToken ? (
          <Layout showNav={true}>
            <FriendRequests />
          </Layout>
        ) : <Navigate to={'/login'} />} />

        <Route path="/user/:id" element={accessToken ? (
          <Layout showNav={true}>
            <UserProfilePage />
          </Layout>
        ) : <Navigate to={'/login'} />} />

        <Route path="/post/:id" element={accessToken ? (
          <Layout showNav={true}>
            <PostPage />
          </Layout>
        ) : <Navigate to={'/login'} />} />

        <Route path="/friends" element={accessToken ? (
          <Layout showNav={true}>
            <FriendsPage />
          </Layout>
        ) : <Navigate to={'/login'} />} />

        <Route path="/notifications" element={accessToken ? (
          <Layout showNav={true}>
            <NotificationsPage />
          </Layout>
        ) : <Navigate to={'/login'} />} />

        <Route path="/suggested-friends" element={accessToken ? (
          <Layout showNav={true}>
            <SuggestedFriendsPage />
          </Layout>
        ) : <Navigate to={'/login'} />} />

        <Route path="/login" element={!accessToken ? <LoginPage /> : <Navigate to={'/'} />} />
        <Route path="/signup" element={!accessToken ? <SignupPage /> : <Navigate to={'/'} />} />
        <Route path="/verify-code" element={temporaryToken ? <VerifyCode /> : <Navigate to={'/login'} />} />
        <Route path="/forget-password" element={!accessToken ? <ForgetPassword /> : <Navigate to={'/'} />} />
        <Route path="/reset-password" element={!accessToken ? <ResetPassword /> : <Navigate to={'/'} />} />
      </Routes>
      <Toaster />
    </div>
  )
}