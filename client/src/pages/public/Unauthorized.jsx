import { Link } from "react-router-dom";
import { ShieldOff, ArrowLeft } from "lucide-react";
const C = { forest:"#1B3A2D", sage:"#7BAF8A", cream:"#F7F2E8", mist:"#FDFAF5" };
export default function Unauthorized() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4" style={{ background:C.mist }}>
      <div className="text-center space-y-5 max-w-sm">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-red-50">
          <ShieldOff size={28} className="text-red-400"/>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900" style={{fontFamily:"'Fraunces',serif"}}>Access denied</h1>
          <p className="text-sm text-gray-500">You don't have permission to view this page.</p>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{background:C.forest,color:C.cream}}>
          <ArrowLeft size={14}/> Go home
        </Link>
      </div>
    </div>
  );
}
