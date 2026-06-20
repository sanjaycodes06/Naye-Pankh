import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, ArrowRight, ArrowLeft, Check, Eye, EyeOff, AlertCircle } from "lucide-react";
import { authAPI } from "@/api/auth.api";
import toast from "react-hot-toast";

const C = {
  forest:"#1B3A2D",gold:"#C8923A",sage:"#7BAF8A",
  cream:"#F7F2E8",mist:"#FDFAF5",ink:"#1A2518",sageL:"#A8C9B0",
};

/* ── Steps definition ───────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Account" },
  { id: 2, label: "Personal" },
  { id: 3, label: "Skills" },
  { id: 4, label: "Emergency" },
];

const SKILLS_LIST = [
  "Teaching","Medical","Technology","Logistics","Fundraising",
  "Design","Photography","Music","Sports","Counselling","Legal","Other",
];
const LANGUAGES = ["Hindi","English","Tamil","Telugu","Bengali","Marathi","Kannada","Gujarati","Punjabi","Malayalam","Other"];
const INTERESTS = ["Child Education","Women Empowerment","Environment","Healthcare","Elderly Care","Skill Development","Mental Health","Nutrition"];

/* ── Shared input style ─────────────────────────────────────────────── */
const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border border-gray-200 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-green-600";

/* ── Labeled input ─────────────────────────────────────────────────────
   Defined at module scope, NOT inside the Register component. This is the
   fix for the focus-loss bug: when a component is defined inside another
   component's render body, it's a brand-new function on every re-render,
   so React treats it as a different component type and remounts the
   underlying <input> instead of updating it — which drops focus after
   every keystroke. Defining it here means the same function reference is
   reused across every render, so React correctly diffs and updates props
   on the existing DOM node instead of tearing it down. ── */
const LabeledInput = ({ label, name, type = "text", value, onChange, placeholder, required, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {hint && <p className="text-xs text-gray-400 -mt-1">{hint}</p>}
    <input name={name} type={type} value={value} onChange={onChange}
      placeholder={placeholder} required={required}
      className={inputCls}/>
  </div>
);

/* ── Multi-select pill ──────────────────────────────────────────────── */
const PillSelect = ({ options, selected, onChange, accent = C.forest }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => {
      const active = selected.includes(opt);
      return (
        <button
          key={opt} type="button"
          onClick={() => onChange(active ? selected.filter(s => s !== opt) : [...selected, opt])}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
          style={active
            ? { background: accent, color: "white", borderColor: accent }
            : { background: "white", color: "#4B5563", borderColor: "#E5E7EB" }
          }
        >
          {opt}
        </button>
      );
    })}
  </div>
);

