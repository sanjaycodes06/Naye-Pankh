import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Leaf, ArrowRight, AlertCircle } from "lucide-react";
import { authAPI } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

/* shared palette */
const C = {
  forest: "#1B3A2D", gold: "#C8923A", sage: "#7BAF8A",
  cream: "#F7F2E8", mist: "#FDFAF5", ink: "#1A2518",
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const [form, setForm]     = useState({ email: "", password: "" });
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleChange = (e) => {
    setError("");
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in both fields."); return; }

    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      const { user, accessToken } = data.data;
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.fullName.split(" ")[0]}!`);

      const from = location.state?.from?.pathname;
      if (from && from !== "/login") { navigate(from, { replace: true }); return; }
      navigate(["admin","superadmin"].includes(user.role) ? "/admin/dashboard" : "/volunteer/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh grid lg:grid-cols-2" style={{ background: C.mist }}>

      {/* ── Left panel: brand ── */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: C.forest }}>

        {/* dot grid */}
        <div aria-hidden style={{
          position:"absolute",inset:0,
          backgroundImage:`radial-gradient(${C.sage}30 1px,transparent 1px)`,
          backgroundSize:"28px 28px",
        }}/>

        {/* large glyph */}
        <div aria-hidden style={{
          position:"absolute",bottom:"-60px",right:"-40px",
          fontSize:"340px",fontFamily:"'Fraunces',Georgia,serif",fontWeight:900,
          lineHeight:1,color:`${C.sage}15`,userSelect:"none",pointerEvents:"none",
        }}>पंख</div>

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-cent justify-center shadow-sm group-hover:bg-brand-600 transition-colors">
              <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" alt="NayePankh" className="text-white" />
            </div>
            <div>
              <div style={{fontFamily:"'Fraunces',serif",fontWeight:700,color:C.cream,fontSize:"1rem"}}>NayePankh</div>
              <div style={{fontSize:"9px",letterSpacing:"0.15em",textTransform:"uppercase",color:`${C.sage}90`}}>Foundation</div>
            </div>
          </div>
        </div>

        <div className="relative space-y-6">
          <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:700,fontSize:"2.5rem",lineHeight:1.1,color:C.cream}}>
            Every hour you give<br/>
            <em style={{color:C.gold,fontStyle:"italic"}}>lifts someone higher.</em>
          </h2>
          <p style={{color:`${C.sage}cc`,fontSize:"0.95rem",lineHeight:1.7,maxWidth:"380px"}}>
            Log in to your volunteer portal to view tasks, track your hours, and download your certificates.
          </p>
        </div>

        <div className="relative">
          <div className="flex items-center gap-8">
            {[["4,200+","Volunteers"],["97k+","Hours"],["18","States"]].map(([n,l])=>(
              <div key={l}>
                <div style={{fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:"1.4rem",color:C.gold}}>{n}</div>
                <div style={{fontSize:"10px",textTransform:"uppercase",letterSpacing:"0.12em",color:`${C.sage}80`}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-brand-600 transition-colors">
            <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" alt="NayePankh" className="text-white" />
          </div>
          <span style={{fontFamily:"'Fraunces',serif",fontWeight:700,color:C.forest,fontSize:"1rem"}}>NayePankh Foundation</span>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <div className="mb-8">
            <h1 style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:700,fontSize:"2rem",color:C.forest,lineHeight:1.1}}>
              Sign in
            </h1>
            <p className="mt-2 text-sm" style={{color:"#6B7280"}}>
              New here?{" "}
              <Link to="/register" style={{color:C.forest,fontWeight:600}} className="hover:underline">
                Create a volunteer account
              </Link>
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
              style={{background:"#FEF2F2",border:"1px solid #FECACA",color:"#B91C1C"}}>
              <AlertCircle size={15} className="mt-0.5 shrink-0"/>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{color:"#374151"}}>Email address</label>
              <input
                name="email" type="email" autoComplete="email" required
                value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{border:`1.5px solid #E5E7EB`,background:"white",color:C.ink,fontFamily:"'DM Sans',sans-serif"}}
                onFocus={e=>e.target.style.borderColor=C.sage}
                onBlur={e=>e.target.style.borderColor="#E5E7EB"}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{color:"#374151"}}>Password</label>
                <Link to="/forgot-password" className="text-xs hover:underline" style={{color:C.forest}}>Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  name="password" type={show ? "text" : "password"} autoComplete="current-password" required
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                  style={{border:`1.5px solid #E5E7EB`,background:"white",color:C.ink,fontFamily:"'DM Sans',sans-serif"}}
                  onFocus={e=>e.target.style.borderColor=C.sage}
                  onBlur={e=>e.target.style.borderColor="#E5E7EB"}
                />
                <button type="button" tabIndex={-1} onClick={()=>setShow(s=>!s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                  style={{color:"#9CA3AF"}}>
                  {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
              style={{background:C.forest,color:C.cream,fontFamily:"'DM Sans',sans-serif"}}>
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"/>
              ) : (
                <>{" Sign in "}<ArrowRight size={15}/></>
              )}
            </button>
          </form>

          <p className="mt-8 text-xs text-center" style={{color:"#9CA3AF"}}>
            By signing in you agree to our{" "}
            <Link to="/" className="hover:underline" style={{color:"#6B7280"}}>Terms</Link>
            {" "}and{" "}
            <Link to="/" className="hover:underline" style={{color:"#6B7280"}}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
