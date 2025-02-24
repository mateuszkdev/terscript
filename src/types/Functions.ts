export type Method = {
    name: string;
    description: string;
    usage?: string;
    run: (e: unknown) => Promise<any>;
}

export type Fun = {
    name: string;
    description: string;
    usage?: string;
    methods: Method[];
}