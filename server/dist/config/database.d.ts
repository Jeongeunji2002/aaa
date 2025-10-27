declare const prismaClientSingleton: () => any;
declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}
declare const prisma: any;
export { prisma };
export declare const testDatabaseConnection: () => Promise<boolean>;
//# sourceMappingURL=database.d.ts.map