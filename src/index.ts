/**
 * IMPORTS
 */

/* DEV SETTER */
import flags from './modules/flags';
export const isDev = flags.dev;

import load from './modules/loader';
import { Token } from './types/Parser';


/**
 * INTERPRETER
 */

import Lexer from './interpreter/lexer';


export const code = load(flags.file);
isDev && console.log(`[DevMode]: Loaded initiation flags: \n ${JSON.stringify(flags)}\n`);

export const lexerOutput: Lexer = new Lexer(code);
isDev && console.log(`Loaded tokens by Lexer: \n ${JSON.stringify(lexerOutput.tokens, null, 1)}\n`);