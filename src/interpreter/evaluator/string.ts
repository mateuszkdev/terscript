import { VariableStructure } from './variables';
import { Node } from 'types/Parser';

/**
 * @class String
 * @description Structure for string manipulation
 */
export class StringStructure {


    /**
     * @name replaceVariables
     * @description Replace variables in string
     * @returns {Node} structure
     * @static
     */
    public static replaceVariables(string: string): Node {

        const elements = /\s/g.test(string) ? string.split(/\s+/) : [string];
        elements.forEach((element: string) => {
            if (new RegExp('@').test(element)) {

                const variableName = element.replace('@', '');
                const variable = VariableStructure.getVariable(variableName);
                string = string.replace(`@${variableName}`, variable.value);

            }
        });

        return { type: 'string', value: string, children: [] };

    }

    /**
     * @name checkStringVariables
     * @description Check if string has variables
     * @param {string} string String to check 
     * @returns {boolean} String has variables
     * @static
     */
    public static checkStringVariables(string: string): boolean {
        return !!new RegExp('@').test(string);
    }

}