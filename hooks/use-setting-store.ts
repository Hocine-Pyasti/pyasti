/* eslint-disable no-unused-vars */

import { ClientSetting, SiteCurrency } from "@/types";
import { create } from "zustand";
import { getSetting } from "@/lib/actions/setting.actions";

interface SettingState {
  setting: ClientSetting | null;
  setSetting: (newSetting: ClientSetting) => void;
  getCurrency: () => SiteCurrency;
  setCurrency: (currency: string) => void;
  initialize: () => Promise<void>;
}

const useSettingStore = create<SettingState>((set, get) => ({
  setting: null,
  setSetting: (newSetting: ClientSetting) => {
    set({
      setting: {
        ...newSetting,
        currency: newSetting.currency || get().setting?.currency || "DZD",
      },
    });
  },
  getCurrency: () => {
    const setting = get().setting;
    if (!setting) {
      return {
        code: "DZD",
        name: "Algerian Dinar",
        convertRate: 1,
        symbol: "DA",
      };
    }
    return (
      setting.availableCurrencies.find((c) => c.code === setting.currency) ||
      setting.availableCurrencies.find(
        (c) => c.code === setting.defaultCurrency
      ) || { code: "DZD", name: "Algerian Dinar", convertRate: 1, symbol: "DA" }
    );
  },
  setCurrency: async (currency: string) => {
    set({ setting: { ...get().setting!, currency } });
  },
  initialize: async () => {
    const setting = await getSetting();
    const clientSetting: ClientSetting = {
      ...setting,
      currency: (setting as ClientSetting).currency || "DZD",
    };
    set({ setting: clientSetting });
  },
}));

export default useSettingStore;
