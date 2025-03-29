import { Node } from "types/Parser";
import { STORAGE } from '../../index';

/**
 * @name BooleanStructure
 * @description Structure for boolean manipulation
 */
export class BooleanStructure {

    /**
     * @name evalBoolean
     * @description Eval boolean
     * @param {Node} condition Node value of boolean to evaluate
     * @returns {Node} evaluated boolean, true or false
     */
    public static evalBoolean(condition: Node): Node {

        if (condition.type === 'boolean') condition.value = eval(condition.value);
        else if (condition.type === 'string' && condition.value.length >= 1) condition.value = eval('true'); 
        else if (condition.type === 'number') {
            if (parseFloat(condition.value) > 0) condition.value = eval('true');
            else condition.value = eval('false');
        }
        else if (condition.type === 'identifier' && STORAGE.getVariable(condition.value)) {
            return BooleanStructure.evalBoolean(STORAGE.getVariable(condition.value));
        }
        else throw new Error("Invalid condition");

        return { type: 'boolean', value: condition.value, children: [] };

    }

}