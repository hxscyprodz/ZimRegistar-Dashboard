import type { BirthCertificateApp } from "@/lib/types";
import { Shield, QrCode } from "lucide-react";
import { format } from "date-fns";

export function BirthCertificatePrint({ app }: { app: BirthCertificateApp }) {
  return (
    <div className="mx-auto w-full max-w-3xl border-4 border-double border-[#0A3D91] bg-white p-10 text-black shadow-lg">
      <div className="flex items-center justify-between border-b-2 border-[#D4AF37] pb-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-[#0A3D91] text-white">
          <Shield className="h-8 w-8 text-[#D4AF37]" />
        </div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#0A3D91]">Republic of Zimbabwe</p>
          <h2 className="font-serif text-2xl font-bold text-[#0A3D91]">Registrar General's Office</h2>
          <p className="mt-1 text-sm">OFFICIAL BIRTH CERTIFICATE</p>
        </div>
        <div className="text-right text-xs">
          <p>Reg. No.</p>
          <p className="font-mono font-bold">{app.applicationNumber}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
        <Row k="Full Name" v={`${app.child.firstName} ${app.child.lastName}`} />
        <Row k="Date of Birth" v={app.child.dateOfBirth} />
        <Row k="Gender" v={app.child.gender} />
        <Row k="Place of Birth" v={`${app.child.hospital}, ${app.child.cityOfBirth}`} />
        <Row k="Residential Address" v={app.child.address} />
      </div>

      <h3 className="mt-6 border-b border-[#D4AF37]/60 pb-1 font-serif text-base font-bold text-[#0A3D91]">Parents</h3>
      <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
        <Row k="Mother" v={`${app.mother.firstName} ${app.mother.lastName}`} />
        <Row k="Mother's National ID" v={app.mother.nationalId} />
        <Row k="Father" v={`${app.father.firstName} ${app.father.lastName}`} />
        <Row k="Father's National ID" v={app.father.nationalId} />
      </div>

      <div className="mt-8 flex items-end justify-between gap-6">
        <div className="text-center">
          <div className="grid h-24 w-24 place-items-center rounded-md border border-dashed border-black/40">
            <QrCode className="h-16 w-16" />
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-wider">Verification QR</p>
        </div>
        <div className="text-center">
          <div className="h-12 w-48 border-b border-black"></div>
          <p className="mt-1 text-[10px] uppercase tracking-wider">Registrar Signature</p>
        </div>
        <div className="text-center">
          <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-double border-[#0A3D91] text-[10px] font-bold text-[#0A3D91]">
            OFFICIAL<br/>SEAL
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-[10px] text-black/60">
        Issued on {format(new Date(app.approvedAt ?? Date.now()), "dd MMMM yyyy")} — This document is the property of the Government of Zimbabwe.
      </p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-black/60">{k}</p>
      <p className="border-b border-dotted border-black/40 pb-0.5 font-medium">{v}</p>
    </div>
  );
}