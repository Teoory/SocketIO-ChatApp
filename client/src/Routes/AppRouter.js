import React, { useContext, useEffect } from 'react';
import { UserContext } from '../Hooks/UserContext';
import { Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import Home from '../Pages/Home';

import Login from '../Pages/Login';
import Register from '../Pages/RegisterPage';
import Verify from '../Pages/VerifyPage';
import Profile from '../Pages/ProfilPage';
import Premium from '../Pages/PremiumPage';
import Purchase from '../Pages/PurchasePage';

import Chat from '../Pages/Chat';
import AddChannel from '../Pages/AddChannel';


const AppRouter = () => {
  const { setUserInfo, userInfo } = useContext(UserContext);
  
  useEffect(() => {
    fetch('http://localhost:3030/profile', {
        credentials: 'include',
    }).then(response => {
            response.json().then(userInfo => {
                setUserInfo(userInfo);
            });
        })
  }, []);
  
  const role = userInfo?.role;

  const isAdmin = role?.includes('admin');
  const isEditor = role?.includes('editor') || isAdmin;
  const isPremium = role?.includes('premium') || isEditor;
  const isUser = role?.includes('user') || isPremium;
  const isQuest = role?.includes('quest') || isUser;

  return (
    <Routes>
        <Route path="/*" element={<Home />} />
        <Route path="/register" element={<Register />} />

        {!isQuest && (
          <>
            <Route path="/login" element={<Login />} />
          </>
        )}

        {isQuest && (
          <>
            <Route path="/chat/:channelId" element={<Chat />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/purchase" element={<Purchase />} />
          </>
        )}

        {isAdmin && (
          <>
            <Route path="/addchannel" element={<AddChannel />} />
          </>
        )}
        
    </Routes>
  )
}

export default AppRouter