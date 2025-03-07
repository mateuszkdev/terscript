import { Node } from 'types/Parser';
import { StorageType, StorageVariableCell } from '../types/Storage';

/**
 * @name Storage
 * @description The Storage class is responsible for storing variables.
 */
export class Storage {

    /* VARIABLES */
    public memory: StorageType = new Map();
    private id: number = 0;

    /**
     * @name setVariable
     * @description The setVariable method is responsible for setting a variable.
     * @param {StorageVariableCell} variable The variable to be set.
     * @setter
     */
    public set setVariable(variable: StorageVariableCell) {

        // if (this.memory.has(variable.name)) throw new Error(`Variable ${variable.name} already exists.`);
        if (this.memory.has(variable.name)) this.memory.delete(variable.name);

        // @TODO Add a check for the type of the variable
        this.memory.set(variable.name, { name: `id-${this.id++}-memoryVariable`, value: variable.value });

    }

    /**
     * @name getVariable
     * @description The getVariable method is responsible for getting a variable.
     * @param {string} name The name of the variable.
     * @returns {StorageVariableCell} The variable.
     */
    public getVariable(name: string): Node {

        if (!this.memory.has(name)) throw new Error(`Variable ${name} does not exist.`);
        return this.memory.get(name)?.value as Node;

    }

    /**
     * @name removeVariable
     * @description The removeVariable method is responsible for removing a variable.
     * @param {string} name The name of the variable.
     */
    public removeVariable(name: string): void {
        
        if (!this.memory.has(name)) throw new Error(`Variable ${name} does not exist.`);
        this.memory.delete(name);
        
    }

}