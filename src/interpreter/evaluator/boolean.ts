import { Node } from "types/Parser";

/**
 * @name BooleanStructure
 * @description Structure for boolean manipulation
 */
export class BooleanStructure {

    public static evalBoolean(condition: Node): Node {

        if (condition.type === 'boolean') condition.value = eval(condition.value);
        else if (condition.type === 'string' && condition.value.length >= 1) condition.value = eval('true'); 
        else if (condition.type === 'number') {
            if (parseFloat(condition.value) > 0) condition.value = eval('true');
            else condition.value = eval('false');
        }
        else throw new Error("Invalid 'if' condition");

        return { type: 'boolean', value: condition.value, children: [] };

    }

}