import { Node } from "types/Parser";
import { Evaluator } from '../evaluator';
import { FUNCTIONS } from '../../index';
import { FunctionDeclaration, Method } from "types/Functions";

/**
 * @name FunctionStructure
 * @description Structure for function manipulation
 */
export class FunctionStructure {

    /**
     * @name callFunction
     * @description Call function
     * @param {string} name Function name 
     * @param {Node[]} args Function arguments 
     * @returns {*} Function output
     * @static
     */
    public static callFunction(name: string, args: Node[]): unknown {

        const fun = FunctionStructure.getFunction(name); // Getting the function
        const isProcessFunction = typeof fun.run !== 'function'; // Check if the function is a process function

        return (!isProcessFunction ? (fun as any).run(args.map((arg: Node) => arg.value)) : new Evaluator(fun.run as Node[]));
    }

    /**
     * @name getFunction
     * @description Get function
     * @param {string} name Function name 
     * @returns {Method | FunctionDeclaration} Function
     * @static
     */
    public static getFunction(name: string): Method | FunctionDeclaration { return FUNCTIONS.getFunction(name); }

}