import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Leaf, CheckCircle, XCircle, Loader } from "lucide-react";
import { authAPI } from "@/api/auth.api";

const C = { forest:"#1B3A2D", sage:"#7BAF8A", gold:"#C8923A", cream:"#F7F2E8", mist:"#FDFAF5" };

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    authAPI.verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="min-h-dvh flex items-center justify-center px-4" style={{ background:C.mist }}>
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-cent justify-center shadow-sm group-hover:bg-brand-600 transition-colors">
            <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" alt="NayePankh" className="text-white" />
          </div>
          <span style={{fontFamily:"'Fraunces',serif",fontWeight:700,color:C.forest}}>NayePankh Foundation</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 px-8 py-10 space-y-4">
          {status === "loading" && (
            <>
              <Loader size={36} className="mx-auto animate-spin text-gray-300"/>
              <p className="text-sm text-gray-500">Verifying your email…</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{background:`${C.sage}18`}}>
                <CheckCircle size={30} style={{color:C.sage}}/>
              </div>
              <h1 className="text-xl font-bold text-gray-900" style={{fontFamily:"'Fraunces',serif"}}>Email verified!</h1>
              <p className="text-sm text-gray-500">Your account is now active and awaiting admin approval. We'll email you once you're approved.</p>
              <Link to="/login"
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                style={{background:C.forest,color:C.cream}}>
                Go to login
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-red-50">
                <XCircle size={30} className="text-red-400"/>
              </div>
              <h1 className="text-xl font-bold text-gray-900" style={{fontFamily:"'Fraunces',serif"}}>Link invalid or expired</h1>
              <p className="text-sm text-gray-500">This verification link has expired or is invalid. Please register again or contact support.</p>
              <Link to="/register"
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                style={{background:C.forest,color:C.cream}}>
                Back to register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
