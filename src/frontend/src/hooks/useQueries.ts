import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CustomerOffer,
  FounderOffer,
  Order,
  OrderStatus,
  Product,
  UserProfile,
} from "../backend";
import { ProductCategory } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useAppSettings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["app-settings"],
    queryFn: async () => {
      if (!actor) return { appName: "Shopping Deal" };
      try {
        return await actor.getAppSettings();
      } catch {
        return { appName: "Shopping Deal" };
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllProducts(category?: ProductCategory) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products", category ?? "all"],
    queryFn: async () => {
      if (!actor) return [];
      if (category) {
        return actor.getProductsByCategory(category);
      }
      const categories = Object.values(ProductCategory);
      const results = await Promise.all(
        categories.map((cat) => actor.getProductsByCategory(cat)),
      );
      return results.flat();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProduct(productId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!actor || !productId) return null;
      return actor.getProduct(productId);
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

export function useAllOffers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["all-offers"],
    queryFn: async () => {
      if (!actor) return { founderOffers: [], customerOffers: [] };
      return actor.getAllOffers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["all-orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["caller-profile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Not connected");
      await actor.createProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCreateFounderOffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (offer: FounderOffer) => {
      if (!actor) throw new Error("Not connected");
      await actor.createFounderOffer(offer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-offers"] });
    },
  });
}

export function useCreateCustomerOffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (offer: CustomerOffer) => {
      if (!actor) throw new Error("Not connected");
      await actor.createCustomerOffer(offer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-offers"] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: Order) => {
      if (!actor) throw new Error("Not connected");
      await actor.placeOrder(order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: string; status: OrderStatus }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-orders"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caller-profile"] });
    },
  });
}

export function useUpdateAppName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appName: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateAppName(appName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-settings"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
