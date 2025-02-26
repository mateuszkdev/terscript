export type Method = {
    name: string;
    description: string;
    usage?: string;
    run: (e?: any) => Promise<any>;
}

export type Fun = {
    name: string;
    description: string;
    usage?: string;
    methods: Method[];
}