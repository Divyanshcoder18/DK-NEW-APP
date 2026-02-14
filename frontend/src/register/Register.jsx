import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inputData, setInputData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confpassword: "",
    gender: "",
  });

  const handleInput = (e) => {
    setInputData({
      ...inputData,
      [e.target.id]: e.target.value,
    });
  };

  const selectGender = (gender) => {
    setInputData((prev) => ({
      ...prev,
      gender: prev.gender === gender ? "" : gender,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (inputData.password !== inputData.confpassword) {
      setLoading(false);
      return toast.error("Passwords do not match");
    }

    try {
      const register = await axios.post(`/api/auth/register`, inputData);
      const data = register.data;

      if (!data.success) {
        setLoading(false);
        return toast.error(data.message);
      }

      toast.success("Registration successful! Welcome!");
      setAuthUser(data);  // Set the authenticated user
      navigate("/");  // Navigate to home since user is auto-logged in
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-primary p-4 overflow-y-auto">
      <div className="w-full max-w-sm my-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tighter text-text-primary mb-2">Create Account.</h1>
          <p className="text-text-secondary text-lg">Join the minimalist revolution.</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">Full Name</label>
            <input
              id="fullname"
              onChange={handleInput}
              required
              className="w-full bg-transparent border-b border-border py-2 text-text-primary text-lg focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-secondary/50"
              placeholder="John Doe"
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">Username</label>
            <input
              id="username"
              onChange={handleInput}
              required
              className="w-full bg-transparent border-b border-border py-2 text-text-primary text-lg focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-secondary/50"
              placeholder="johndoe"
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">Email</label>
            <input
              id="email"
              type="email"
              onChange={handleInput}
              required
              className="w-full bg-transparent border-b border-border py-2 text-text-primary text-lg focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-secondary/50"
              placeholder="name@example.com"
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">Password</label>
            <input
              id="password"
              type="password"
              onChange={handleInput}
              required
              className="w-full bg-transparent border-b border-border py-2 text-text-primary text-lg focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-secondary/50"
              placeholder="••••••••"
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">Confirm Password</label>
            <input
              id="confpassword"
              type="password"
              onChange={handleInput}
              required
              className="w-full bg-transparent border-b border-border py-2 text-text-primary text-lg focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-secondary/50"
              placeholder="••••••••"
            />
          </div>

          {/* GENDER */}
          <div className="py-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">Gender</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => selectGender("male")}
                className={`flex-1 py-3 border text-sm font-bold uppercase tracking-wider transition-all
                  ${inputData.gender === "male"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                    : "border-border text-text-secondary hover:border-text-primary hover:text-text-primary"}
                `}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => selectGender("female")}
                className={`flex-1 py-3 border text-sm font-bold uppercase tracking-wider transition-all
                  ${inputData.gender === "female"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                    : "border-border text-text-secondary hover:border-text-primary hover:text-text-primary"}
                `}
              >
                Female
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-4 bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {loading ? "CREATING..." : "REGISTER"}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-8 text-center pb-8">
          <p className="text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-text-primary font-bold hover:underline underline-offset-4"
            >
              Login here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;