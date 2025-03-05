import { Fun } from 'types/Functions'
import { STORAGE } from '../../index';

export default {
    name: 'dev',
    description: 'Developer functions',

    methods: [
        {
            name: 'variables',
            description: 'Returns all variables',
            usage: 'variables()',
            run: () => {
                const variables: any[] = []
                STORAGE.memory.forEach((value, key) => {
                    variables.push({ name: key, value: value.value })
                })
                // @TODO: Return the variables as array // need to implement array system
                // return { type: 'string', value: `${JSON.stringify(variables.map(v => v.name))}`, children: [] };
                return { type: 'string', value: JSON.stringify(variables), children: [] };
            }
        }
    ]

} as Fun