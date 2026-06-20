export type AppStatus = "Pending" | "Approved" | "Rejected";
export type PrintStatus = "Not Printed" | "Printed";

export interface BaseApplication {
  id: string;
  applicationNumber: string;
  applicantName: string;
  dateSubmitted: string;
  status: AppStatus;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  printStatus?: PrintStatus;
  printedAt?: string;
}

export interface BirthCertificateApp extends BaseApplication {
  type: "Birth Certificate";
  child: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: "Male" | "Female";
    address: string;
    hospital: string;
    cityOfBirth: string;
  };
  mother: { firstName: string; lastName: string; nationalId: string };
  father: { firstName: string; lastName: string; nationalId: string };
  documents: {
    hospitalRecord: string;
    motherId: string;
    fatherId: string;
  };
}

export interface NationalIdApp extends BaseApplication {
  type: "National ID";
  applicant: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: "Male" | "Female";
    nationality: string;
    address: string;
    contactNumber: string;
  };
  documents: {
    birthCertificate: string;
    proofOfResidence: string;
    photo: string;
  };
}

export interface RecoveryApp extends BaseApplication {
  type: "Document Recovery";
  documentType: "Birth Certificate" | "National ID";
  reason: string;
  policeReport: {
    reportNumber: string;
    station: string;
    date: string;
  };
  applicant: {
    firstName: string;
    lastName: string;
    nationalId?: string;
    address: string;
    contactNumber: string;
  };
  documents: {
    policeReport: string;
    affidavit: string;
    photoId?: string;
  };
}

export type AnyApp = BirthCertificateApp | NationalIdApp | RecoveryApp;