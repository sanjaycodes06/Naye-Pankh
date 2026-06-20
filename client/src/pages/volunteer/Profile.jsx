import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Edit3, Mail, Phone, MapPin, Calendar, Briefcase,
  GraduationCap, Globe, Shield, Award, Clock,
  CheckSquare, Download, ExternalLink, User,
} from "lucide-react";
import { volunteerAPI } from "@/api/volunteer.api";
import { useAuthStore } from "@/store/authStore";
import { Skeleton } from "@/components/common/Loader";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate } from "@/utils/formatDate";
import toast from "react-hot-toast";

const C = { forest:"#1B3A2D", gold:"#C8923A", sage:"#7BAF8A", cream:"#F7F2E8" };

/* ── Section wrapper ───────────────────────────────────────────────── */
const ProfileSection = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6">
    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{title}</h2>
    {children}
  </div>
);

/* ── Info row ──────────────────────────────────────────────────────── */
const InfoRow = ({ icon: Icon, label, value }) => (
  value ? (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <Icon size={15} className="text-gray-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-2xs text-gray-400 uppercase tracking-wider mb-0.5" style={{ fontSize:"10px" }}>{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  ) : null
);

/* ── Pill list ─────────────────────────────────────────────────────── */
const PillList = ({ items, accent }) => (
  items?.length > 0 ? (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <span key={item} className="px-2.5 py-1 rounded-lg text-xs font-medium"
          style={{ background:`${accent}18`, color:accent }}>
          {item}
        </span>
      ))}
    </div>
  ) : <p className="text-sm text-gray-400 italic">Not specified</p>
);

