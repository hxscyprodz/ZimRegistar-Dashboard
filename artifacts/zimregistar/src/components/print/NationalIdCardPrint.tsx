import type { NationalIdApp } from "@/lib/types";
import { format } from "date-fns";

export function NationalIdCardPrint({ app }: { app: NationalIdApp }) {
  // CR80 card size: 3.375" x 2.125" -> ~ 324px x 204px
  // Upscaled 2x for printing resolution
  return (
    <div className="flex flex-col gap-8 items-center bg-gray-100 p-8">
      {/* Front */}
      <div className="w-[648px] h-[408px] bg-white rounded-xl shadow-lg relative overflow-hidden flex flex-col border border-gray-200">
        <div className="h-16 bg-[#0F2342] flex items-center px-4 shrink-0">
          <img src="/logo.svg" alt="" className="h-10 w-10 brightness-0 invert" />
          <div className="ml-3 text-white">
            <h1 className="text-[14px] font-bold uppercase tracking-widest leading-tight">Republic of Zimbabwe</h1>
            <h2 className="text-[12px] text-white/80 uppercase tracking-widest">National Identity Card</h2>
          </div>
          <div className="ml-auto w-16 h-10 flex flex-col">
            <div className="flex-1 bg-[#006400]"></div>
            <div className="flex-1 bg-[#FFD200]"></div>
            <div className="flex-1 bg-[#D00000]"></div>
            <div className="flex-1 bg-black"></div>
            <div className="absolute top-3 right-[28px] w-6 h-6 flex items-center justify-center pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-4 h-4 fill-white"><polygon points="50,0 60,35 95,35 68,55 78,90 50,70 22,90 32,55 5,35 40,35" /></svg>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex p-4 relative">
          <div className="w-32 shrink-0">
            {app.documents.photo ? (
              <img src={app.documents.photo} alt="Photo" className="w-32 h-[170px] object-cover bg-gray-200" />
            ) : (
              <div className="w-32 h-[170px] bg-gray-200 border border-gray-300 flex items-center justify-center text-xs text-gray-400">Photo</div>
            )}
          </div>
          
          <div className="ml-6 flex-1 text-[13px] relative z-10 space-y-2">
            <div>
              <p className="text-[10px] uppercase text-gray-500 font-bold mb-0.5">National ID No.</p>
              <p className="font-mono text-xl font-bold tracking-tight">63-XXXXXXX Z {app.id.replace('nid-', '')}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-bold mb-0.5">Surname</p>
                <p className="font-bold uppercase text-[15px]">{app.applicant.lastName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-bold mb-0.5">First Names</p>
                <p className="font-bold uppercase text-[15px]">{app.applicant.firstName}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-bold mb-0.5">Date of Birth</p>
                <p className="font-bold">{format(new Date(app.applicant.dateOfBirth), "dd.MM.yyyy")}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-bold mb-0.5">Sex</p>
                <p className="font-bold">{app.applicant.gender[0]}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-bold mb-0.5">Citizenship</p>
                <p className="font-bold">ZWE</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-bold mb-0.5">Date of Issue</p>
                <p className="font-bold">{format(new Date(), "dd.MM.yyyy")}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-bold mb-0.5">Signature</p>
                <div className="border-b border-black h-4 w-24"></div>
              </div>
            </div>
          </div>
          
          <div className="absolute right-0 bottom-4 opacity-10 pointer-events-none">
            <img src="/logo.svg" alt="" className="h-40 w-40" />
          </div>
        </div>
      </div>

      {/* Back */}
      <div className="w-[648px] h-[408px] bg-white rounded-xl shadow-lg relative border border-gray-200 flex flex-col p-6">
        <div className="flex gap-4">
          <div className="w-20 h-24 bg-gray-200 border border-gray-300 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10 text-gray-400">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
            </svg>
          </div>
          
          <div className="flex-1 space-y-4 text-[13px]">
            <div>
              <p className="text-[10px] uppercase text-gray-500 font-bold mb-0.5">Residential Address at Registration</p>
              <p className="uppercase max-w-sm">{app.applicant.address}</p>
            </div>
            
            <div className="border border-gray-300 p-2 text-[10px] bg-gray-50">
              <p className="font-bold uppercase mb-1">Notice</p>
              <p>This card is the property of the Government of Zimbabwe. If found, please drop it in the nearest Police Station or Registrar General's Office.</p>
            </div>
          </div>
          
          <div className="w-24 h-24 bg-gray-100 flex items-center justify-center p-2">
            {/* Fake QR */}
            <svg viewBox="0 0 100 100" fill="black" className="w-full h-full opacity-80">
              <rect x="10" y="10" width="20" height="20" />
              <rect x="70" y="10" width="20" height="20" />
              <rect x="10" y="70" width="20" height="20" />
              <rect x="15" y="15" width="10" height="10" fill="white" />
              <rect x="75" y="15" width="10" height="10" fill="white" />
              <rect x="15" y="75" width="10" height="10" fill="white" />
              <rect x="40" y="40" width="20" height="20" />
              <rect x="35" y="10" width="25" height="10" />
              <rect x="70" y="40" width="20" height="25" />
              <rect x="10" y="40" width="15" height="20" />
              <rect x="40" y="75" width="50" height="15" />
            </svg>
          </div>
        </div>
        
        {/* MRZ Zone */}
        <div className="mt-auto bg-gray-50 p-3 font-mono text-[14px] tracking-[0.2em] font-bold text-gray-700">
          <p>IDZWE63XXXXXXZ&lt;{app.id.replace('nid-', '')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
          <p>{format(new Date(app.applicant.dateOfBirth), "yyMMdd")}0{app.applicant.gender[0]}2512319ZWE&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
          <p>{app.applicant.lastName.toUpperCase()}&lt;&lt;{app.applicant.firstName.toUpperCase().replace(' ', '<')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
        </div>
      </div>
    </div>
  );
}