import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const userDataContext = createContext();

const UserContext = ({ children }) => {
  const serverUrl = "https://ai-assistant-zi7q.onrender.com"; 
  const [userData, setUserData] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [frontenImage, setFrontendImage] = useState(null); 
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [isUserLoading, setIsUserLoading] = useState(true); 

  const handleCurrentUser = async () => {
    setIsUserLoading(true); // Loading shuru
    try {
      const response = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });
      setUserData(response.data);
    } catch (error) {
      console.log("❌ Error fetching current user:", error);
    } finally {
      setIsUserLoading(false); 
    }
  };

const getGeminiResponse = async (command)=>{
    try {
        const result = await axios.post(`${serverUrl}/api/user/asktoassistant`,
            {command},
            {withCredentials: true}
        )
        return result.data
    } catch (error) {
        console.log(error)
    }
}

  useEffect(() => {
    if (!userData) {
      handleCurrentUser();
    }
  }, [userData]);




  
  return (
    <userDataContext.Provider
      value={{
        serverUrl,
        userData,
        setUserData,
        backendImage,
        setBackendImage,
        frontenImage, 
        setFrontendImage,
        selectedImage,
        setSelectedImage,
        isUserLoading,
        getGeminiResponse 
      }}
    >
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;