import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
const C = { forest:"#1B3A2D", sage:"#7BAF8A", cream:"#F7F2E8", mist:"#FDFAF5" };
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4" style={{ background:C.mist }}>
      <div className="text-center space-y-5">
        <div aria-hidden style={{fontFamily:"'Fraunces',serif",fontSize:"8rem",fontWeight:900,color:`${C.forest}12`,lineHeight:1}}>404</div>
        <div className="-mt-8 space-y-2">
          <h1 className="text-2xl font-bold text-gray-900" style={{fontFamily:"'Fraunces',serif"}}>Page not found</h1>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">This page doesn't exist or has moved. Let's get you back on track.</p>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{background:C.forest,color:C.cream}}>
          <ArrowLeft size={14}/> Back to home
        </Link>
      </div>
    </div>
  );
}
