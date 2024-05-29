import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Chat from "./Chat/Chat";
import LoginComponent from "./Authen/Login/Login";

function App(props) {
  return (
    <Routes>
      <Route path="/SignIn" element={<LoginComponent />} />
      <Route path="/Chat" element={<Chat />} />
    </Routes>
  );
}

export default App;
