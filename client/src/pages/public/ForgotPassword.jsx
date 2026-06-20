import { useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Mail, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { authAPI } from "@/api/auth.api";

const C = { forest:"#1B3A2D", sage:"#7BAF8A", gold:"#C8923A", cream:"#F7F2E8", mist:"#FDFAF5" };
const inputCls = "w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-white text-gray-900 outline-none transition-all focus:ring-2 focus:ring-green-700 focus:border-transparent";

export default function ForgotPassword() {
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Please enter your email."); return; }
    setLoading(true); setError("");
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-12" style={{ background:C.mist }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          
          <span style={{fontFamily:"'Fraunces',serif",fontWeight:700,color:C.forest,fontSize:"1rem"}}>NayePankh Foundation</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 px-7 py-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center" style={{background:`${C.sage}18`}}>
                <CheckCircle size={26} style={{color:C.sage}}/>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900" style={{fontFamily:"'Fraunces',serif"}}>Check your inbox</h1>
                <p className="text-sm text-gray-500 mt-2">
                  If <strong>{email}</strong> is registered, you'll receive a 6-digit OTP shortly.
                </p>
              </div>
              <Link to="/reset-password"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all"
                style={{background:C.forest,color:C.cream}}>
                Enter OTP <ArrowRight size={14}/>
              </Link>
              <Link to="/login" className="block text-xs text-gray-400 hover:underline">Back to login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1" style={{fontFamily:"'Fraunces',serif"}}>Reset password</h1>
              <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send a one-time code.</p>

              {error && (
                <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
                  style={{background:"#FEF2F2",border:"1px solid #FECACA",color:"#B91C1C"}}>
                  <AlertCircle size={13} className="shrink-0"/>{error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type="email" value={email} onChange={e=>{setError("");setEmail(e.target.value);}}
                      placeholder="you@example.com" className={inputCls + " pl-10"}/>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
                  style={{background:C.forest,color:C.cream}}>
                  {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : "Send OTP"}
                </button>
              </form>

              <Link to="/login" className="flex items-center justify-center gap-1.5 mt-5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft size={12}/> Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
