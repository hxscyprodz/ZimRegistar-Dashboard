export type AppStatus = "Pending" | "Approved" | "Rejected";
export type PrintStatus = "Not Printed" | "Printed";

export interface District {
  _id: string;
  name: string;
}

export interface Province {
  _id: string;
  name: string;
  districts: District[];
}

export interface Location {
  address: string;
  province: string;
  district: string;
  town: string;
}
export interface Station {
  _id: string;
  stationId: string;
  location: Location;
  stationName: string;
  numberOfStaff: number;
}

export interface BaseApplication {
  _id: string;
  applicationId: string;
  applicantName: string;
  applicationDate: string;
  status: AppStatus;
  stationId: string;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  approvedDate?: string;
  approvedBy?: string;
  printStatus?: PrintStatus;
  printedAt?: string;
}

export interface Parent {
  firstName: string;
  surname: string;
  nationalIdNumber: string;
}

export interface BirthCertificateApp extends BaseApplication {
  id: string;
  applicationType: "Birth Certificate";
  firstName: string;
  surname: string;
  dateOfBirth: string;
  sex: string;
  hospitalOfBirth: string;
  address: string;
  placeOfBirth: string;
  father: Parent;
  mother: Parent;
  documents: {
    fatherNationalId: string;
    motherNationalId: string;
    hospitalRecord: string;
  };
}

export interface BirthCertificateResponse {
  success: boolean;
  data: BirthCertificateApp[];
}

export interface BirthDetails {
  firstName: string;
  surname: string;
  dateOfBirth: string;
  sex: string;
}
export interface NationalIdApp extends BaseApplication {
  _id: string;
  applicationType: "National ID";
  nationalIdNumber: string;
  contactNumber: string;
  birthDetails: BirthDetails;
  documents: {
    birthCertificate: string;
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
  documents?: {
    birthCertificate?: string;
  };
}

export type AnyApp = BirthCertificateApp | NationalIdApp | RecoveryApp;
