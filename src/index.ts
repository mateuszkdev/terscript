/**
 * IMPORTS
 */
import flags from './modules/flags';
export const isDev = flags.dev; // dev setter

import { Storage } from './modules/storage';
import { Functions } from './modules/functions';

import load from './modules/loader';


/**
 * CONSTANTS
 */
export const STORAGE = new Storage();
export const FUNCTIONS = new Functions();

/**
 * INTERPRETER
 */
import { Lexer } from './interpreter/lexer';
import { Parser } from './interpreter/parser';

export const code = load(flags.file);
isDev && console.log(`[DevMode]: Loaded initiation flags: \n ${JSON.stringify(flags)}\n`);

export const lexerOutput: Lexer = new Lexer(code);
// isDev && console.log(`Loaded tokens by Lexer: \n ${JSON.stringify(lexerOutput.tokens, null, 1)}\n`);

export const parserOutput: Parser = new Parser(lexerOutput.tokens);
isDev && console.log(`Loaded tree by Parser: \n ${JSON.stringify(parserOutput.tree, null, 1)}\n`);