import Vue from "vue";
import { PrinterDto } from "@/models/printers/printer.model";
import {
  convertMultiPrinterFileToQueue,
  convertPrinterMultiFileToQueue,
} from "@/utils/uploads-state.utils";
import { usePrinterStore } from "@/store/printer.store";
import { useUploadsStore } from "@/store/uploads.store";
import { useSnackbar } from "@/shared/snackbar.composable";

const bindDropConditionally = (el: HTMLElement, printers: PrinterDto[], context?: Vue) => {
  const printersStore = usePrinterStore();
  const uploadsStore = useUploadsStore();
  const snackbar = useSnackbar();

  if (printers?.length) {
    const isSinglePrinter = printers.length === 1;

    el.ondrop = async (e) => {
      e.preventDefault();
      el.style.border = defaultBorder;

      const filesArray = e.dataTransfer?.files;
      if (!filesArray?.length) return;

      const clonedFiles = [...Array.from(filesArray)];
      let convertedUploads = [];
      if (isSinglePrinter) {
        const firstPrinter = printers[0];
        if (clonedFiles.length > 1) {
          throw "Cannot upload multiple files to a printer";
        }
        // const printedFilename = clonedFiles.length === 1 ? clonedFiles[0].name : null;
        console.debug(
          "Single printer upload mode",
          printers.length,
          clonedFiles.length
          // printedFilename
        );

        // Convert the file and bound printer to a file upload
        convertedUploads = convertPrinterMultiFileToQueue(firstPrinter, clonedFiles, true);
      } else {
        if (clonedFiles.length > 1) {
          throw "Cannot upload multiple files to multiple printers";
        }
        console.debug("Multi printer upload mode", printers.length, clonedFiles.length);
        const clonedFile = clonedFiles[0];
        convertedUploads = convertMultiPrinterFileToQueue(printers, clonedFile, true);
      }

      uploadsStore.queueUploads(convertedUploads);

      printersStore.clearSelectedPrinters();
    };
  } else {
    el.ondrop = async (e) => {
      e.preventDefault();
      el.style.border = defaultBorder;
      snackbar.openInfoMessage({
        title: "No action performed",
        subtitle: "Please select one or more printers",
        warning: true,
      });
    };
  }
};

const defaultBorder = "1px solid transparent";
const defaultTransition = "border 0.25s ease";
const hoverBorder = "1px solid var(--v-primary-base)";

export function registerFileDropDirective() {
  Vue.directive("drop-upload", {
    // When the bound element is inserted into the DOM...
    inserted: (el, binding, vnode) => {
      el.style.border = defaultBorder;
      el.style.transition = defaultTransition;

      el.ondragenter = () => {
        el.style.border = hoverBorder;
      };
      el.ondragover = (ev) => {
        el.style.border = hoverBorder;
        ev.preventDefault();
      };
      el.ondragleave = () => {
        el.style.border = defaultBorder;
      };

      // The bound printer is not set
      bindDropConditionally(el, binding.value?.printers, vnode.context);
    },
    update: (el, binding, vnode) => {
      bindDropConditionally(el, binding.value?.printers, vnode.context);
    },
  });
}
