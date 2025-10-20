import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { Home } from "./components/Home";
import { Signup } from "./components/Signup";
import { Login } from "./components/Login";
import { Customize } from "./components/Customize";
import { CustomizeName } from "./components/CustomizeName";
import { userDataContext } from "./context/UserContext";

function App() {
  const { userData } = useContext(userDataContext);

  const isLoggedIn = Boolean(userData);
  const isCustomized = Boolean(userData?.assistantName && userData?.assistantImage);
  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn
            ? isCustomized
              ? <Home />
              : <Navigate to="/customize" replace />
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/signup"
        element={!isLoggedIn ? <Signup /> : <Navigate to="/" replace />}
      />
      <Route
        path="/login"
        element={!isLoggedIn ? <Login /> : <Navigate to="/" replace />}
      />
      <Route
        path="/customize"
        element={isLoggedIn ? <Customize /> : <Navigate to="/signup" replace />}
      />
      <Route
        path="/customizeName"
        element={isLoggedIn ? <CustomizeName /> : <Navigate to="/signup" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
