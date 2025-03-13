import { STORAGE } from '../../index';
import { Node } from 'types/Parser';
import { StorageVariableCell } from 'types/Storage';

/**
 * @class VariableStructure
 * @description Structure for variable manipulation
 */
export class VariableStructure {

    /**
     * @description Constructor
     * @param {String} name Variable name
     * @throws {Error} Variable does not exist
     */
    constructor(private name: string) {
        
        if (!STORAGE.memory.get(this.name)) throw new Error(`Variable ${this.name} does not exist`);

    }

    /**
     * @name structure
     * @description Variable structure
     * @type {StorageVariableCell}
     */
    private structure: StorageVariableCell = {
        name: '',
        value: { type: 'undefined', value: '', children: [] }
    };

    /**
     * @name replaceVariables
     * @description Replace variables in string
     * @param {string} name Variable name
     * @returns {Node} structure
     * @static
     */
    public static getVariable(name: string): Node { return STORAGE.getVariable(name); }

    /**
     * @name replaceVariables
     * @description Check if variable exists
     * @param {string} name Possible variable name 
     * @returns {boolean} Variable exists
     * @static
     */
    public static hasVariable(name: string): boolean { return STORAGE.memory.has(name); }

}