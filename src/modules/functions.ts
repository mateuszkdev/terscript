import { readdirSync } from 'fs';
import { Fun } from '../types/Functions';

/**
 * @name Functions
 * @description The Functions class is responsible for loading the functions.
 */
export class Functions {

    /* VARIABLES */
    private functions: Map<string, Fun> = new Map();

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
                this.functions.set(called.name, called);

            });

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
    public getFunction(name: string): Fun {
        if (!this.isFunction) throw new Error(`Function ${name} does not exist.`);
        return this.functions.get(name) as Fun;
    }

}