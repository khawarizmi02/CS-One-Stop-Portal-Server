import { atom, useAtom } from "jotai";

const configAtom = atom<string | null>(null);

export function useEvent() {
  return useAtom(configAtom);
}
