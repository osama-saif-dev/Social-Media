import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore"
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import SignIn from '../assets/login.png';
import { Eye } from 'lucide-react';
import { EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoginig, sendCode, errors } = useAuthStore();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await login(formData);
    if (result?.success) {
      navigate('/', { replace: true });
    } else if (!result?.success && result?.notVerified) {
      navigate('/verify-code', { replace: true });
      await sendCode();
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  return (
    <div className="container min-h-screen flex items-center justify-center">
      <div className="shadow-xl flex rounded-md w-[90%]">
        {/* Left */}
        <div className="p-4 bg-primary rounded-md lg:basis-[40%] relative hidden lg:inline-block">
          <img src={SignIn} alt="Abstraction Image" />
        </div>
        {/* Right */}
        <form onSubmit={handleSubmit} className="flex flex-col shadow-md justify-center flex-1 lg:basis-[60%] gap-2 p-5 rounded-md">
          <h1 className="text-center text-[40px] md:text-[60px] font-bold text-primary">Access Account</h1>
          <div className="flex flex-col gap-2">

            <div className="flex flex-col gap-1">
              <label className="text-offWhite" htmlFor="email">Email</label>
              <input
                className="w-full focus:outline-none p-2 rounded-md border border-collapse"
                id="email"
                type="email" placeholder="JohnDoe@gmail.com" name="email" value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errors?.email && <span className="text-red-500">{errors.email[0]}</span>}

            <div className="flex flex-col gap-1 relative">
              <label className="text-offWhite" htmlFor="password">Password</label>
              <input
                className="w-full focus:outline-none p-2 rounded-md border border-collapse"
                id="password"
                type={!showPassword ? 'password' : 'text'} placeholder="********" name="password" value={formData.password}
                onChange={handleChange}
              />
              <div onClick={() => setShowPassword(prev => !prev)} className="absolute right-0 top-1/2 transform -translate-y-1/2 mt-4 mr-2">
                {showPassword ? (
                  <EyeOff className=" text-gray-500 cursor-pointer hover:text-gray-600 transition-all duration-300" />
                ) : (
                  <Eye className=" text-gray-500 cursor-pointer hover:text-gray-600 transition-all duration-300" />
                )}
              </div>
            </div>
            {errors?.password && <span className="text-red-500">{errors.password[0]}</span>}

            <button className="bg-primary py-2 rounded-md mt-4 text-white flex items-center justify-center gap-2" type="submit" disabled={isLoginig}>
              {isLoginig ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Access Account"
              )}
            </button>
            <div className="flex items-center justify-between mt-4">
              <span>Create account? {" "}
                <Link className="text-primary" to={'/signup'}>Sign Up</Link>
              </span>
              <Link className="text-primary" to={'/forget-password'}>Forget Password?</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
