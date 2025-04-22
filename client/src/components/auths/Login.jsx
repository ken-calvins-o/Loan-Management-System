import React, { useState } from 'react';

import { ArrowBackIosNew } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Ensure toast messages are styled correctly

const Login = ({ setAuth }) => {
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
  });

  const onChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const showToast = (type, message) => {
    if (type === 'success') {
      toast.success(message, { autoClose: 2000 });
    } else if (type === 'error') {
      toast.error(message, { autoClose: 3000 });
    } else {
      toast.info(message, { autoClose: 2000 });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const { username, password } = inputs;
      const body = { username, password };

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        // Handle HTTP errors like 401 or 500 explicitly
        const errorResponse = await response.text();
        showToast('error', errorResponse || 'Something went wrong!');
        return;
      }

      const parseRes = await response.json();

      // Check for token in the response
      if (parseRes.token) {
        localStorage.setItem('token', parseRes.token); // Save token to local storage
        showToast('success', 'Logged in successfully!');
        setTimeout(() => {
          setAuth(true); // Update auth status to logged in
        }, 2000); // Redirect after a delay
      } else {
        showToast('error', 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error(error.message);
      showToast('error', 'An error occurred. Please try again.');
    }
  };

  const { username, password } = inputs;

  return (
      <div className="flex flex-col h-auto w-[620px] border rounded-md shadow-md mx-auto my-52 justify-center flex-wrap border-t-4 border-t-red-500">
        <ToastContainer />
        <div>
          <div className="flex justify-between items-center px-8 pt-6 pb-2">
            {/* GREETINGS */}
            <div>
              <h1 className="text-xl font-semibold">Welcome back</h1>
              <small className="text-gray-400">
                Welcome back! Please enter your details
              </small>
            </div>

            {/* BACK ARROW */}
            <div className="ml-8">
              <Link to="/">
                <ArrowBackIosNew />
              </Link>
            </div>
          </div>

          <form onSubmit={onSubmit} className="bg-white px-8 pt-6 pb-8">
            <div className="mb-4">
              <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="username"
              >
                Username
              </label>
              <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="username"
                  type="text"
                  placeholder="Username"
                  name="username"
                  value={username}
                  onChange={onChange}
              />
            </div>
            <div className="mb-6">
              <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="password"
              >
                Password
              </label>
              <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  id="password"
                  type="password"
                  placeholder="******************"
                  name="password"
                  value={password}
                  onChange={onChange}
              />
            </div>
            <div className="flex flex-col items-center justify-between gap-5">
              <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                  type="submit"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default Login;