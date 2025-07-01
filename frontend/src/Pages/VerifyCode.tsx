import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/Components/ui/input-otp";
import verify from '../assets/verify.jpg';
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyCode() {
  const { isVerifing, isSendCode, setIsSendCode, sendCode, verifyCode, errors } = useAuthStore();
  const [code, setCode] = useState<string | undefined>(undefined);
  const [time, setTime] = useState<number>(180);
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const navigate = useNavigate();

  const handleResendCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const success = await sendCode();
    if (!success) navigate('/login', { replace: true });
    setTime(180);
    setIsSendCode(true);
  };

  useEffect(() => {
    if (time > 0 && isSendCode && !errors?.token) {
      const timer = setTimeout(() => {
        setTime(time - 1);
      }, 1000)
      return () => clearTimeout(timer);
    } else {
      setTime(0)
    }
  }, [time, isSendCode, errors?.token]);

  const handleChangeCode = (value: string) => setCode(value);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await verifyCode(code);
    if (success) navigate('/', { replace: true });
  }

  return (
    <div className="container min-h-screen flex items-center justify-center">
      <div className="shadow-xl flex rounded-md w-[90%]">
        {/* Left */}
        <div className="p-4 bg-primary rounded-md lg:basis-[40%] relative hidden lg:inline-block">
          <img src={verify} alt="Logo" />
        </div>
        {/* Right */}
        <form onSubmit={handleSubmit} className="flex flex-col shadow-md justify-center flex-1 lg:basis-[60%] gap-2 p-5 rounded-md">
          <h1 className="text-center text-[40px] md:text-[60px] font-bold text-primary">Verify Account</h1>
          <p className="text-center">Please enter the 4-digit code sent to your for verifation. </p>
          <div className="flex flex-col gap-2">

            <div className="flex items-center justify-center my-4">
              <InputOTP maxLength={6} autoFocus value={code} onChange={handleChangeCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot index={1} />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button className="bg-primary py-2 rounded-md mt-4 text-white flex mx-auto w-[80%] items-center justify-center gap-2" type="submit" disabled={isVerifing}>
              {isVerifing ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Verify Account"
              )}
            </button>
            <div className={`flex flex-col gap-2 md:flex-row items-center mt-8 ${isSendCode ? 'justify-between' : 'justify-center'}`}>
              <div>
                <span>You didn't get code? </span>
                <button
                  onClick={handleResendCode}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Click to Resend code
                </button>
              </div>
              {time > 0 && (
                <p className="text-gray-600">
                  You can resend within:
                  <span className="font-bold text-red-500 ml-2">
                    {minutes}:{seconds.toString().padStart(2, '0')}
                  </span>
                </p>
              )}
            </div>
          </div>
        </form>
      </div >
    </div >
  )
}
