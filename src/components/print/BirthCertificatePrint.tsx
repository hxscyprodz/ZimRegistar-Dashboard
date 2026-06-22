import type { BirthCertificateApp } from "@/lib/types";
import type { ReactNode } from "react";
import { QrCode, Shield } from "lucide-react";
import { format } from "date-fns";

export function BirthCertificatePrint({ app }: { app: BirthCertificateApp }) {
  const issued = format(new Date(app.approvedAt ?? Date.now()), "dd MMMM yyyy");
  const fullName = `${app.child.firstName} ${app.child.lastName}`.toUpperCase();

  return (
    <div className="mx-auto w-full max-w-[820px] bg-white p-5 text-black shadow-xl print-birth-certificate">
      <div className="relative min-h-[1040px] border-[10px] border-double border-[#123f7a] bg-[#fffdf4] p-8">
        <div className="pointer-events-none absolute inset-5 border border-[#d4af37]" />
        <div className="pointer-events-none absolute inset-10 border border-[#123f7a]/35" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 grid h-72 w-72 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[18px] border-[#123f7a]/5 text-center text-[#123f7a]/10">
          <Shield className="h-28 w-28" />
        </div>

        <div className="relative z-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#123f7a]">Republic of Zimbabwe</p>
          <div className="mx-auto mt-3 grid h-20 w-20 place-items-center rounded-full border-4 border-double border-[#123f7a] bg-white text-[#123f7a]">
            <Shield className="h-10 w-10" />
          </div>
          <h2 className="mt-3 font-serif text-3xl font-black uppercase tracking-normal text-[#123f7a]">Birth Certificate</h2>
          <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.22em] text-black/70">Issued under the Births and Deaths Registration Act</p>
        </div>

        <div className="relative z-10 mt-7 grid grid-cols-[1fr_180px] gap-5 text-[12px]">
          <div className="rounded-sm border border-[#123f7a]/55 bg-white/70 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#123f7a]">Certificate Number</p>
            <p className="font-mono text-lg font-black tracking-normal text-black">{app.applicationNumber}</p>
          </div>
          <div className="rounded-sm border border-[#123f7a]/55 bg-white/70 p-4 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#123f7a]">Date Issued</p>
            <p className="font-bold tracking-normal">{issued}</p>
          </div>
        </div>

        <section className="relative z-10 mt-7">
          <SectionTitle>Particulars of Child</SectionTitle>
          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <Line label="Name in full" value={fullName} wide />
            <Line label="Sex" value={app.child.gender.toUpperCase()} />
            <Line label="Date of birth" value={app.child.dateOfBirth} />
            <Line label="Place of birth" value={`${app.child.hospital}, ${app.child.cityOfBirth}`.toUpperCase()} wide />
            <Line label="Usual residence" value={app.child.address.toUpperCase()} wide />
          </div>
        </section>

        <section className="relative z-10 mt-8">
          <SectionTitle>Particulars of Parents</SectionTitle>
          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <Line label="Mother's full name" value={`${app.mother.firstName} ${app.mother.lastName}`.toUpperCase()} />
            <Line label="Mother's national identity number" value={app.mother.nationalId} />
            <Line label="Father's full name" value={`${app.father.firstName} ${app.father.lastName}`.toUpperCase()} />
            <Line label="Father's national identity number" value={app.father.nationalId} />
          </div>
        </section>

        <section className="relative z-10 mt-8 rounded-sm border border-[#123f7a]/55 bg-white/65 p-4 text-[12px] leading-relaxed">
          <p>
            This is to certify that the above particulars are recorded in the Register of Births kept by the Registrar General's Department of Zimbabwe.
          </p>
        </section>

        <div className="relative z-10 mt-10 grid grid-cols-[120px_1fr_130px] items-end gap-7">
          <div className="text-center">
            <div className="grid h-24 w-24 place-items-center border border-black/45 bg-white">
              <QrCode className="h-16 w-16" />
            </div>
            <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-black/60">Verification</p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-12 w-64 border-b border-black" />
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-black/65">Registrar General / Authorised Officer</p>
          </div>
          <div className="grid h-28 w-28 place-items-center rounded-full border-4 border-double border-[#123f7a] bg-white text-center text-[10px] font-black uppercase leading-tight text-[#123f7a]">
            Official<br />Seal<br />Zimbabwe
          </div>
        </div>

        <p className="relative z-10 mt-8 text-center text-[10px] uppercase tracking-[0.16em] text-black/55">
          Registrar General's Office · Government of Zimbabwe
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="border-b-2 border-[#d4af37] pb-1 font-serif text-lg font-black uppercase tracking-normal text-[#123f7a]">
      {children}
    </h3>
  );
}

function Line({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">{label}</p>
      <p className="min-h-7 border-b border-dotted border-black/55 pb-1 font-semibold tracking-normal">{value}</p>
    </div>
  );
}