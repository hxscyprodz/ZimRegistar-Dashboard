import type { BirthCertificateApp, NationalIdApp, RecoveryApp } from "./types";

const PLACEHOLDER_DOC = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=70";
const PLACEHOLDER_ID = "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=70";
const PLACEHOLDER_PHOTO = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=70";

const firstNames = ["Tatenda", "Chipo", "Tendai", "Rumbidzai", "Tinashe", "Nyasha", "Farai", "Kudzai", "Tafadzwa", "Rutendo", "Munashe", "Anesu"];
const lastNames = ["Moyo", "Ncube", "Sibanda", "Chikore", "Mhandu", "Mutasa", "Dube", "Mlambo", "Gumbo", "Chigumba", "Madziva", "Nyathi"];
const cities = ["Harare", "Bulawayo", "Mutare", "Gweru", "Kwekwe", "Masvingo", "Chinhoyi", "Marondera", "Chitungwiza"];
const hospitals = ["Parirenyatwa Hospital", "Mpilo Central Hospital", "Sally Mugabe Central", "Chitungwiza Central", "United Bulawayo Hospitals"];
const stations = ["Harare Central", "Bulawayo Central", "Mutare Central", "Gweru Central", "Avondale Police", "Hatfield Police"];

const pick = <T,>(a: T[], i: number) => a[i % a.length];
const pad = (n: number, l = 6) => n.toString().padStart(l, "0");
const isoDaysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

const statusCycle = ["Pending", "Pending", "Approved", "Pending", "Rejected", "Approved", "Pending", "Approved"] as const;

export const seedBirth: BirthCertificateApp[] = Array.from({ length: 14 }, (_, i) => {
  const child = pick(firstNames, i);
  const surname = pick(lastNames, i + 2);
  const status = statusCycle[i % statusCycle.length];
  return {
    id: `bc-${i + 1}`,
    applicationNumber: `BC-2026-${pad(1001 + i)}`,
    applicantName: `${child} ${surname}`,
    dateSubmitted: isoDaysAgo(i * 2 + 1),
    status,
    approvedAt: status === "Approved" ? isoDaysAgo(i) : undefined,
    approvedBy: status === "Approved" ? "T. Moyo" : undefined,
    rejectionReason: status === "Rejected" ? "Hospital record unclear — please resubmit." : undefined,
    rejectedAt: status === "Rejected" ? isoDaysAgo(i) : undefined,
    rejectedBy: status === "Rejected" ? "T. Moyo" : undefined,
    printStatus: status === "Approved" ? (i % 3 === 0 ? "Printed" : "Not Printed") : undefined,
    type: "Birth Certificate",
    child: {
      firstName: child,
      lastName: surname,
      dateOfBirth: isoDaysAgo(i * 30 + 60).slice(0, 10),
      gender: i % 2 === 0 ? "Female" : "Male",
      address: `${100 + i} Samora Machel Ave, ${pick(cities, i)}`,
      hospital: pick(hospitals, i),
      cityOfBirth: pick(cities, i),
    },
    mother: {
      firstName: pick(firstNames, i + 3),
      lastName: surname,
      nationalId: `63-${pad(1000000 + i * 137, 7)} A ${10 + (i % 80)}`,
    },
    father: {
      firstName: pick(firstNames, i + 5),
      lastName: surname,
      nationalId: `63-${pad(2000000 + i * 211, 7)} B ${10 + (i % 80)}`,
    },
    documents: {
      hospitalRecord: PLACEHOLDER_DOC,
      motherId: PLACEHOLDER_ID,
      fatherId: PLACEHOLDER_ID,
    },
  };
});

export const seedNationalId: NationalIdApp[] = Array.from({ length: 12 }, (_, i) => {
  const fn = pick(firstNames, i + 1);
  const ln = pick(lastNames, i + 4);
  const status = statusCycle[(i + 1) % statusCycle.length];
  return {
    id: `nid-${i + 1}`,
    applicationNumber: `NID-2026-${pad(2001 + i)}`,
    applicantName: `${fn} ${ln}`,
    dateSubmitted: isoDaysAgo(i * 2 + 2),
    status,
    approvedAt: status === "Approved" ? isoDaysAgo(i) : undefined,
    approvedBy: status === "Approved" ? "T. Moyo" : undefined,
    rejectionReason: status === "Rejected" ? "Photo does not meet biometric standard." : undefined,
    printStatus: status === "Approved" ? (i % 2 === 0 ? "Printed" : "Not Printed") : undefined,
    type: "National ID",
    applicant: {
      firstName: fn,
      lastName: ln,
      dateOfBirth: `${1985 + (i % 20)}-${pad((i % 12) + 1, 2)}-${pad((i % 27) + 1, 2)}`,
      gender: i % 2 === 0 ? "Male" : "Female",
      nationality: "Zimbabwean",
      address: `${10 + i} Nelson Mandela Ave, ${pick(cities, i)}`,
      contactNumber: `+263 77 ${pad(1000000 + i * 313, 7)}`,
    },
    documents: {
      birthCertificate: PLACEHOLDER_DOC,
      proofOfResidence: PLACEHOLDER_DOC,
      photo: PLACEHOLDER_PHOTO,
    },
  };
});

export const seedRecovery: RecoveryApp[] = Array.from({ length: 8 }, (_, i) => {
  const fn = pick(firstNames, i + 6);
  const ln = pick(lastNames, i + 1);
  const status = statusCycle[(i + 2) % statusCycle.length];
  const docType: "Birth Certificate" | "National ID" = i % 2 === 0 ? "Birth Certificate" : "National ID";
  return {
    id: `rec-${i + 1}`,
    applicationNumber: `REC-2026-${pad(3001 + i)}`,
    applicantName: `${fn} ${ln}`,
    dateSubmitted: isoDaysAgo(i * 3 + 1),
    status,
    approvedAt: status === "Approved" ? isoDaysAgo(i) : undefined,
    rejectionReason: status === "Rejected" ? "Police report number could not be verified." : undefined,
    printStatus: status === "Approved" ? "Not Printed" : undefined,
    type: "Document Recovery",
    documentType: docType,
    reason: i % 3 === 0 ? "Lost during relocation" : i % 3 === 1 ? "Stolen from residence" : "Damaged by flooding",
    policeReport: {
      reportNumber: `RRB ${pad(500000 + i * 91, 6)}`,
      station: pick(stations, i),
      date: isoDaysAgo(i * 3 + 5).slice(0, 10),
    },
    applicant: {
      firstName: fn,
      lastName: ln,
      nationalId: docType === "National ID" ? `63-${pad(3000000 + i * 173, 7)} C ${10 + i}` : undefined,
      address: `${50 + i} Leopold Takawira St, ${pick(cities, i)}`,
      contactNumber: `+263 71 ${pad(2000000 + i * 419, 7)}`,
    },
    documents: {
      policeReport: PLACEHOLDER_DOC,
      affidavit: PLACEHOLDER_DOC,
      photoId: PLACEHOLDER_ID,
    },
  };
});