import type { App, AppContext } from "vue";
import type { Printer } from "@/models/printers/printer.model";
import { useUploadsStore } from "@/stores/uploads";
import { convertMultiPrinterFileToQueue } from "@/utils/uploads-state.utils";
import { infoMessageEvent } from "@/event-bus/alert.events";
import { usePrintersStore } from "@/stores/printers";

const bindDropConditionally = (
  el: HTMLElement,
  printers: Printer[],
  context?: AppContext | null
) => {
  const store = useUploadsStore();
  const printersStore = usePrintersStore();
  if (printers?.length) {
    el.ondrop = async (e) => {
      e.preventDefault();
      el.style.border = defaultBorder;

      if (!e.dataTransfer?.files.length) return;

      const filesArray = e.dataTransfer?.files;
      const files = [...filesArray];
      const file = files[0];

      const uploads = convertMultiPrinterFileToQueue(printers, file);
      store.queueUploads(uploads);

      printersStore.resetSelectedPrinters();
    };
  } else {
    el.ondrop = async (e) => {
      e.preventDefault();
      el.style.border = defaultBorder;
      // TODO BUS
      // context?.$bus.emit(
      //   infoMessageEvent,
      //   "Please select a printer to upload to first."
      // );
    };
  }
};

const defaultBorder = "1px solid #2b2a27";
const defaultTransition = "background-color 0.5s ease";
const hoverBorder = "1px solid red";

export function registerFileDropDirective(app: App) {
  app.directive("drop-upload", {
    // When the bound element is inserted into the DOM...
    mounted: (el, binding, vnode) => {
      el.style.border = defaultBorder;
      el.style.transition = defaultTransition;

      el.ondragenter = () => {
        el.style.border = hoverBorder;
      };
      el.ondragover = (ev: Event) => {
        el.style.border = hoverBorder;
        ev.preventDefault();
      };
      el.ondragleave = () => {
        el.style.border = defaultBorder;
      };

      // The bound printer is not set
      bindDropConditionally(el, binding.value?.printers, vnode.appContext);
    },
    beforeUpdate: (el, binding, vnode) => {
      bindDropConditionally(el, binding.value?.printers, vnode.appContext);
    },
  });
}
