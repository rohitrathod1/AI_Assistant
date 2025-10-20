import React, { useContext, useState } from "react";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export const CustomizeName = () => {
  const { userData, backendImage, selectedImage, serverUrl, setUserData } =
    useContext(userDataContext);

  const [assistantName, setAssistantName] = useState(userData?.assistantName || "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdateAssistant = async () => {
    if (assistantName.trim() === "") {
      console.error("Please enter a name!");
      return;
    }

    setLoading(true);
    try {
      let formData = new FormData();
      formData.append("assistantName", assistantName);
      
      // Send the file object if a custom image was uploaded (backendImage should hold the File object)
      if (backendImage) {
        formData.append("assistantImage", backendImage);
      
      // Send the static path or blob URL if a default image was selected OR if no new file object exists
      } else if (selectedImage) {
        formData.append("imageUrl", selectedImage);
      }

      const response = await axios.post(`${serverUrl}/api/user/update`, formData, {
        withCredentials: true,
      });

      const apiResponseData = response.data;
      
      // Patching logic to ensure correct spelling and fallbacks are used for state update
      const imageFromResponse = apiResponseData.assistantImage ;
      const nameFromResponse = apiResponseData.assistantName;

      const updatedUserData = {
        ...apiResponseData,
        assistantName: nameFromResponse, 
        assistantImage: imageFromResponse, 
      };

      setUserData(updatedUserData);
      navigate("/");
    } catch (error) {
      console.error("❌ Error updating assistant:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-t from-black to-[#030353] flex flex-col justify-center items-center py-10 px-4 sm:px-6 md:px-10">

      <button
        onClick={() => navigate("/customize")}
        className="absolute top-4 left-4 text-white text-4xl p-2 rounded-full hover:scale-110 hover:shadow-xl hover:shadow-blue-500 transition-transform"
      >
        <MdKeyboardBackspace />
      </button>

      <div className="flex flex-col justify-center items-center w-full">
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-center">
          Enter Your{" "}
          <span className="font-semibold text-blue-600">Assistant Name</span>
        </h1>

        <input
          type="text"
          value={assistantName}
          onChange={(e) => setAssistantName(e.target.value)}
          placeholder="eg : Jarvis"
          className="w-full max-w-[600px] text-[17px] sm:text-[18px] h-[55px] outline-none border-2 rounded-full border-white bg-transparent p-4 text-white placeholder-gray-300 focus:border-blue-400 transition"
        />

        <div className="mt-6 w-full max-w-[600px] h-[50px] flex justify-center">
          <button
            onClick={handleUpdateAssistant}
            disabled={assistantName.trim() === "" || loading}
            className={`w-[45%] sm:w-[35%] h-full bg-white text-black font-semibold rounded-full text-[16px] sm:text-[17px]
            hover:bg-blue-500 hover:text-white hover:scale-105 hover:shadow-lg transition-all duration-300
            ${assistantName.trim()
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3 pointer-events-none"}`}
          >
            {loading ? (
              <div className="flex justify-center items-center gap-2">
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
