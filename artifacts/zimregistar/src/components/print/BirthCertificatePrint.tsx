import type { BirthCertificateApp } from "@/lib/types";
import { format } from "date-fns";

export function BirthCertificatePrint({ app }: { app: BirthCertificateApp }) {
  return (
    <div className="bg-white text-black p-10 min-h-[1122px] w-[794px] mx-auto border-8 border-double border-slate-200 relative font-serif">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo.svg" alt="" className="w-96 h-96 object-contain" />
      </div>

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <img src="/logo.svg" alt="Zimbabwe Coat of Arms" className="w-24 h-24 mx-auto mb-4 object-contain brightness-0" />
        <h1 className="text-2xl font-bold uppercase tracking-[0.2em] mb-1">Republic of Zimbabwe</h1>
        <h2 className="text-lg font-semibold uppercase tracking-[0.1em] text-gray-700">Certified Copy of an Entry of Birth</h2>
        <p className="text-sm mt-2 font-mono">Serial No: {app.applicationNumber.replace('BC-', '')}</p>
      </div>

      <div className="space-y-6 relative z-10 text-sm">
        <div className="flex border-b border-black pb-2">
          <span className="w-48 font-bold">1. Entry Number:</span>
          <span className="font-mono">{app.id.toUpperCase()}</span>
        </div>
        
        <div className="flex border-b border-black pb-2">
          <span className="w-48 font-bold">2. Date and Place of Birth:</span>
          <span className="flex-1">{format(new Date(app.child.dateOfBirth), "dd MMMM yyyy")}, {app.child.hospital}, {app.child.cityOfBirth}</span>
        </div>

        <div className="flex border-b border-black pb-2">
          <span className="w-48 font-bold">3. Name:</span>
          <span className="flex-1 font-bold uppercase">{app.child.firstName} {app.child.lastName}</span>
        </div>

        <div className="flex border-b border-black pb-2">
          <span className="w-48 font-bold">4. Sex:</span>
          <span className="flex-1 uppercase">{app.child.gender}</span>
        </div>

        <div className="flex border-b border-black pb-2">
          <span className="w-48 font-bold">5. Name and Surname of Father:</span>
          <span className="flex-1 uppercase">{app.father.firstName} {app.father.lastName}</span>
        </div>

        <div className="flex border-b border-black pb-2">
          <span className="w-48 font-bold">6. Name and Maiden Name of Mother:</span>
          <span className="flex-1 uppercase">{app.mother.firstName} {app.mother.lastName}</span>
        </div>

        <div className="mt-16 pt-8 border-t border-black grid grid-cols-2 gap-8">
          <div>
            <p className="mb-8">I certify that the above is a true copy of an entry in the Register of Births kept at:</p>
            <p className="font-bold border-b border-black inline-block min-w-[200px]">{app.stationId} REGISTRY</p>
          </div>
          <div>
            <p className="mb-8">Date of Issue:</p>
            <p className="font-bold border-b border-black inline-block min-w-[200px]">{format(new Date(), "dd MMMM yyyy")}</p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="w-64 border-b border-black mx-auto mb-2 h-12 flex items-end justify-center">
            <span className="font-cursive text-xl">Registrar General</span>
          </div>
          <p className="font-bold uppercase text-xs">Registrar General</p>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-gray-500 uppercase">
        Warning: Any person who alters this certificate is liable to prosecution.
      </div>
    </div>
  );
}