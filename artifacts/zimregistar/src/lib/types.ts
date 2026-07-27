export type AppStatus = "Pending" | "Approved" | "Rejected";
export type PrintStatus = "Not Printed" | "Printed";

export interface District { _id: string; name: string; }
export interface Province { _id: string; name: string; districts: District[]; }
export interface Location { address: string; province: string; district: string; town: string; }
export interface Station { _id: string; stationId: string; location: Location; stationName: string; numberOfStaff: number; }

export interface BaseApplication {
  _id: string; id: string; applicationNumber: string; applicantName: string;
  dateSubmitted: string; status: AppStatus; stationId: string;
  rejectionReason?: string; rejectedBy?: string; rejectedAt?: string;
  approvedAt?: string; approvedBy?: string; printStatus?: PrintStatus; printedAt?: string;
}

export interface Parent { firstName: string; lastName: string; nationalId: string; }

export interface BirthCertificateApp extends BaseApplication {
  type: "Birth Certificate";
  child: { firstName: string; lastName: string; dateOfBirth: string; gender: string; address: string; hospital: string; cityOfBirth: string; };
  mother: Parent;
  father: Parent;
  documents: { birthCertificate: string; };
}

export interface NationalIdApp extends BaseApplication {
  type: "National ID";
  applicant: { firstName: string; lastName: string; dateOfBirth: string; gender: string; nationality: string; address: string; contactNumber: string; };
  documents: { birthCertificate: string; photo?: string; };
}

export interface RecoveryApp extends BaseApplication {
  type: "Document Recovery";
  documentType: "Birth Certificate" | "National ID";
  reason: string;
  policeReport: { reportNumber: string; station: string; date: string; };
  applicant: { firstName: string; lastName: string; nationalId?: string; address: string; contactNumber: string; };
  documents?: { birthCertificate?: string; };
}

export type AnyApp = BirthCertificateApp | NationalIdApp | RecoveryApp;
