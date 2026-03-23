import { useEffect, useState } from "react";
import { useQueryData } from "./useQueryData";
import { searchUsers } from "@/actions/user";

export const useSearch = (key: string, type: "USERS") => {
  const [query, setQuery] = useState("");
  const [debounce, setDebounce] = useState("");

  const [onUsers, setOnUsers] = useState<
    | {
        id: string;
        subscription: { plan: "FREE" | "PRO" | "TEAM" | "STANDARD" | "ENTERPRISE" } | null;
        firstName: string | null;
        lastName: string | null;
        image: string | null;
        email: string | null;
      }[]
    | undefined
  >(undefined);

  const onSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      setDebounce(query);
    }, 1000);

    return () => clearTimeout(delayInputTimeoutId);
  }, [query]);

  const { refetch, isFetching } = useQueryData(
    [key, debounce],
    async ({ queryKey }) => {
      if (type === "USERS") {
        const users = await searchUsers(queryKey[1] as string);
        if (users.status === 200) {
          setOnUsers(users.data);
        }
      }
      return { status: 200 };
    },
    false
  );

  useEffect(() => {
    if (debounce) {
      refetch();
    }
    if (!debounce) {
      setOnUsers(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounce]);

  return { onSearchQuery, query, isFetching, onUsers };
};
