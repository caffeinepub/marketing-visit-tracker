import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Client, UserProfile, Visit } from "../backend.d";
import { dateToVisitDate } from "../utils/distance";
import { useActor } from "./useActor";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
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

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyVisits() {
  const { actor, isFetching } = useActor();
  return useQuery<Visit[]>({
    queryKey: ["myVisits"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyVisits();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllVisits() {
  const { actor, isFetching } = useActor();
  return useQuery<Visit[]>({
    queryKey: ["allVisits"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVisits();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetClients() {
  const { actor, isFetching } = useActor();
  return useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getClients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVisitsByUser(user: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Visit[]>({
    queryKey: ["visitsByUser", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getVisitsByUser(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useCreateVisit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      clientName: string;
      contactNumber: string;
      locationName: string;
      latitude: number;
      longitude: number;
      visitDate: Date;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.createVisit(
        data.clientName,
        data.contactNumber,
        data.locationName,
        data.latitude,
        data.longitude,
        dateToVisitDate(data.visitDate),
        data.notes,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myVisits"] });
      qc.invalidateQueries({ queryKey: ["allVisits"] });
    },
  });
}

export function useAddClient() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (client: Client) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addClient(client);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}
