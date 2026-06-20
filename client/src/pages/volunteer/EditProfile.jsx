import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Save, Camera, AlertCircle, CheckCircle,
  Eye, EyeOff,
} from "lucide-react";
import { volunteerAPI } from "@/api/volunteer.api";
import { useAuthStore } from "@/store/authStore";
import { Skeleton } from "@/components/common/Loader";
import toast from "react-hot-toast";

const C = { forest:"#1B3A2D", gold:"#C8923A", sage:"#7BAF8A", cream:"#F7F2E8" };

const SKILLS_LIST = [
  "Teaching","Medical","Technology","Logistics","Fundraising",
  "Design","Photography","Music","Sports","Counselling","Legal","Other",
];
const LANGUAGES = [
  "Hindi","English","Tamil","Telugu","Bengali","Marathi",
  "Kannada","Gujarati","Punjabi","Malayalam","Other",
];
const INTERESTS = [
  "Child Education","Women Empowerment","Environment","Healthcare",
  "Elderly Care","Skill Development","Mental Health","Nutrition",
];

/* ── Reusable primitives ─────────────────────────────────────────── */
const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 bg-white text-gray-900 outline-none transition-all focus:ring-2 focus:ring-green-700 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400";

const Field = ({ label, required, hint, error, children }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
    )}
    {hint && <p className="text-xs text-gray-400 -mt-1">{hint}</p>}
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const SectionCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-50">
      <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    <div className="px-6 py-5 space-y-4">{children}</div>
  </div>
);

const PillToggle = ({ options, selected, onChange, accent }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => {
      const active = selected.includes(opt);
      return (
        <button key={opt} type="button"
          onClick={() => onChange(active ? selected.filter(s=>s!==opt) : [...selected, opt])}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
          style={active
            ? { background:accent, color:"white", borderColor:accent }
            : { background:"white", color:"#4B5563", borderColor:"#E5E7EB" }
          }>
          {opt}
        </button>
      );
    })}
  </div>
);

const CheckBox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer transition-all select-none"
    style={{ borderColor:checked ? C.sage : "#E5E7EB", background:checked ? `${C.sage}12` : "white" }}>
    <input type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4 accent-green-700"/>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </label>
);

/* ── Avatar upload widget ───────────────────────────────────────── */
const AvatarUploader = ({ currentPhoto, name, onUpload, uploading }) => {
  const fileRef = useRef(null);
  return (
    <div className="flex items-center gap-5">
      <div className="relative w-20 h-20 shrink-0">
        {currentPhoto
          ? <img src={currentPhoto} alt={name} className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100"/>
          : <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
              style={{ background:C.forest }}>
              {name?.charAt(0).toUpperCase()}
            </div>
        }
        <button type="button" onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl border-2 border-white flex items-center justify-center shadow-sm transition-colors"
          style={{ background:C.forest }}>
          {uploading
            ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
            : <Camera size={13} className="text-white"/>}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
          className="hidden" onChange={onUpload}/>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{name}</p>
        <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or WebP · max 5MB</p>
        <button type="button" onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="text-xs font-medium mt-2 hover:underline disabled:opacity-50"
          style={{ color:C.forest }}>
          {uploading ? "Uploading…" : "Change photo"}
        </button>
      </div>
    </div>
  );
};

