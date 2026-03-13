import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Donation, FoodBridgeUser } from "../backend.d";
import type { Variant_ngo_donor } from "../backend.d";
import { useActor } from "./useActor";

export function useGetProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<FoodBridgeUser | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetMyDonations() {
  const { actor, isFetching } = useActor();
  return useQuery<Donation[]>({
    queryKey: ["myDonations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyDonations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAvailableDonations() {
  const { actor, isFetching } = useActor();
  return useQuery<Donation[]>({
    queryKey: ["availableDonations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableDonations();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetAllDonations() {
  const { actor, isFetching } = useActor();
  return useQuery<Donation[]>({
    queryKey: ["allDonations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDonations();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      role: Variant_ngo_donor;
      name: string;
      organizationName: string;
      address: string;
      lat: number;
      lng: number;
      contact: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveProfile(
        data.role,
        data.name,
        data.organizationName,
        data.address,
        data.lat,
        data.lng,
        data.contact,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useSubmitDonation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      foodType: string;
      quantity: string;
      expiryDescription: string;
      address: string;
      lat: number;
      lng: number;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitDonation(
        data.foodType,
        data.quantity,
        data.expiryDescription,
        data.address,
        data.lat,
        data.lng,
        data.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myDonations"] });
    },
  });
}

export function useAcceptDonation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.acceptDonation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableDonations"] });
      queryClient.invalidateQueries({ queryKey: ["allDonations"] });
    },
  });
}

export function useMarkPickedUp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markPickedUp(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myDonations"] });
    },
  });
}
