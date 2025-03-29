import { Node } from 'types/Parser'
import { STORAGE } from '../../index'

/**
 * @name ObjectStructure is a class that represents the structure of an object.
 * @description It is used to manipulate objects in the interpreter.
 */
export class ObjectStructure {

    
    /**
     * @name objectCall
     * @description Call an object by key and get value
     * @param {Node} node The node to call 
     * @returns {Node} The object value
     */
    public static objectCall(node: Node): Node {

        if (!STORAGE.memory.has(node.children![0].value)) throw new Error(`Object ${node.children![0].value} does not exist`);
        const object = JSON.parse(JSON.stringify(STORAGE.getVariable(node.children![0].value).children))[0];

        const key = node.children![1].value;

        if (!object[key]) throw new Error(`Object ${node.children![0].value} does not have key ${key}`);

        const value = object[key];

        return { type: value.type, value: value.value, children: value.children };

    }
}