import { Fun } from 'types/Functions'

export default {
    name: 'console',
    description: 'Function to display information in colsole.',

    methods: [
        {
            name: 'log',
            description: 'Print text in console',
            usage: 'log("Hello, World!")',
            run: (text: string) => console.log(text)
        }
    ]

} as Fun