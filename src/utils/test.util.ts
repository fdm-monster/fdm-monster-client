import { useSnackbar } from "../shared/snackbar.composable";

export function uploadProgressTest(enabled: boolean) {
  if (!enabled) return;

  const snackbar = useSnackbar();
  // Nice visual test for uploads
  let i = 0;
  let j = 0;
  let interval: any;
  // eslint-disable-next-line prefer-const
  interval = setInterval(() => {
    i += 2;
    j += 3;
    snackbar.openProgressMessage("1", "file.gcode to YoParinter", i, i > 55);
    if (j > 10 && j < 80) {
      snackbar.openProgressMessage("2", "file2.gcode to Beast", i, i > 80);
    }
    snackbar.openProgressMessage("3", "file3.gcode to Beast", i, i > 80);
    snackbar.openProgressMessage("4", "file4.gcode to Beast", i, i > 80);
    if (j > 20) snackbar.openProgressMessage("5", "file5.gcode to Beast", i, i > 60);
    snackbar.openProgressMessage("6", "file6.gcode to Beast", i, i > 65);
    snackbar.openProgressMessage("7", "file7.gcode to Beast", i, i > 80);

    if (i >= 110 && j > 115) {
      clearInterval(interval);
    }
  }, 200);
}
