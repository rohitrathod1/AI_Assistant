import React, { useState, useContext } from "react";
import bg from "../assets/home.jpg";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { set, useForm } from "react-hook-form";
import axios from "axios";
import { userDataContext } from "../context/UserContext";

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loading state
  const navigate = useNavigate();
  const { serverUrl,userData, setUserData } = useContext(userDataContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const handleLogin = async (data) => {
    setLoading(true); // start loading
    setServerError("");
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/login`,
        { email: data.email, password: data.password },
        { withCredentials: true }
      );
      setUserData(res.data); // set user data in context
      reset();
      navigate("/");
    } catch (error) {
      console.log(error);
      setUserData(null);
      setServerError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <div
      className="w-full h-screen flex justify-center items-center px-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        onSubmit={handleSubmit(handleLogin)}
        className="w-full max-w-md bg-[#0000002b] backdrop-blur-md p-8 rounded-2xl shadow-lg flex flex-col items-center gap-6"
      >
        {/* Title */}
        <h1 className="text-white text-2xl sm:text-3xl font-semibold text-center">
          Login To <span className="font-bold text-blue-400">Virtual Assistant</span>
        </h1>

        {/* Email Input */}
        <div className="w-full min-h-[72px]">
          <input
            type="email"
            placeholder="Enter your Email"
            className="w-full text-[18px] h-[55px] outline-none border-2 rounded-full border-white bg-transparent p-4 text-white placeholder-gray-300 focus:border-blue-400 transition pr-12"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Enter a valid email address",
              },
            })}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-2 pl-2">{errors.email.message}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="w-full min-h-[72px]">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              className="w-full text-[18px] h-[55px] outline-none border-2 rounded-full border-white bg-transparent p-4 pr-12 text-white placeholder-gray-300 focus:border-blue-400 transition"
              {...register("password", {
                required: "Password is required",
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    "Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number & 1 special character",
                },
              })}
            />
            {showPassword ? (
              <IoEyeOff
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-[22px] cursor-pointer"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <IoEye
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-[22px] cursor-pointer"
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm mt-2 pl-2">{errors.password.message}</p>
          )}
        </div>

        {/* Server Error */}
        {serverError && (
          <p className="text-red-500 text-sm text-center">{serverError}</p>
        )}

        {/* Submit Button with Loader */}
        <button
          type="submit"
          disabled={loading}
          className={`w-[60%] sm:w-[40%] h-[55px] font-semibold rounded-full text-[18px] transition duration-200 ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-white text-black hover:bg-blue-500 hover:text-white hover:scale-105 hover:shadow-lg cursor-pointer"
          }`}
        >
          {loading ? (
            <div className="flex justify-center items-center gap-2">
              <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              <span>Logging In...</span>
            </div>
          ) : (
            "Login"
          )}
        </button>

        {/* Redirect Link */}
        <p className="text-white text-[16px] text-center">
          Don’t have an account?{" "}
          <span
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
};
