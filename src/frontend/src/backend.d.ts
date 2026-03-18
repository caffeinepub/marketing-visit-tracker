import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Client {
    name: string;
    notes: string;
    contactNumber: string;
    location: string;
}
export interface Visit {
    id: bigint;
    latitude: number;
    clientName: string;
    user: Principal;
    visitDate: Time;
    longitude: number;
    notes: string;
    contactNumber: string;
    locationName: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addClient(client: Client): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createVisit(clientName: string, contactNumber: string, locationName: string, latitude: number, longitude: number, visitDate: Time, notes: string): Promise<void>;
    getAllVisits(): Promise<Array<Visit>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClients(): Promise<Array<Client>>;
    getMyVisits(): Promise<Array<Visit>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVisitsByUser(user: Principal): Promise<Array<Visit>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
