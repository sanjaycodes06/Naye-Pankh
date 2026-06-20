import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { authAPI } from "@/api/auth.api";
import toast from "react-hot-toast";

const C = { forest:"#1B3A2D", sage:"#7BAF8A", gold:"#C8923A", cream:"#F7F2E8", mist:"#FDFAF5" };
const inputCls = "w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-white text-gray-900 outline-none transition-all focus:ring-2 focus:ring-green-700 focus:border-transparent";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm]   = useState({ email:"", otp:"", newPassword:"", confirm:"" });
  const [show, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k,v) => { setError(""); setForm(p=>({...p,[k]:v})); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.newPassword.length < 8)       { setError("Password must be at least 8 characters."); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword))
      { setError("Password needs uppercase, lowercase, and a number."); return; }

    setLoading(true);
    try {
      await authAPI.resetPassword({ email:form.email, otp:form.otp, newPassword:form.newPassword });
      toast.success("Password reset! Please log in.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Check your OTP and try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-12" style={{ background:C.mist }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-cent justify-center shadow-sm group-hover:bg-brand-600 transition-colors">
            <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" alt="NayePankh" className="text-white" />
          </div>
          <span style={{fontFamily:"'Fraunces',serif",fontWeight:700,color:C.forest,fontSize:"1rem"}}>NayePankh Foundation</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 px-7 py-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1" style={{fontFamily:"'Fraunces',serif"}}>Set new password</h1>
          <p className="text-sm text-gray-500 mb-6">Enter the OTP from your email and your new password.</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
              style={{background:"#FEF2F2",border:"1px solid #FECACA",color:"#B91C1C"}}>
              <AlertCircle size={13} className="shrink-0 mt-0.5"/>{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input type="email" value={form.email} onChange={e=>set("email",e.target.value)}
                placeholder="you@example.com" className={inputCls} required/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">6-digit OTP</label>
              <input type="text" inputMode="numeric" maxLength={6} value={form.otp}
                onChange={e=>set("otp",e.target.value.replace(/\D/,""))}
                placeholder="123456" className={inputCls + " tracking-[0.3em] text-center font-mono text-lg"} required/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
              <div className="relative">
                <input type={show?"text":"password"} value={form.newPassword}
                  onChange={e=>set("newPassword",e.target.value)}
                  placeholder="••••••••" className={inputCls + " pr-11"} required/>
                <button type="button" tabIndex={-1} onClick={()=>setShow(s=>!s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <input type="password" value={form.confirm} onChange={e=>set("confirm",e.target.value)}
                placeholder="••••••••" className={inputCls} required/>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
              style={{background:C.forest,color:C.cream}}>
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                : <><CheckCircle size={14}/> Reset password</>
              }
            </button>
          </form>
          <Link to="/login" className="block text-center text-xs text-gray-400 hover:underline mt-5">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
