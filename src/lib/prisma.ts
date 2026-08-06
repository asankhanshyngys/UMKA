import "dotenv/config";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

export function getDatabaseConfigurationError() {
    if (!connectionString) {
        return "DATABASE_URL is missing. Add it to .env using the format in .env.";
    }

    try {
        const url = new URL(connectionString);
        if (!url.username || !url.password) {
            return "DATABASE_URL must include both a username and password.";
        }
    } catch {
        return "DATABASE_URL is not a valid PostgreSQL connection URL.";
    }

    return null;
}

export function assertDatabaseConfigured() {
    const configurationError = getDatabaseConfigurationError();
    if (configurationError) {
        throw new Error(configurationError);
    }
}

const adapter = new PrismaPg({
    connectionString: connectionString ?? "postgresql://missing:missing@localhost:5432/missing",
});


const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};


export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
    });


if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
