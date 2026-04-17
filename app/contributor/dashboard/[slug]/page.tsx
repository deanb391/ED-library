import React from 'react';
import { 
  Bell, 
  LayoutGrid, 
  FileText, 
  Users, 
  Settings, 
  HelpCircle,
  Info,
  MapPin,
  Atom,
  PlusCircle,
  UploadCloud,
  LineChart,
  CheckCircle2,
  Circle,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardUnderReviewPage() {
  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col font-sans text-gray-900">
      
      {/* --- Top Navigation --- */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-10">
          <div className="font-extrabold text-xl tracking-tight text-gray-900">
            Azure Scholar
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-500">
            <Link href="#" className="text-gray-900 transition-colors">Dashboard</Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">Courses</Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">Earnings</Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-gray-500 hover:text-gray-900 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden cursor-pointer">
            {/* Dummy profile image */}
            <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </nav>

      {/* --- Page Layout (Sidebar + Main) --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* --- Left Sidebar --- */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col flex-shrink-0">
          
          {/* Contributor Status Badge */}
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0">
              <GraduationCap size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">Academic<br/>Contributor</h3>
              <p className="text-[11px] font-semibold text-gray-500 mt-0.5">Status: Under Review</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-6 px-4 space-y-1">
            <SidebarItem icon={<LayoutGrid size={18} />} label="Overview" active />
            <SidebarItem icon={<FileText size={18} />} label="My Uploads" />
            <SidebarItem icon={<Users size={18} />} label="Subscribers" />
            <SidebarItem icon={<Settings size={18} />} label="Settings" />
            <SidebarItem icon={<HelpCircle size={18} />} label="Help" />
          </div>

          {/* Bottom Action */}
          <div className="p-6">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-sm transition-all text-sm">
              Upload New Notes
            </button>
          </div>
        </aside>

        {/* --- Main Content Area --- */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Alert Banner */}
            <div className="bg-[#EBF3FF] border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
                  <Info size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Your application is currently Under Review</h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                    Full access to advanced features will be granted once our academic board approves your credentials.
                  </p>
                </div>
              </div>
              <button className="bg-[#0B1528] hover:bg-black text-white text-sm font-bold py-3 px-6 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-md">
                View Application Status
              </button>
            </div>

            {/* Profile & Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Profile Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row gap-6">
                {/* Avatar with Badge */}
                <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28">
                  <img src="/api/placeholder/120/120" alt="Dr. Elias Thorne" className="w-full h-full rounded-2xl object-cover border border-gray-100" />
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[9px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider border border-white shadow-sm">
                    Reviewing
                  </div>
                </div>

                {/* Info */}
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-2xl font-extrabold text-gray-900">Dr. Elias Thorne</h2>
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Under Review
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-lg">
                    Specializing in Advanced Quantum Mechanics and Theoretical Physics. Currently a Senior Researcher at the Institute for Advanced Study, focused on bridging the gap between academic theory and practical student understanding.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-blue-600" />
                      <span>Cambridge, United Kingdom</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Atom size={14} className="text-blue-600" />
                      <span>Theoretical Physics</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-6">Profile Activity</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Profile Views</span>
                      <span className="font-extrabold text-gray-900">142</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Joined Date</span>
                      <span className="font-extrabold text-gray-900">Oct 2024</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Upload Credits</span>
                      <span className="font-extrabold text-gray-900">50.0</span>
                    </div>
                  </div>
                </div>
                
                <button className="text-left text-sm font-bold text-blue-600 hover:text-blue-700 mt-6 transition-colors">
                  Edit Bio Details
                </button>
              </div>
            </div>

            {/* Disabled Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <DisabledActionCard 
                icon={<PlusCircle size={20} />} 
                title="Create Course" 
                desc="Design and launch interactive curriculums for students worldwide." 
              />
              <DisabledActionCard 
                icon={<UploadCloud size={20} />} 
                title="Upload Assets" 
                desc="Batch upload research papers, slide decks, and lecture recordings." 
              />
              <DisabledActionCard 
                icon={<LineChart size={20} />} 
                title="Deep Analytics" 
                desc="Track student engagement, completion rates, and feedback loops." 
              />
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Application Activity</h3>
              
              <div className="space-y-4">
                {/* Completed Step 1 */}
                <div className="bg-gray-50 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ml-1"></div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Application received and verification started</h4>
                      <p className="text-xs text-gray-500 mt-0.5">2 days ago</p>
                    </div>
                  </div>
                  <CheckCircle2 size={18} className="text-gray-400 sm:mr-2" />
                </div>

                {/* Completed Step 2 */}
                <div className="bg-gray-50 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ml-1"></div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Credential documents (Ph.D. Physics) verified</h4>
                      <p className="text-xs text-gray-500 mt-0.5">1 day ago</p>
                    </div>
                  </div>
                  <CheckCircle2 size={18} className="text-gray-400 sm:mr-2" />
                </div>

                {/* Current Active Step */}
                <div className="bg-white border border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
                  {/* Subtle active state highlight line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ml-1"></div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Final review by Academic Board in progress</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Started 4 hours ago</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider sm:mr-2">
                    Current Step
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="py-8 flex flex-col items-center justify-center gap-4">
              <div className="flex gap-6 text-xs font-bold text-gray-500">
                <Link href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
                <Link href="#" className="hover:text-gray-900 transition-colors">Faculty Guidelines</Link>
              </div>
              <div className="text-[11px] text-gray-400 font-medium">
                © 2024 Azure Scholar Academic Systems
              </div>
            </footer>

          </div>
        </main>

      </div>
    </div>
  );
}

// --- Helper Components ---

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button 
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
        ${active 
          ? 'bg-[#F4F7F9] text-blue-600' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
      <div className={`${active ? 'text-blue-600' : 'text-gray-400'}`}>
        {icon}
      </div>
      {label}
    </button>
  );
}

function DisabledActionCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-[#F8F9FB] rounded-2xl border border-gray-100 p-6 flex flex-col opacity-70">
      <div className="w-10 h-10 bg-gray-200/50 rounded-full flex items-center justify-center text-gray-400 mb-4">
        {icon}
      </div>
      <h4 className="text-sm font-bold text-gray-600 mb-2">{title}</h4>
      <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}