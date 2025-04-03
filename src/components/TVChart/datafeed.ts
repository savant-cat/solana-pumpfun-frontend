"use client";

import type {
  Bar,
  LibrarySymbolInfo,
  IBasicDataFeed,
  DatafeedConfiguration,
  ResolutionString,
  PeriodParams,
} from "@/libraries/charting_library";

import { subscribeOnStream, unsubscribeFromStream } from "@/components/TVChart/streaming";
import { getChartTable } from "@/utils/getChartTable";
import { custom } from "viem";
import { getBalance } from "viem/actions";
import { Mark } from "@/libraries/charting_library/datafeed-api";

const lastBarsCache = new Map<string, Bar>();
const minPrice: Number = 0;
const maxPrice: Number = 0;
// DatafeedConfiguration implementation
const configurationData: DatafeedConfiguration = {
  // Represents the resolutions for bars supported by your datafeed
  supported_resolutions: [
    "1",
    "5",
    "15",
    "45",
    "60",
    "240",
    "1440",
  ] as ResolutionString[],

};

export function getDataFeed({
  pairIndex,
  customPeriodParams,
  name,
  token
}: {
  name: string;
  pairIndex: number;
  customPeriodParams: PeriodParams;
  token: string
}): IBasicDataFeed {
  let initialLoadComplete = false;
  return {
    onReady: (callback) => {
      setTimeout(() => callback(configurationData));
    },

    searchSymbols: () => {
    },

    resolveSymbol: async (
      symbolName,
      onSymbolResolvedCallback,
      _onResolveErrorCallback,
      _extension,
    ) => {

      // Symbol information object
      const symbolInfo: LibrarySymbolInfo = {
        ticker: name,
        name: name,
        description: name,
        type: "crypto",
        session: "24x7",
        timezone: "Etc/UTC",
        minmov: 1,
        pricescale: 1000000000,
        exchange: "",
        has_intraday: true,
        visible_plots_set: 'ohlc',
        has_weekly_and_monthly: true,
        supported_resolutions: configurationData.supported_resolutions,
        volume_precision: 2,
        data_status: "streaming",
        format: "price",
        listed_exchange: "",
      };

      setTimeout(() => onSymbolResolvedCallback(symbolInfo));
    },

    getBars: async (
      symbolInfo,
      resolution,
      periodParams,
      onHistoryCallback,
      onErrorCallback
    ) => {
      // Use customPeriodParams if needed
      const { from, to, firstDataRequest, countBack } = periodParams
      try {
        const chartTable = await getChartTable({
          token,
          pairIndex,
          from,
          to,
          range: +resolution,
          countBack
        });

        if (!chartTable || !chartTable.table) {
          onHistoryCallback([], { noData: true });
          return;
        }

        let bars = chartTable.table.map(bar => ({
          ...bar,
          time: bar.time * 1000, // Convert from seconds to milliseconds
        }));

        if (firstDataRequest) {
          lastBarsCache.set(symbolInfo.name, { ...bars[bars.length - 1] });
        }

        onHistoryCallback(bars, { noData: false });

        if (!initialLoadComplete) {
          initialLoadComplete = true;
        }
        return;
      } catch (error) {
        onErrorCallback(error);
      }
    },

    subscribeBars: (
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
    ) => {
      // subscribeOnStream(
      //   symbolInfo,
      //   resolution,
      //   onRealtimeCallback,
      //   subscriberUID,
      //   onResetCacheNeededCallback,
      //   lastBarsCache.get(symbolInfo.name)!,
      //   pairIndex,
      // );
    },

    unsubscribeBars: (subscriberUID) => {
      // unsubscribeFromStream(subscriberUID);
    },
  };
}
