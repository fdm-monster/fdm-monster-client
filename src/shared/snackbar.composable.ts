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

export interface ProgressEvent {
  key: string;
  title: string;
  value: number;
  completed: boolean;
}

export function useSnackbar() {
  const { emit: emitProgessMessage, on: onProgressMessage } =
    useEventBus<string>(progressMessageKey);
  const { emit: emitInfoMessage, on: onInfoMessage } = useEventBus<string>(infoMessageKey);
  const { emit: emitErrorMessage, on: onErrorMessage } = useEventBus<string>(errorMessageKey);

  return {
    openProgressMessage: (key: string, title: string, value: number | string, completed: boolean) =>
      emitProgessMessage("progress-message", {
        key,
        title,
        value,
        completed,
      } as ProgressEvent),
    openInfoMessage: (text: string) => emitInfoMessage("open-info-message", text),
    openErrorMessage: (text: string) => emitErrorMessage("open-error-message", text),
    onProgressMessage,
    onInfoMessage,
    onErrorMessage,
  };
}
