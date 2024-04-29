import { BloodGroup, Gender, MartialStatus } from "@prisma/client";

export type TPatientFilterRequest = {
    searchTerm?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;
    contactNumber?: string | undefined;
};

type TPatientHealthData = {
    gender: Gender;
    dateOfBirth: string;
    bloodGroup: BloodGroup;
    hasAllergies?: boolean;
    hasDiabetes?: boolean;
    height: number;
    weight: number;
    smokingStatus?: boolean;
    dietaryPreferences?: string;
    pregnancyStatus?: boolean;
    mentalHealthHistory?: string;
    immunizationStatus?: string;
    hasPastSurgeries?: boolean;
    recentAnxiety?: boolean;
    recentDepression?: boolean;
    maritalStatus?: MartialStatus;
};

type TMedicalReport = {
    reportName: string;
    reportLink: string;
};

export type TPatientUpdate = {
    name: string;
    contactNumber: string;
    address: string;
    patientHealthData: TPatientHealthData;
    medicalReport: TMedicalReport;
};
