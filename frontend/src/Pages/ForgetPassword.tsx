import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore"
import { Loader2 } from "lucide-react";
import forgetPasswordImage from '../assets/Forgot password-bro.png';

export default function ForgetPassword() {
  const { isForgetingPassword, forgetPassword, errors } = useAuthStore();
  const [email, setEmail] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    forgetPassword(email);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEmail(value);
  }

  return (
    <div className="container min-h-screen flex items-center justify-center">
      <div className="shadow-xl flex rounded-md w-[90%]">
        {/* Left */}
        <div className="p-4 bg-primary rounded-md lg:basis-[40%] relative hidden lg:inline-block">
          <img src={forgetPasswordImage} alt="Abstraction Image" />
        </div>
        {/* Right */}
        <form onSubmit={handleSubmit} className="flex flex-col shadow-md justify-center flex-1 lg:basis-[60%] gap-2 p-5 rounded-md">
          <h1 className="text-center text-[40px] md:text-[60px] font-bold text-primary">Forget Password</h1>
          <div className="flex flex-col gap-2">

            <div className="flex flex-col gap-1">
              <label className="text-offWhite" htmlFor="email">Email</label>
              <input
                className="w-full focus:outline-none p-2 rounded-md border border-collapse"
                id="email"
                type="email" placeholder="JohnDoe@gmail.com" name="email" value={email}
                onChange={handleChange}
              />
              {errors?.email && <span className="text-red-500">{errors.email[0]}</span>}
            </div>

            <button className="bg-primary py-2 rounded-md mt-4 text-white flex items-center justify-center gap-2" type="submit" disabled={isForgetingPassword}>
              {isForgetingPassword ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Countinue"
              )}
            </button>
            <span className="text-center mt-4">
                Enter your Registration Email Below to receive password reset instruction 
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
