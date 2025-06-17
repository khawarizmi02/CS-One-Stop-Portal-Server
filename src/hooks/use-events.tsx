import { api, type RouterOutputs } from "@/trpc/react";
import { getQueryKey } from "@trpc/react-query";
import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { atom, useAtom } from "jotai";
import { searchValueAtom } from "@/components/SearchBar";

const useEvents = () => {
  const { data: account, isLoading: isLoadingAccount } =
    api.mail.getAccount.useQuery();
  const [accountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage("tab", "inbox");
  const [done] = useLocalStorage("threadDone", false);
  const [searchValue] = useAtom(searchValueAtom);

  const {
    data: threads,
    isFetching,
    refetch,
  } = api.mail.getThreads.useQuery(
    {
      accountId,
      done,
      tab,
    },
    {
      enabled: !!accountId && !!tab,
      // placeholderData: (e) => e,
      refetchInterval: 1000 * 60 * 1,
    },
  );

  return {
    threads,
    isFetching,
    refetch,
    account,
    accountId,
    isLoadingAccount,
  };
};

export default useEvents;
