import {
  MutationFunction,
  MutationKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useMutationData = (
  mutationKey: MutationKey,
  mutationFn: MutationFunction<any, any>,
  queryKey?: string | any[] | (string | any[])[],
  onSuccess?: () => void
) => {
  const client = useQueryClient();
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationKey,
    mutationFn,
    onSuccess: (data: any) => {
      if (onSuccess) onSuccess();
      return toast(
        data?.status === 200 || data?.status === 201 ? "Success" : "Error",
        {
          description: data?.data || data?.message,
        }
      );
    },
    onSettled: async () => {
      if (queryKey) {
        if (Array.isArray(queryKey) && Array.isArray(queryKey[0])) {
          // If it's an array of keys (e.g. [ ['k1', 1], ['k2'] ])
          await Promise.all(
            (queryKey as any[]).map((key) => client.invalidateQueries({ queryKey: key }))
          );
        } else {
          // Single key (string or array)
          await client.invalidateQueries({
            queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
          });
        }
      }
      router.refresh();
    },
  });

  return { mutate, isPending };
};

