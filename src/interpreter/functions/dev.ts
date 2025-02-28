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
                const variables: any = []
                STORAGE.memory.forEach((value, key) => {
                    variables.push({ name: key, value: value.value })
                })
                console.log(variables)
                // console.log(variables) // @TODO: Return the variables / need to implement a return system
                return variables
            }
        }
    ]

} as Fun