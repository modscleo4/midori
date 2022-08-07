import { prisma } from '../lib/Prisma.js';

export default class Bin {
    static async all() {
        return await prisma.bins.findMany();
    }

    static async create(data) {
        return await prisma.bins.create({
            data
        });
    }

    static async get(id) {
        return await prisma.bins.findFirst({
            where: {
                id
            }
        });
    }

    static async save(bin) {
        return await prisma.bins.update({
            where: {
                id: bin.id
            },
            data: {
                content: bin.content
            }
        });
    }

    static async delete(bin) {
        return await prisma.bins.delete({
            where: {
                id: bin.id
            }
        });
    }
}
