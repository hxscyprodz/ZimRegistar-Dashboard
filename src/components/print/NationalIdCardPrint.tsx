import type { NationalIdApp } from "@/lib/types";
import { Fingerprint, ShieldCheck } from "lucide-react";

export function NationalIdCardPrint({ app }: { app: NationalIdApp }) {
  const fullName = `${app.applicant.firstName} ${app.applicant.lastName}`.toUpperCase();
  const sex = app.applicant.gender === "Male" ? "M" : "F";
  const issued = new Date(app.approvedAt ?? Date.now()).toISOString().slice(0, 10);
  const idNumber = app.applicationNumber.replace("NID-", "63-").replace("-", " ");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 print-id-card">
      <div className="relative h-[330px] w-[520px] overflow-hidden rounded-[18px] border border-black/25 bg-[#e9efe8] text-black shadow-xl">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,92,64,0.22),transparent_30%,rgba(232,186,56,0.22)_58%,rgba(177,29,42,0.18))]" />
        <div className="absolute left-[-80px] top-[-70px] h-52 w-52 rounded-full border-[28px] border-[#0f5c40]/15" />
        <div className="absolute bottom-[-55px] right-[-40px] h-44 w-44 rounded-full border-[24px] border-[#b11d2a]/12" />
        <div className="relative z-10 flex h-full flex-col p-5">
          <div className="flex items-start justify-between border-b border-black/25 pb-3">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#0f5c40] bg-white/80">
                <ShieldCheck className="h-7 w-7 text-[#0f5c40]" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0f5c40]">Republic of Zimbabwe</p>
                <h2 className="text-[18px] font-black uppercase leading-tight tracking-normal text-[#172554]">National Identity Card</h2>
                <p className="text-[9px] uppercase tracking-[0.22em] text-black/65">Registrar General's Department</p>
              </div>
            </div>
            <div className="text-right text-[10px] font-semibold uppercase text-black/70">
              <p>Card No.</p>
              <p className="font-mono text-[12px] text-black">{app.applicationNumber}</p>
            </div>
          </div>

          <div className="mt-4 grid flex-1 grid-cols-[128px_1fr] gap-4">
            <div className="space-y-3">
              <div className="h-36 overflow-hidden rounded-md border-2 border-white bg-white shadow-inner">
                <img src={app.documents.photo} alt={`${app.applicantName} passport photograph`} className="h-full w-full object-cover grayscale" />
              </div>
              <div className="grid h-14 place-items-center rounded-md border border-black/25 bg-white/60">
                <Fingerprint className="h-10 w-10 text-black/55" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-[12px]">
              <Field label="Surname" value={app.applicant.lastName.toUpperCase()} />
              <Field label="First Names" value={app.applicant.firstName.toUpperCase()} />
              <Field label="ID Number" value={idNumber} strong />
              <Field label="Sex" value={sex} />
              <Field label="Date of Birth" value={app.applicant.dateOfBirth} />
              <Field label="Nationality" value={app.applicant.nationality.toUpperCase()} />
              <div className="col-span-2"><Field label="Residential Address" value={app.applicant.address.toUpperCase()} /></div>
              <Field label="Date of Issue" value={issued} />
              <Field label="Status" value="APPROVED" strong />
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between border-t border-black/20 pt-2">
            <p className="max-w-[300px] font-mono text-[10px] uppercase tracking-normal text-black/70">ZWE&lt;{fullName.replaceAll(" ", "<")}&lt;&lt;{idNumber.replaceAll(" ", "")}</p>
            <div className="rounded border border-black/25 bg-white/50 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#b11d2a]">Official</div>
          </div>
        </div>
      </div>

      <div className="relative h-[330px] w-[520px] overflow-hidden rounded-[18px] border border-black/25 bg-[#edf1ec] p-5 text-black shadow-xl">
        <div className="absolute inset-x-0 top-0 h-7 bg-[#0f5c40]" />
        <div className="relative z-10 mt-7 grid h-[250px] grid-cols-[1fr_140px] gap-5">
          <div className="space-y-3 text-[12px]">
            <h3 className="text-[16px] font-black uppercase tracking-normal text-[#172554]">Conditions of issue</h3>
            <p>This card remains the property of the Government of Zimbabwe and must be surrendered on lawful request.</p>
            <p>If found, return to the nearest Registrar General's Office or police station.</p>
            <div className="mt-4 border-t border-black/30 pt-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-black/55">Holder Signature</p>
              <p className="mt-2 font-serif text-xl italic">{app.applicant.firstName[0]}. {app.applicant.lastName}</p>
            </div>
          </div>
          <div className="grid place-items-center rounded-lg border border-black/25 bg-white/70">
            <div className="grid h-24 w-24 grid-cols-5 grid-rows-5 gap-1">
              {Array.from({ length: 25 }).map((_, i) => (
                <span key={i} className={i % 2 === 0 || i % 7 === 0 ? "bg-black" : "bg-black/15"} />
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between border-t border-black/25 pt-2 text-[10px] uppercase tracking-[0.14em] text-black/60">
          <span>Registrar General Zimbabwe</span>
          <span>{app.applicationNumber}</span>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-black/50">{label}</p>
      <p className={strong ? "break-words font-mono text-[13px] font-black tracking-normal text-black" : "break-words font-bold tracking-normal text-black"}>{value}</p>
    </div>
  );
}