import React, { useContext, useRef, useState } from "react";
import Card from "./Card";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/image3.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.jpeg";
import image7 from "../assets/image7.jpeg";
import { RiImageAddLine } from "react-icons/ri";
import { MdKeyboardBackspace } from "react-icons/md";
import { userDataContext } from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";

export const Customize = () => {
  const [cards] = useState([image1, image2, image3, image4, image5, image6, image7]);
  const { selectedImage, setSelectedImage } = useContext(userDataContext);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputImage = useRef();
  const navigate = useNavigate();

  const handleCardClick = (image) => setSelectedImage(image);
  const handleAddClick = () => inputImage.current.click();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const newImage = URL.createObjectURL(e.target.files[0]);
      setUploadedImage(newImage);
      setSelectedImage(newImage);
    }
  };

  const handleNext = () => {
    if (!selectedImage) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/customizename");
    }, 1000);
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-t from-black to-[#030353] flex flex-col justify-center items-center px-4 sm:px-6 md:px-10 overflow-hidden">

      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 text-white text-4xl p-2 rounded-full hover:scale-110 hover:shadow-xl hover:shadow-blue-500 transition-transform"
      >
        <MdKeyboardBackspace />
      </button>

      <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-center">
        Choose Your Assistant
      </h1>

      <div className="w-full max-w-[1200px] flex justify-center items-center gap-4 sm:gap-6 md:gap-8 flex-wrap">
        {cards.map((image, index) => (
          <div key={index} onClick={() => handleCardClick(image)}>
            <Card image={image} />
          </div>
        ))}

        {/* Add Image Card */}
        <div
          onClick={handleAddClick}
          className={`w-[120px] h-[200px] sm:w-[140px] sm:h-[230px] md:w-[150px] md:h-[250px] 
          lg:w-[180px] lg:h-[300px] flex justify-center items-center bg-[#030326] 
          border-2 border-[#0000ff66] rounded-2xl hover:scale-105 hover:shadow-xl 
          hover:border-white transition-transform duration-200 cursor-pointer 
          ${selectedImage === uploadedImage ? "border-white border-4" : ""}`}
        >
          {!uploadedImage ? (
            <RiImageAddLine className="text-white text-4xl sm:text-5xl md:text-6xl" />
          ) : (
            <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover rounded-2xl" />
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={inputImage}
        hidden
        onChange={handleFileChange}
      />

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={!selectedImage || loading}
        className={`mt-8 w-[60%] sm:w-[40%] h-[55px] font-semibold rounded-full text-[18px] transition duration-200 ${
          !selectedImage || loading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-white text-black hover:bg-blue-500 hover:text-white hover:scale-105 hover:shadow-lg cursor-pointer"
        }`}
      >
        {loading ? (
          <div className="flex justify-center items-center gap-2">
            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : (
          "Next"
        )}
      </button>
    </div>
  );
};
