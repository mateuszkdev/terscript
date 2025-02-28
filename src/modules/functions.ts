import { readdirSync } from 'fs';
import { Fun, Method, FunctionDeclaration } from '../types/Functions';

/**
 * @name Functions
 * @description The Functions class is responsible for loading the functions.
 */
export class Functions {

    /* VARIABLES */
    private functions: Map<string, Fun> = new Map();
    private processFunctions: Map<string, FunctionDeclaration> = new Map();

    /**
     * @description The Functions class is responsible for loading the functions.
     */
    constructor() {
        this.loadFunctions();
    }

    /**
     * @name loadFunctions
     * @description The loadFunctions method is responsible for loading the functions.
     * @returns {void}
     */
    private loadFunctions(): void {

        readdirSync(`${__dirname}/../interpreter/functions`)
            .filter(file => file.endsWith('.js'))
            .forEach(file => {

                const called: Fun = require(`${__dirname}/../interpreter/functions/${file}`).default;
                if (!called.methods) throw new Error(`Function ${called.name} does not have any methods.`);

                called.methods.forEach(method => this.functions.set(method.name, called));

            });

    }

    /**
     * @name setFunction
     * @description The setFunction method is responsible for setting a function.
     * @param {string} name 
     * @param {Method} value 
     * @returns {void}
     */
    public setFunction(name: string, value: FunctionDeclaration): void {
        this.processFunctions.set(name, value)
    }

    /**
     * @name isFunction
     * @description The isFunction method is responsible for checking if a function exists.
     * @param {string} name The name of the function. 
     * @returns {boolean} If the function exists.
     */
    public isFunction(name: string): boolean {
        return this.functions.has(name);
    }

    /**
     * @name getFunction
     * @description The getFunction method is responsible for getting a function.
     * @param {string} name The name of the function.
     * @returns {Fun} The function.
     */
    public getFunction(name: string): Method | FunctionDeclaration {

        if (!this.functions.has(name) && !this.processFunctions.has(name)) throw new Error(`Function ${name} does not exist.`);

        if (this.functions.has(name)) return this.functions.get(name)!.methods.find(method => method.name === name) as Method;
        else return this.processFunctions.get(name) as FunctionDeclaration;

    }

}