/* ── Progress rail ──────────────────────────────────────────────────── */
const ProgressRail = ({ step }) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {STEPS.map((s, i) => (
      <div key={s.id} className="flex items-center">
        {/* Node */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
            style={{
              background: s.id < step ? C.sage : s.id === step ? C.forest : "#E5E7EB",
              color:      s.id < step ? "white" : s.id === step ? C.cream : "#9CA3AF",
            }}>
            {s.id < step ? <Check size={14}/> : s.id}
          </div>
          <span className="text-2xs font-medium hidden sm:block"
            style={{ color: s.id === step ? C.forest : "#9CA3AF", fontSize: "10px" }}>
            {s.label}
          </span>
        </div>
        {/* Connector */}
        {i < STEPS.length - 1 && (
          <div className="w-12 sm:w-16 h-0.5 mx-1 mb-4 transition-all duration-300"
            style={{ background: s.id < step ? C.sage : "#E5E7EB" }} />
        )}
      </div>
    ))}
  </div>
);

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    // Step 1
    fullName: "", email: "", password: "", confirmPassword: "",
    // Step 2
    phone: "", dateOfBirth: "", gender: "", city: "", state: "", address: "",
    // Step 3
    skills: [], areasOfInterest: [], languages: [],
    availability: { weekdays:false, weekends:false, mornings:false, evenings:false },
    education: "", occupation: "",
    // Step 4
    emergencyContact: { name:"", phone:"", relation:"" },
  });

  const set = (field, value) => { setError(""); setForm(p => ({ ...p, [field]: value })); };
  const setNested = (parent, field, value) =>
    setForm(p => ({ ...p, [parent]: { ...p[parent], [field]: value } }));

  /* ── Per-step validation ── */
  const validate = () => {
    if (step === 1) {
      if (!form.fullName.trim()) return "Full name is required.";
      if (!form.email.trim())    return "Email is required.";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email.";
      if (form.password.length < 8) return "Password must be at least 8 characters.";
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
        return "Password needs uppercase, lowercase, and a number.";
      if (form.password !== form.confirmPassword) return "Passwords do not match.";
    }
    if (step === 2) {
      if (!form.city.trim()) return "City is required.";
    }
    if (step === 3) {
      if (form.skills.length === 0) return "Select at least one skill.";
    }
    return null;
  };

  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    if (step < 4) { setStep(s => s + 1); setError(""); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { confirmPassword, ...payload } = form;
    try {
      await authAPI.register(payload);
      toast.success("Account created! Check your email to verify.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-start lg:items-center justify-center px-4 py-12"
      style={{ background: C.mist }}>
      <div className="w-full max-w-xl">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-cent justify-center shadow-sm group-hover:bg-brand-600 transition-colors">
            <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" alt="NayePankh" className="text-white" />
          </div>
          <span style={{fontFamily:"'Fraunces',serif",fontWeight:700,color:C.forest,fontSize:"1.05rem"}}>NayePankh Foundation</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-8 sm:px-8">

          <div className="mb-6 text-center">
            <h1 style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:700,fontSize:"1.6rem",color:C.forest}}>
              Become a volunteer
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Step {step} of {STEPS.length} — {STEPS[step-1].label}
            </p>
          </div>

          <ProgressRail step={step}/>

          {error && (
            <div className="mb-5 flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
              style={{background:"#FEF2F2",border:"1px solid #FECACA",color:"#B91C1C"}}>
              <AlertCircle size={15} className="mt-0.5 shrink-0"/>{error}
            </div>
          )}

          <form onSubmit={step === 4 ? handleSubmit : (e)=>{ e.preventDefault(); next(); }}>

            {/* ── STEP 1: Account ── */}
            {step === 1 && (
              <div className="space-y-4">
                <LabeledInput label="Full name" name="fullName" value={form.fullName}
                  onChange={e=>set("fullName",e.target.value)} placeholder="Priya Sharma" required/>
                <LabeledInput label="Email address" name="email" type="email" value={form.email}
                  onChange={e=>set("email",e.target.value)} placeholder="you@example.com" required/>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Password<span className="text-red-400 ml-0.5">*</span></label>
                  <p className="text-xs text-gray-400 -mt-1">Min. 8 chars with uppercase, lowercase, and number</p>
                  <div className="relative">
                    <input name="password" type={showPass?"text":"password"} value={form.password}
                      onChange={e=>set("password",e.target.value)} placeholder="••••••••" required
                      className={inputCls + " pr-11"}/>
                    <button type="button" tabIndex={-1} onClick={()=>setShowPass(s=>!s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Confirm password<span className="text-red-400 ml-0.5">*</span></label>
                  <input name="confirmPassword" type="password" value={form.confirmPassword}
                    onChange={e=>set("confirmPassword",e.target.value)} placeholder="••••••••" required
                    className={inputCls}/>
                </div>
              </div>
            )}

            {/* ── STEP 2: Personal ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <LabeledInput label="Phone" name="phone" type="tel" value={form.phone}
                    onChange={e=>set("phone",e.target.value)} placeholder="+91 98100 00000"/>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Date of birth</label>
                    <input type="date" value={form.dateOfBirth} onChange={e=>set("dateOfBirth",e.target.value)}
                      className={inputCls}/>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <select value={form.gender} onChange={e=>set("gender",e.target.value)} className={inputCls}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <LabeledInput label="City" name="city" value={form.city} required
                    onChange={e=>set("city",e.target.value)} placeholder="New Delhi"/>
                  <LabeledInput label="State" name="state" value={form.state}
                    onChange={e=>set("state",e.target.value)} placeholder="Delhi"/>
                </div>
                <LabeledInput label="Address" name="address" value={form.address}
                  onChange={e=>set("address",e.target.value)} placeholder="123, Main Street"/>
                <div className="grid grid-cols-2 gap-4">
                  <LabeledInput label="Education" name="education" value={form.education}
                    onChange={e=>set("education",e.target.value)} placeholder="B.Tech CS"/>
                  <LabeledInput label="Occupation" name="occupation" value={form.occupation}
                    onChange={e=>set("occupation",e.target.value)} placeholder="Software Engineer"/>
                </div>
              </div>
            )}

            {/* ── STEP 3: Skills ── */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Skills <span className="text-red-400">*</span>
                  </p>
                  <PillSelect options={SKILLS_LIST} selected={form.skills}
                    onChange={v=>set("skills",v)} accent={C.forest}/>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Areas of interest</p>
                  <PillSelect options={INTERESTS} selected={form.areasOfInterest}
                    onChange={v=>set("areasOfInterest",v)} accent={C.sage}/>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Languages spoken</p>
                  <PillSelect options={LANGUAGES} selected={form.languages}
                    onChange={v=>set("languages",v)} accent={C.gold}/>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Availability</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[["weekdays","Weekdays"],["weekends","Weekends"],["mornings","Mornings"],["evenings","Evenings"]].map(([key,label])=>(
                      <label key={key} className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all"
                        style={{
                          borderColor: form.availability[key] ? C.sage : "#E5E7EB",
                          background:  form.availability[key] ? `${C.sage}15` : "white",
                        }}>
                        <input type="checkbox" checked={form.availability[key]}
                          onChange={e=>setNested("availability",key,e.target.checked)}
                          className="w-4 h-4 accent-green-700"/>
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: Emergency contact ── */}
            {step === 4 && (
              <div className="space-y-5">
                <p className="text-sm text-gray-500 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  We only contact this person in case of an emergency during on-site activities.
                </p>
                <LabeledInput label="Contact name" name="ec-name" value={form.emergencyContact.name}
                  onChange={e=>setNested("emergencyContact","name",e.target.value)}
                  placeholder="Rajan Sharma"/>
                <div className="grid grid-cols-2 gap-4">
                  <LabeledInput label="Phone number" name="ec-phone" type="tel"
                    value={form.emergencyContact.phone}
                    onChange={e=>setNested("emergencyContact","phone",e.target.value)}
                    placeholder="+91 98100 11111"/>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Relation</label>
                    <select value={form.emergencyContact.relation}
                      onChange={e=>setNested("emergencyContact","relation",e.target.value)}
                      className={inputCls}>
                      <option value="">Select</option>
                      <option>Parent</option><option>Sibling</option>
                      <option>Spouse</option><option>Friend</option><option>Other</option>
                    </select>
                  </div>
                </div>
                {/* Final review summary */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-1.5 text-xs text-gray-500">
                  <p className="font-semibold text-gray-700 text-sm mb-2">Review your details</p>
                  <p><span className="font-medium text-gray-700">Name:</span> {form.fullName}</p>
                  <p><span className="font-medium text-gray-700">Email:</span> {form.email}</p>
                  <p><span className="font-medium text-gray-700">City:</span> {form.city}{form.state ? `, ${form.state}` : ""}</p>
                  <p><span className="font-medium text-gray-700">Skills:</span> {form.skills.join(", ") || "—"}</p>
                  <p><span className="font-medium text-gray-700">Languages:</span> {form.languages.join(", ") || "—"}</p>
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex items-center justify-between mt-8 gap-3">
              {step > 1 ? (
                <button type="button" onClick={()=>{setStep(s=>s-1);setError("");}}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                  <ArrowLeft size={15}/> Back
                </button>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                  <ArrowLeft size={15}/> Sign in
                </Link>
              )}

              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                style={{background:C.forest,color:C.cream}}>
                {loading
                  ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"/>
                  : step === 4
                    ? <><Check size={15}/> Create account</>
                    : <>Continue <ArrowRight size={15}/></>
                }
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-medium hover:underline" style={{color:C.forest}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