/* ── Certificate card ──────────────────────────────────────────────── */
const CertCard = ({ cert }) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:`${C.gold}18` }}>
        <Award size={16} style={{ color:C.gold }} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800 capitalize">{cert.certificateType}</p>
        <p className="text-xs text-gray-400">{cert.issuedFor} · {formatDate(cert.issuedAt)}</p>
      </div>
    </div>
    {cert.certificateUrl && (
      <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
        <Download size={12} /> Download
      </a>
    )}
  </div>
);

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile]       = useState(null);
  const [certs, setCerts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);

  useEffect(() => {
    Promise.all([
      volunteerAPI.getProfile(),
      user?.status === "approved" ? volunteerAPI.getCertificates() : Promise.resolve({ data: { data: { certificates: [] } } }),
    ])
      .then(([profileRes, certsRes]) => {
        setProfile(profileRes.data.data.user);
        setCerts(certsRes.data.data.certificates || []);
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Photo must be under 5MB."); return; }

    const form = new FormData();
    form.append("photo", file);
    setUploading(true);
    try {
      const { data } = await volunteerAPI.uploadPhoto(form);
      updateUser({ profilePhoto: data.data.photoUrl });
      setProfile(p => ({ ...p, profilePhoto: data.data.photoUrl }));
      toast.success("Photo updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Photo upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      {[1,2,3].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
    </div>
  );

  const p = profile || user;
  const avail = Object.entries(p?.availability || {}).filter(([,v])=>v).map(([k])=> k.charAt(0).toUpperCase()+k.slice(1));

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ── Hero card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Banner */}
        <div className="h-24 relative" style={{ background:`linear-gradient(135deg, ${C.forest} 0%, #2D5A40 100%)` }}>
          <div aria-hidden style={{
            position:"absolute",inset:0,
            backgroundImage:`radial-gradient(${C.sage}25 1px,transparent 1px)`,
            backgroundSize:"20px 20px",
          }}/>
        </div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              {p?.profilePhoto ? (
                <img src={p.profilePhoto} alt={p.fullName}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-sm"/>
              ) : (
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-sm flex items-center justify-center text-2xl font-bold text-white"
                  style={{ background:C.forest }}>
                  {p?.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Upload overlay */}
              <label className="absolute inset-0 flex items-center justify-center rounded-2xl cursor-pointer bg-black/0 hover:bg-black/30 transition-colors group">
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={uploading}/>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploading
                    ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin block"/>
                    : <Edit3 size={16} className="text-white drop-shadow"/>
                  }
                </div>
              </label>
            </div>

            <Link to="/volunteer/profile/edit"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
              <Edit3 size={14}/> Edit profile
            </Link>
          </div>

          {/* Name + meta */}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily:"'Fraunces',serif" }}>
                {p?.fullName}
              </h1>
              <StatusBadge status={p?.status} />
            </div>
            {p?.volunteerId && (
              <p className="text-xs text-gray-400 font-mono mt-0.5">{p.volunteerId}</p>
            )}
            {p?.occupation && (
              <p className="text-sm text-gray-500 mt-1">{p.occupation}{p.city ? ` · ${p.city}` : ""}</p>
            )}
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-6 mt-5 pt-5 border-t border-gray-50">
            {[
              { icon:Clock,       val: p?.totalHours ?? 0,      label:"Hours" },
              { icon:CheckSquare, val: p?.tasksCompleted ?? 0,  label:"Tasks" },
              { icon:Award,       val: certs.length,            label:"Certs" },
            ].map(({ icon:Icon, val, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={15} className="text-gray-400"/>
                <span className="text-sm font-bold text-gray-800">{val}</span>
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Personal info */}
          <ProfileSection title="Personal information">
            <InfoRow icon={Mail}          label="Email"      value={p?.email} />
            <InfoRow icon={Phone}         label="Phone"      value={p?.phone} />
            <InfoRow icon={MapPin}        label="Location"   value={[p?.city, p?.state].filter(Boolean).join(", ")} />
            <InfoRow icon={Calendar}      label="Date of birth" value={p?.dateOfBirth ? formatDate(p.dateOfBirth) : null} />
            <InfoRow icon={User}          label="Gender"     value={p?.gender ? p.gender.replace("_"," ") : null} />
            <InfoRow icon={Briefcase}     label="Occupation" value={p?.occupation} />
            <InfoRow icon={GraduationCap} label="Education"  value={p?.education} />
            {p?.address && (
              <div className="flex items-start gap-3 py-2.5">
                <MapPin size={15} className="text-gray-400 mt-0.5 shrink-0"/>
                <div>
                  <p className="text-2xs text-gray-400 uppercase tracking-wider mb-0.5" style={{ fontSize:"10px" }}>Address</p>
                  <p className="text-sm font-medium text-gray-800">{p.address}</p>
                </div>
              </div>
            )}
          </ProfileSection>

          {/* Skills & interests */}
          <ProfileSection title="Skills & interests">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-2">Skills</p>
                <PillList items={p?.skills} accent={C.forest} />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Areas of interest</p>
                <PillList items={p?.areasOfInterest} accent={C.sage} />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Languages</p>
                <PillList items={p?.languages} accent={C.gold} />
              </div>
            </div>
          </ProfileSection>

          {/* Certificates */}
          {certs.length > 0 && (
            <ProfileSection title={`Certificates (${certs.length})`}>
              <div className="space-y-2">
                {certs.map(c => <CertCard key={c._id} cert={c} />)}
              </div>
            </ProfileSection>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">

          {/* Availability */}
          <ProfileSection title="Availability">
            {avail.length > 0 ? (
              <div className="space-y-2">
                {avail.map(a => (
                  <div key={a} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium"
                    style={{ background:`${C.sage}12`, color:C.forest }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background:C.sage }}/>
                    {a}
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400 italic">Not specified</p>}
          </ProfileSection>

          {/* Emergency contact */}
          {p?.emergencyContact?.name && (
            <ProfileSection title="Emergency contact">
              <div className="space-y-1.5 text-sm">
                <p className="font-semibold text-gray-800">{p.emergencyContact.name}</p>
                {p.emergencyContact.relation && (
                  <p className="text-xs text-gray-400 capitalize">{p.emergencyContact.relation}</p>
                )}
                {p.emergencyContact.phone && (
                  <a href={`tel:${p.emergencyContact.phone}`}
                    className="flex items-center gap-1.5 text-sm mt-2 hover:underline"
                    style={{ color:C.forest }}>
                    <Phone size={13}/>{p.emergencyContact.phone}
                  </a>
                )}
              </div>
            </ProfileSection>
          )}

          {/* Account details */}
          <ProfileSection title="Account">
            <div className="space-y-2 text-xs">
              {[
                ["Joined",    p?.joinedAt ? formatDate(p.joinedAt) : "—"],
                ["Approved",  p?.approvedAt ? formatDate(p.approvedAt) : "Pending"],
                ["Last login",p?.lastLogin  ? formatDate(p.lastLogin) : "—"],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-gray-700">{val}</span>
                </div>
              ))}
            </div>
          </ProfileSection>

          {/* Verify cert */}
          <Link to="/verify/lookup"
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors w-full">
            <Shield size={15} style={{ color:C.gold }}/>
            Verify a certificate
            <ExternalLink size={12} className="ml-auto text-gray-300"/>
          </Link>
        </div>
      </div>
    </div>
  );
}

