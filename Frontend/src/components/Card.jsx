import React, { useContext } from "react";
import { userDataContext } from "../context/UserContext.jsx";

const Card = ({ image }) => {
  const {
    setSelectedImage,
    setBackendImage,
    setFrontendImage,
    selectedImage
  } = useContext(userDataContext);

  return (
    <div
      onClick={() => {
        setSelectedImage(image);
        setBackendImage(null);
        setFrontendImage(null);
      }}
      className={`w-[120px] h-[200px] sm:w-[140px] sm:h-[230px] md:w-[150px] md:h-[250px] lg:w-[180px] 
      lg:h-[250px] overflow-hidden bg-[#030326] border-2 border-[#0000ff66] rounded-2xl 
      hover:scale-105 hover:shadow-2xl hover:shadow-blue-950 hover:border-white transition-transform 
      duration-200 cursor-pointer ${selectedImage === image ? "border-4 border-white" : ""}`}
    >
      <img
        src={image}
        alt="Assistant"
        className="w-full h-full object-cover rounded-2xl"
      />
    </div>
  );
};

export default Card;
