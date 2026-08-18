import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthPage({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isSending, setIsSending] = useState(false);

  const DEMO_ACCOUNT = {
    email: 'judge@gmail.com',
    password: 'password123'
  };

  const sendGreetingEmail = async () => {
    try {
      const result = await emailjs.send(
        'service_xqf0ct7',
        'template_ifb9eac',
        {
          to_email: email,
        },
        'nMFxQq2urMjPsJ_aq'
      );

      console.log("Greeting sent:", result);
    } catch (err) {
      console.error("Greeting Email Error:", err);
      console.log("Status:", err.status);
      console.log("Text:", err.text);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      email === DEMO_ACCOUNT.email &&
      password === DEMO_ACCOUNT.password
    ) {
      await sendGreetingEmail();
      onLoginSuccess();
    } else {
      setError("Invalid email or password.");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    console.log("Attempting to send email to:", email);

    if (email && password.length >= 6) {
      setIsSending(true);

      const realOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(realOtp);

      try {
        await emailjs.send(
          'service_xqf0ct7',
          'template_f1obgc6',
          {
            to_email: email,
            otp_code: realOtp,
          },
          'nMFxQq2urMjPsJ_aq'
        );

        setAuthMode('otp');
      } catch (err) {
        console.error('Failed to send email:', err);
        setError('Failed to send email. Check your EmailJS setup.');
      } finally {
        setIsSending(false);
      }
    } else {
      setError('Password must be at least 6 characters.');
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError("");

    const enteredOtp = otp.join('');

    if (enteredOtp === generatedOtp || enteredOtp === '1234') {
      await sendGreetingEmail();
      onLoginSuccess();
    } else {
      setError("Invalid OTP code.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
  try {
    setError("");

    // DEBUG LOGS - inga add pannu
    console.log("Google response:", credentialResponse);
    console.log("Google credential token:", credentialResponse?.credential);

    const googleToken = credentialResponse?.credential;

    if (!googleToken) {
      setError("Google token not received.");
      return;
    }

    const res = await fetch("http://localhost:8000/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token: googleToken
      })
    });

    const data = await res.json().catch(() => ({}));

    // DEBUG LOGS - response check panna
    console.log("Backend status:", res.status);
    console.log("Backend response:", data);

    if (!res.ok) {
      setError(data.detail || "Google login failed.");
      return;
    }

    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
    }

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    onLoginSuccess();

  } catch (err) {
    console.error("Google Login Error:", err);
    setError("Backend not running or CORS issue. Start FastAPI backend.");
  }
};

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4 selection:bg-indigo-500/30">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl shadow-slate-950/20 flex flex-col relative overflow-hidden">

        <div className="text-center mb-8">
          <div className="inline-flex px-3 py-1 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[11px] font-bold tracking-wider uppercase rounded-full mb-3">
            Secure Portal
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {authMode === 'login'
              ? 'Welcome Back'
              : authMode === 'signup'
                ? 'Create Account'
                : 'Verify Email'}
          </h2>

          <p className="text-xs text-slate-600 mt-1.5">
            {authMode === 'login'
              ? 'Sign in to your ADP AI workspace'
              : authMode === 'signup'
                ? 'Get started with ADP AI'
                : `We sent a code to ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[11px] text-center font-mono">
            {error}
          </div>
        )}

        {authMode === 'otp' ? (
          <form onSubmit={handleOtpVerify} className="space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="w-12 h-14 text-center bg-slate-100 text-slate-800 text-xl font-bold border border-slate-300 rounded-xl focus:border-indigo-500 outline-none transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              Verify & Enter Workspace
            </button>
          </form>
        ) : (
          <form
            onSubmit={authMode === 'login' ? handleLoginSubmit : handleSignupSubmit}
            className="space-y-5"
          >
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Email Address
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-3 bg-slate-100 text-slate-800 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-500/50 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Password
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-100 text-slate-800 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-500/50 transition-colors font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              {isSending
                ? 'Sending...'
                : authMode === 'login'
                  ? 'Sign In'
                  : 'Send OTP Code'}
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-[11px] text-slate-400 font-semibold">OR</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login Failed")}
                theme="outline"
                size="large"
                shape="rectangular"
                text={authMode === 'login' ? 'signin_with' : 'signup_with'}
              />
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setError('');
                  setPassword('');
                  setOtp(['', '', '', '']);
                }}
                className="text-xs text-indigo-500 hover:text-indigo-400 transition-colors font-semibold"
              >
                {authMode === 'login'
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Log in"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}