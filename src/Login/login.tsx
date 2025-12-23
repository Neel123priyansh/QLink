import { useState, useRef, useEffect } from 'react';
import '@coreui/coreui-pro/dist/css/coreui.min.css';
import 'react-toastify/dist/ReactToastify.css';
import Webcam from "react-webcam";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import * as faceapi from "face-api.js";
import axios from 'axios';


export const Login = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const webcamRef = useRef<Webcam>(null);
  const [initialized, setInitialized] = useState(false);
  const [result, setResult] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      setInitialized(true);
    };

    loadModels();
  }, []);

  const captureAndRecognize = async () => {
    if (!initialized || !webcamRef.current) return;

    const screenshot = webcamRef.current.getScreenshot();

    if (!screenshot) {
      setResult("Failed to capture image.");
      return;
    }

    const img = await faceapi.fetchImage(screenshot);

    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

      if (detection) {
        const liveDescriptor = Array.from(detection.descriptor); // 128-d vector
    
        try {
          const response = await fetch('https://qrsend-backend.onrender.com/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, liveDescriptor })
          });
    
          const data = await response.json();
          setResult(data.message); // Show match result
          toast.success("Identity Matched", {
            onClose: () => navigate("/Loadit")
          })
          
        } catch (error) {
          console.error("Error verifying face:", error);
          setResult("❌ Error verifying face.");
        }
      } else {
        setResult("❌ No face detected.");
      }
    }    

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post('https://qrsend-backend.onrender.com/login', { username, password }) 
      .then(result => {
        console.log(result);
        if (result.data === "Success"){
          toast.success("Login Successful", {
          })
        }
        else{
          toast.error("Creditianls Not Match")
        }
      }).catch(e => console.log(e));
  };

  return (
    <div className='flex h-screen items-center justify-center'>
      <ToastContainer />
      <div className='relative flex flex-row-reverse rounded-2xl h-8/12 w-4xl shadow-neutral-950 shadow-2xl'>
        <div className="relative w-4xl bg-black z-10 overflow-hidden rounded-r-2xl">
          <div className="absolute top-6 pr-3 left-6 z-10 flex flex-col items-start">
            <span className="text-white mb-1 font-greatvibe font-bold text-4xl">Hello, Shaily!</span>
            <span className="text-white mb-1 text-left font-quicksand max-w-[320px]">
              For enhanced security, facial recognition will be performed after you enter your username and password.
            </span>
            <Webcam 
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className='border-[#00c78b] border-2 rounded-2xl'
            />
            <button 
              onClick={captureAndRecognize}
              className='bg-[#00c78b] h-11 mt-2 font-medium text-white w-full'>
              CHECK
            </button>
            <span className="text-white mt-2">{result}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className='bg-white flex flex-col font-Manrope h-full w-7xl rounded-l-2xl text-center gap-3 px-10 justify-center'>
          <span className='text-5xl font-quicksand mb-10 font-semibold text-[#000000]'>Login Form</span>
          <input
            type='text'
            name='username'
            onChange={(e) => setUsername(e.target.value)}
            className='h-12 px-5 bg-[#eaeaea] rounded-md outline-none border border-transparent focus:border-black transition duration-300'
            placeholder='User Name'
            required
          /> 
          <input
            type='password'
            name='password'
            onChange={(e) => setPassword(e.target.value)}
            className='h-12 px-5 bg-[#eaeaea] mb-4 rounded-md outline-none border border-transparent focus:border-black transition duration-300'
            placeholder='Password'
            required  
          />

          <button
            type='submit'
            className='w-full rounded-lg mx-auto h-11 bg-[#00df9a] hover:bg-[#00c78b] text-white font-medium transition duration-300'
          >
            SIGN UP
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
