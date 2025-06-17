import { api, type RouterOutputs } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { atom, useAtom } from "jotai";
import { searchValueAtom } from "@/components/SearchBar";

const useEvents = () => {
  const { data: account, isLoading: isLoadingAccount } =
    api.mail.getAccount.useQuery();
  const [accountId] = useLocalStorage("accountId", "");
  const [searchValue] = useAtom(searchValueAtom);

  const {
    data: events,
    isFetching,
    refetch,
  } = api.calendar.getEvents.useQuery(
    {
      accountId,
      searchValue,
    },
    {
      enabled: !!accountId,
      // placeholderData: (e) => e,
      refetchInterval: 1000 * 60 * 1,
    },
  );

  return {
    events,
    isFetching,
    refetch,
    account,
    accountId,
    isLoadingAccount,
  };
};

export default useEvents;
