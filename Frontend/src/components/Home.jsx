import React, { useContext, useEffect, useState, useRef } from "react";
import { userDataContext } from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import userImg from '../assets/user.gif'
import aiImg from '../assets/ai.gif'
import axios from "axios";

export const Home = () => {
  const { userData, setUserData, serverUrl, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [conversation, setConversation] = useState([]);
  const isSpeakingRef = useRef(false);
  const isRecognizingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;
  const voicesRef = useRef([]);

  // Load voices when available
  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = synth.getVoices();
      if (voicesRef.current.length === 0) {
        synth.onvoiceschanged = () => {
          voicesRef.current = synth.getVoices();
        };
      }
    };
    loadVoices();
    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      alert("Logout nahi hua, try again karo!");
    }
  };

  const startRecognition = () => {
    if (isSpeakingRef.current || isRecognizingRef.current || isProcessingRef.current) {
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setListening(true);
      }
    } catch (error) {
      if (!error.message.includes("start")) {
        console.error("Recognition start error:", error);
      }
    }
  };

  const stopRecognition = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (error) {
      console.log("Recognition stop error:", error);
    }
    setListening(false);
    isRecognizingRef.current = false;
  };

  const speak = (text) => {
    if (!text || !window.speechSynthesis) return;

    // Add to conversation
    setConversation(prev => [...prev, { type: 'assistant', text, time: new Date().toLocaleTimeString() }]);

    // Set spoken text for display
    setSpokenText(text);

    if (synth.speaking) {
      synth.cancel();
    }

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = "hi-IN";
      utterance.rate = 0.9;

      const hindiVoice = voicesRef.current.find((voice) =>
        voice.lang === "hi-IN" || voice.lang.startsWith("hi")
      );

      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      utterance.onstart = () => {
        isSpeakingRef.current = true;
      };

      utterance.onerror = (event) => {
        console.error("TTS Speaking Error:", event.error);
        isSpeakingRef.current = false;
        isProcessingRef.current = false;
        startRecognition();
      };

      utterance.onend = () => {
        isSpeakingRef.current = false;
        isProcessingRef.current = false;

        // Restart listening after speaking
        setTimeout(() => {
          if (!isRecognizingRef.current && !isProcessingRef.current) {
            startRecognition();
          }
        }, 500);
      };

      try {
        synth.speak(utterance);
      } catch (e) {
        console.error("TTS Initialization Failed:", e);
        isSpeakingRef.current = false;
        isProcessingRef.current = false;
        startRecognition();
      }
    }, 100);
  };

  const handleCommand = (data) => {
    const { type, userInput, response } = data;

    // Add user message to conversation
    setConversation(prev => [...prev, {
      type: 'user',
      text: userInput,
      time: new Date().toLocaleTimeString()
    }]);

    isProcessingRef.current = true;
    speak(response);

    // Perform actions after a short delay
    setTimeout(() => {
      if (type === "google-search") {
        const query = encodeURIComponent(userInput);
        window.open(`https://www.google.com/search?q=${query}`, "_blank");
      }
      else if (type === "calculator-open") {
        window.open(`https://www.google.com/search?q=calculator`, "_blank");
      }
      else if (type === "open-application") {
        if (userInput.toLowerCase().includes("instagram")) {
          window.open("https://www.instagram.com/", "_blank");
        }
        else if (userInput.toLowerCase().includes("facebook")) {
          window.open("https://www.facebook.com/", "_blank");
        }
        else if (userInput.toLowerCase().includes("youtube")) {
          window.open("https://www.youtube.com/", "_blank");
        }
      }
      else if (type === "weather-show") {
        window.open(`https://www.google.com/search?q=weather`, "_blank");
      }
      else if (type === "youtube-search") {
        const query = encodeURIComponent(userInput);
        window.open(`https://www.youtube.com/results?search_query=${query}`, "_blank");
      }
      else if (type === "youtube_play") {
        const query = encodeURIComponent(userInput + " song");
        window.open(`https://www.youtube.com/results?search_query=${query}&autoplay=1`, "_blank");
      }
    }, 200);
  };

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("SpeechRecognition is browser mein support nahi karta.");
      speak("Yeh browser voice commands support nahi karta. Chrome ya Edge try karo.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);

      // Auto-restart if not speaking or processing
      if (!isSpeakingRef.current && !isProcessingRef.current) {
        setTimeout(startRecognition, 800);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);

      // Only restart for non-critical errors, don't speak for "no-speech"
      if (event.error !== "aborted" && event.error !== "no-speech" && !isSpeakingRef.current && !isProcessingRef.current) {
        setTimeout(startRecognition, 1000);

        // Only speak for critical errors
        if (event.error === "audio-capture") {
          speak("Mic ka issue hai, check karo!");
        } else if (event.error === "not-allowed") {
          speak("Mic permission nahi hai, please mic allow karo!");
        }
      } else if (event.error === "no-speech") {
        // Silent restart for no-speech error
        if (!isSpeakingRef.current && !isProcessingRef.current) {
          setTimeout(startRecognition, 1000);
        }
      }
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      const confidence = event.results[event.results.length - 1][0].confidence;

      // console.log(`Suna gaya: "${transcript}"`);

      const normalizedTranscript = transcript.toLowerCase();
      const assistantName = userData?.assistantName?.toLowerCase() || "jarvis";

      // Check if wake word is detected
      if (normalizedTranscript.includes(assistantName)) {
        // console.log(`Wake word detected: ${assistantName}`);

        stopRecognition();
        isProcessingRef.current = true;

        try {
          const data = await getGeminiResponse(transcript);
          // console.log("Assistant Response:", data);

          if (data?.response && data?.type) {
            handleCommand(data);
          } else {
            speak("Kuch galat ho gaya, fir se try karo!");
            isProcessingRef.current = false;
            setTimeout(startRecognition, 1000);
          }
        } catch (error) {
          console.error("getGeminiResponse error:", error);
          speak("Server se connection nahi ho paya!");
          isProcessingRef.current = false;
          setTimeout(startRecognition, 1000);
        }
      } else {
        // If wake word not found, silently restart listening
        setTimeout(startRecognition, 500);
      }
    };

    // Start initial recognition
    setTimeout(() => {
      if (!isSpeakingRef.current && !isProcessingRef.current) {
        startRecognition();
      }
    }, 1000);

    return () => {
      stopRecognition();
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, [userData, getGeminiResponse]);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-[#01011a] via-[#02024d] to-black flex flex-col justify-center items-center px-4 sm:px-6 overflow-hidden">
      {/* Background Animations - Responsive */}
      <div className="absolute top-4 left-4 sm:top-10 sm:left-10 w-[120px] h-[120px] sm:w-[200px] sm:h-[200px] bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-4 right-4 sm:bottom-10 sm:right-10 w-[150px] h-[150px] sm:w-[250px] sm:h-[250px] bg-purple-600/20 rounded-full blur-3xl animate-ping"></div>

      {/* Header Buttons - Responsive */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col gap-2 sm:gap-3 z-10">
        <button
          onClick={handleLogout}
          className="px-4 py-2 sm:px-6 sm:py-2 bg-red-600 text-white font-semibold rounded-full shadow-lg shadow-red-600/40 hover:bg-red-700 hover:scale-105 transition-all duration-200 text-sm sm:text-base"
        >
          Logout
        </button>
        <button
          onClick={() => navigate("/customize")}
          className="px-4 py-2 sm:px-6 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full shadow-lg shadow-blue-500/50 hover:shadow-indigo-600/60 hover:scale-105 transition-all duration-200 text-sm sm:text-base"
        >
          Customize
        </button>
      </div>

      {/* Assistant Avatar - Responsive */}
      <div className="relative mb-6 sm:mb-8">
        <div
          className="w-[100px] h-[160px] sm:w-[130px] sm:h-[210px] md:w-[150px] md:h-[250px] lg:w-[200px] lg:h-[330px] flex justify-center items-center bg-[#05052b]/50 border-2 border-[#5a5aff66] rounded-2xl shadow-lg shadow-blue-800/50 hover:scale-110 hover:shadow-2xl hover:border-white transition-all duration-300 cursor-pointer backdrop-blur-md animate-[float_4s_ease-in-out_infinite]"
        >
          <img
            src={userData?.assistantImage}
            alt="Assistant"
            className="h-full w-full rounded-2xl object-cover"
          />
        </div>
      </div>

      {/* Main Content - Responsive */}
      <div className="text-center w-full max-w-2xl lg:max-w-4xl px-2 sm:px-4">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight sm:leading-snug drop-shadow-lg animate-fadeIn mb-4 sm:mb-6">
          I'm{" "}
          <span className="text-blue-500 font-extrabold tracking-wide">
            {userData?.assistantName || "Guest"}
          </span>{" "}
          !
        </h1>

        {/* Assistant Status Image - Responsive */}
        <div className="flex justify-center items-center mb-4 sm:mb-6">
          <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] rounded-full overflow-hidden border-2 border-blue-500/50 shadow-lg">
            {isSpeakingRef.current ? (
              <img
                src={aiImg}
                alt="AI Speaking"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={userImg}
                alt="Ready to Listen"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Spoken Text Display - Responsive */}
        {spokenText && (
          <div className="animate-fadeIn mb-4 sm:mb-6">
            <p className="text-base sm:text-xl md:text-2xl lg:text-3xl text-white font-semibold leading-relaxed text-center tracking-wide px-2 sm:px-4">
              {spokenText}
            </p>
          </div>
        )}

        {/* Conversation History - Responsive */}
        {/* {conversation.length > 0 && (
          <div className="mt-4 sm:mt-6 max-h-40 sm:max-h-48 md:max-h-56 lg:max-h-60 overflow-y-auto bg-black/30 rounded-2xl p-3 sm:p-4 border border-white/10 mx-2 sm:mx-0">
            <h3 className="text-white text-sm sm:text-lg font-semibold mb-2 sm:mb-3">Conversation</h3>
            <div className="space-y-1 sm:space-y-2">
              {conversation.slice(-4).map((msg, index) => (
                <div 
                  key={index} 
                  className={`p-2 sm:p-3 rounded-lg ${
                    msg.type === 'user' 
                      ? 'bg-blue-500/20 text-blue-200' 
                      : 'bg-green-500/20 text-green-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-xs sm:text-sm">
                      {msg.type === 'user' ? '👤 You' : '🤖 Assistant'}
                    </span>
                    <span className="text-xs opacity-70">{msg.time}</span>
                  </div>
                  <p className="text-left mt-1 text-xs sm:text-sm">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>

      {/* Status Bar - Responsive */}
      <div className="fixed bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/40 backdrop-blur-sm border border-blue-500/30 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-[10px] animate-fadeIn">
        Status: {listening ? '🎙️ Listening' : isSpeakingRef.current ? '🔊 Speaking' : '✅ Ready'}
      </div>
    </div>
  );
};