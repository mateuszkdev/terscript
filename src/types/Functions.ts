export type Fun = {
    name: string;
    description: string;
    usage?: string;
    run: ({}: unknown) => Promise<any>;
}