/* ── Unsaved changes bar ────────────────────────────────────────── */
const UnsavedBar = ({ dirty, saving, onSave, onDiscard }) => (
  <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${dirty ? "translate-y-0" : "translate-y-full"}`}>
    <div className="max-w-5xl mx-auto px-4 pb-4">
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl shadow-lg"
        style={{ background:C.forest }}>
        <div className="flex items-center gap-2.5">
          <AlertCircle size={15} className="text-amber-300"/>
          <p className="text-sm font-medium text-white">You have unsaved changes</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onDiscard}
            className="px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            Discard
          </button>
          <button type="button" onClick={onSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-60"
            style={{ background:C.gold, color:C.forest }}>
            {saving
              ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"/>
              : <Save size={13}/>
            }
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ── Main ───────────────────────────────────────────────────────── */
export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const [form, setForm]         = useState(null);
  const [original, setOriginal] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors]     = useState({});
  const [dirty, setDirty]       = useState(false);

  /* Load profile on mount */
  useEffect(() => {
    volunteerAPI.getProfile()
      .then(({ data }) => {
        const u = data.data.user;
        const snapshot = {
          fullName:    u.fullName || "",
          phone:       u.phone || "",
          dateOfBirth: u.dateOfBirth ? u.dateOfBirth.split("T")[0] : "",
          gender:      u.gender || "",
          city:        u.city || "",
          state:       u.state || "",
          address:     u.address || "",
          education:   u.education || "",
          occupation:  u.occupation || "",
          skills:         u.skills || [],
          areasOfInterest:u.areasOfInterest || [],
          languages:      u.languages || [],
          availability: {
            weekdays: u.availability?.weekdays || false,
            weekends: u.availability?.weekends || false,
            mornings: u.availability?.mornings || false,
            evenings: u.availability?.evenings || false,
          },
          emergencyContact: {
            name:     u.emergencyContact?.name || "",
            phone:    u.emergencyContact?.phone || "",
            relation: u.emergencyContact?.relation || "",
          },
        };
        setForm(snapshot);
        setOriginal(JSON.stringify(snapshot));
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  /* Track dirty state */
  useEffect(() => {
    if (!form || !original) return;
    setDirty(JSON.stringify(form) !== original);
  }, [form, original]);

  /*
   * Warn before closing the tab, refreshing, or navigating away via the
   * browser's own back/forward with unsaved changes. This only covers
   * browser-level navigation (not in-app Link clicks, which would need
   * a router data API to intercept) — but it's the highest-value, lowest-risk
   * protection against accidentally losing edits.
   */
  useEffect(() => {
    const handler = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const set = (field, value) => {
    setErrors(p => ({ ...p, [field]: "" }));
    setForm(p => ({ ...p, [field]: value }));
  };
  const setNested = (parent, field, value) =>
    setForm(p => ({ ...p, [parent]: { ...p[parent], [field]: value } }));

  /* Validation */
  const validate = () => {
    const e = {};
    if (!form.fullName.trim())    e.fullName = "Name is required.";
    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone))
      e.phone = "Enter a valid phone number.";
    if (!form.city.trim())        e.city = "City is required.";
    if (form.skills.length === 0) e.skills = "Select at least one skill.";
    return e;
  };

  /* Save */
  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); toast.error("Fix the errors below."); return; }

    setSaving(true);
    try {
      const { data } = await volunteerAPI.updateProfile(form);
      const updated = data.data.user;
      updateUser(updated);
      setOriginal(JSON.stringify(form));
      setDirty(false);
      toast.success("Profile saved.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  /* Photo upload */
  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Photo must be under 5MB."); return; }
    const fd = new FormData();
    fd.append("photo", file);
    setUploading(true);
    try {
      const { data } = await volunteerAPI.uploadPhoto(fd);
      updateUser({ profilePhoto: data.data.photoUrl });
      toast.success("Photo updated.");
    } catch (err) { toast.error(err.response?.data?.message || "Upload failed."); }
    finally { setUploading(false); }
  };

  const handleDiscard = () => {
    const snap = JSON.parse(original);
    setForm(snap);
    setErrors({});
    setDirty(false);
    toast("Changes discarded.", { icon: "↩️" });
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-4">
      {[1,2,3,4].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl"/>)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto pb-28">

      {/* ── Page header ── */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/volunteer/profile"
          onClick={(e) => {
            if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) {
              e.preventDefault();
            }
          }}
          className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16}/>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily:"'Fraunces',serif" }}>
            Edit profile
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Changes are saved to your account</p>
        </div>
        <button onClick={handleSave} disabled={saving || !dirty}
          className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background:C.forest, color:C.cream }}>
          {saving
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
            : <Save size={14}/>
          }
          Save
        </button>
      </div>

      <div className="space-y-5">

        {/* ── Photo + name ── */}
        <SectionCard title="Profile photo & name">
          <AvatarUploader
            currentPhoto={user?.profilePhoto}
            name={form.fullName}
            onUpload={handlePhoto}
            uploading={uploading}
          />
          <Field label="Full name" required error={errors.fullName}>
            <input value={form.fullName} onChange={e=>set("fullName",e.target.value)}
              placeholder="Priya Sharma" className={inputCls}/>
          </Field>
        </SectionCard>

        {/* ── Contact info ── */}
        <SectionCard title="Contact information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone number" error={errors.phone}>
              <input value={form.phone} onChange={e=>set("phone",e.target.value)}
                type="tel" placeholder="+91 98100 00000" className={inputCls}/>
            </Field>
            <Field label="Date of birth">
              <input value={form.dateOfBirth} onChange={e=>set("dateOfBirth",e.target.value)}
                type="date" className={inputCls}/>
            </Field>
          </div>
          <Field label="Gender">
            <select value={form.gender} onChange={e=>set("gender",e.target.value)} className={inputCls}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="City" required error={errors.city}>
              <input value={form.city} onChange={e=>set("city",e.target.value)}
                placeholder="New Delhi" className={inputCls}/>
            </Field>
            <Field label="State">
              <input value={form.state} onChange={e=>set("state",e.target.value)}
                placeholder="Delhi" className={inputCls}/>
            </Field>
          </div>
          <Field label="Address">
            <textarea value={form.address} onChange={e=>set("address",e.target.value)}
              rows={2} placeholder="House no., Street, Area…"
              className={inputCls + " resize-none"}/>
          </Field>
        </SectionCard>

        {/* ── Professional ── */}
        <SectionCard title="Professional background">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Occupation">
              <input value={form.occupation} onChange={e=>set("occupation",e.target.value)}
                placeholder="Software Engineer" className={inputCls}/>
            </Field>
            <Field label="Education">
              <input value={form.education} onChange={e=>set("education",e.target.value)}
                placeholder="B.Tech CS" className={inputCls}/>
            </Field>
          </div>
        </SectionCard>

        {/* ── Skills & interests ── */}
        <SectionCard title="Skills & interests" subtitle="Select everything that applies">
          <Field label="Skills" required error={errors.skills}>
            <PillToggle options={SKILLS_LIST} selected={form.skills}
              onChange={v=>set("skills",v)} accent={C.forest}/>
          </Field>
          <Field label="Areas of interest">
            <PillToggle options={INTERESTS} selected={form.areasOfInterest}
              onChange={v=>set("areasOfInterest",v)} accent={C.sage}/>
          </Field>
          <Field label="Languages spoken">
            <PillToggle options={LANGUAGES} selected={form.languages}
              onChange={v=>set("languages",v)} accent={C.gold}/>
          </Field>
          <Field label="Availability">
            <div className="grid grid-cols-2 gap-2">
              {[["weekdays","Weekdays"],["weekends","Weekends"],["mornings","Mornings"],["evenings","Evenings"]].map(([k,l])=>(
                <CheckBox key={k} label={l} checked={form.availability[k]}
                  onChange={e=>setNested("availability",k,e.target.checked)}/>
              ))}
            </div>
          </Field>
        </SectionCard>

        {/* ── Emergency contact ── */}
        <SectionCard title="Emergency contact" subtitle="Only contacted during on-site emergencies">
          <Field label="Contact name">
            <input value={form.emergencyContact.name}
              onChange={e=>setNested("emergencyContact","name",e.target.value)}
              placeholder="Rajan Sharma" className={inputCls}/>
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone number">
              <input value={form.emergencyContact.phone}
                onChange={e=>setNested("emergencyContact","phone",e.target.value)}
                type="tel" placeholder="+91 98100 11111" className={inputCls}/>
            </Field>
            <Field label="Relation">
              <select value={form.emergencyContact.relation}
                onChange={e=>setNested("emergencyContact","relation",e.target.value)}
                className={inputCls}>
                <option value="">Select</option>
                <option>Parent</option><option>Sibling</option>
                <option>Spouse</option><option>Friend</option><option>Other</option>
              </select>
            </Field>
          </div>
        </SectionCard>

      </div>

      {/* ── Sticky unsaved bar ── */}
      <UnsavedBar dirty={dirty} saving={saving} onSave={handleSave} onDiscard={handleDiscard}/>
    </div>
  );
}
