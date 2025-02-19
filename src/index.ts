/**
 * IMPORTS
 */

/* DEV SETTER */
import flags from "modules/flags";
export const isDev = flags.dev;

import load from "modules/loader";




/**
 * CODE
 */
export const code = load(flags.file);
isDev && console.log(`[INERPRETER] :: Running in DEVELOPMENT mode :: \n [DevMode]: Loaded initiation flags: \n ${flags}`);