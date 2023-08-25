import type { EventBusKey } from "@vueuse/core";
import { useEventBus } from "@vueuse/core";

export const progressMessageKey: EventBusKey<{ name: "progress-message" }> = Symbol(
  "Progress snackbar message event symbol"
);
export const infoMessageKey: EventBusKey<{ name: "info-message" }> = Symbol(
  "Info snackbar message event symbol"
);
export const errorMessageKey: EventBusKey<{ name: "error-message" }> = Symbol(
  "Error snackbar message event symbol"
);

export interface InfoMessage {
  title: string;
  subtitle?: string | null;
  warning?: boolean;
}

export interface ErrorMessage {
  title: string;
  subtitle?: string | null;
  fullSubtitle?: string | null;
  timeout?: number;
  // The idea is that the error can be revisited on a separate page/dialog
  // url?: string;
}

export interface ProgressMessage {
  key: string;
  title: string;
  value: number;
  completed: boolean;
}

export function useSnackbar() {
  const { emit: emitProgessMessage, on: onProgressMessage } =
    useEventBus<ProgressMessage>(progressMessageKey);
  const { emit: emitInfoMessage, on: onInfoMessage } = useEventBus<InfoMessage>(infoMessageKey);
  const { emit: emitErrorMessage, on: onErrorMessage } = useEventBus<ErrorMessage>(errorMessageKey);

  return {
    openProgressMessage: (key: string, title: string, value: number, completed: boolean) =>
      emitProgessMessage({
        key,
        title,
        value,
        completed,
      } as ProgressMessage),
    openInfoMessage: (data: InfoMessage) => emitInfoMessage(data),
    openErrorMessage: (errorData: ErrorMessage) => emitErrorMessage(errorData),
    onProgressMessage,
    onInfoMessage,
    onErrorMessage,
  };
}
