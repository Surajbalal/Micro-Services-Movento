import { useState } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";

import UserLogin from "./pages/userLogin";
import UserSignup from "./pages/userSignup";
import CaptainLogin from "./pages/CaptainLogin";
import CaptainSignup from "./pages/CaptainSignup";
import Start from "./pages/Start";
import Home from "./pages/Home";
import UserProtectWrapper from "./pages/UserProtectWrapper";
import UserLogout from "./pages/UserLogout";
import CaptainHome from "./pages/CaptainHome";
import CaptainProtectedWrapper from "./pages/CaptainProtectedWrapper";
import CaptainSettings from "./pages/CaptainSettings";
import CaptainHistory from "./pages/CaptainHistory";
import Riding from "./Components/Riding";
import CaptainRiding from "./Components/CaptainRiding";
import { Toaster } from "react-hot-toast";
import Call from "./Components/Call";

function App() {
  return (
    <>
     <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
        }}
      />

      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/riding" element={<Riding />} />
        <Route path="/captain-riding" element={<CaptainRiding />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/captain-login" element={<CaptainLogin />} />
        <Route path="/captain-signup" element={<CaptainSignup />} />
        <Route path="/call" element={<Call />} />

        <Route
          path="/captain-home"
          element={
            <CaptainProtectedWrapper>
              <CaptainHome />
            </CaptainProtectedWrapper>
          }
        />
        <Route
          path="/captain-settings"
          element={
            <CaptainProtectedWrapper>
              <CaptainSettings />
            </CaptainProtectedWrapper>
          }
        />
        <Route
          path="/captain-history"
          element={
            <CaptainProtectedWrapper>
              <CaptainHistory />
            </CaptainProtectedWrapper>
          }
        />

        <Route
          path="/home"
          element={
            <UserProtectWrapper>
              <Home />
            </UserProtectWrapper>
          }
        />
        <Route
          path="/user/logout"
          element={
            <UserProtectWrapper>
              <UserLogout />
            </UserProtectWrapper>
          }
        />
      </Routes>
    </>
  );
}

export default App;
