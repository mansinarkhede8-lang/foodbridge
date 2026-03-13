import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Donation {
    id: bigint;
    lat: number;
    lng: number;
    acceptedByNgoId?: Principal;
    status: DonationStatus;
    donorId: Principal;
    createdAt: Time;
    expiryDescription: string;
    address: string;
    notes: string;
    quantity: string;
    acceptedByNgoName?: string;
    foodType: string;
}
export type Time = bigint;
export interface FoodBridgeUser {
    id: Principal;
    lat: number;
    lng: number;
    organizationName: string;
    contact: string;
    name: string;
    role: Variant_ngo_donor;
    address: string;
}
export enum DonationStatus {
    pending = "pending",
    pickedUp = "pickedUp",
    accepted = "accepted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_ngo_donor {
    ngo = "ngo",
    donor = "donor"
}
export interface backendInterface {
    acceptDonation(id: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllDonations(): Promise<Array<Donation>>;
    getAvailableDonations(): Promise<Array<Donation>>;
    getCallerUserProfile(): Promise<FoodBridgeUser | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDonationById(id: bigint): Promise<Donation | null>;
    getMyDonations(): Promise<Array<Donation>>;
    getProfile(): Promise<FoodBridgeUser | null>;
    getProfileById(id: Principal): Promise<FoodBridgeUser | null>;
    getUserProfile(user: Principal): Promise<FoodBridgeUser | null>;
    isCallerAdmin(): Promise<boolean>;
    markPickedUp(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: FoodBridgeUser): Promise<void>;
    saveProfile(role: Variant_ngo_donor, name: string, organizationName: string, address: string, lat: number, lng: number, contact: string): Promise<FoodBridgeUser>;
    submitDonation(foodType: string, quantity: string, expiryDescription: string, address: string, lat: number, lng: number, notes: string): Promise<bigint>;
}
