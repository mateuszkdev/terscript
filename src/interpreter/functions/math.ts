import { Fun } from 'types/Functions'

export default {
    name: 'math',
    description: 'math functions',

    methods: [
        {
            name: 'compare',
            description: 'compare 2 numbers',
            usage: 'compare(1, 2)',
            run: (args) => {
                const [a, b] = args;
                return { type: 'number', value: a > b ? a : b, children: [] };
            }
        }
    ]

} as Fun