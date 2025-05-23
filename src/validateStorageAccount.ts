import chalk from "chalk";
import { ContainerClient } from "@azure/storage-blob";

const log = console.log;

export async function uploadFilesToBlob(blobUrl: string, blobName: string, content: string): Promise<void> {
    const containerClient = new ContainerClient(blobUrl);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const buffer = Buffer.from(content, "utf-8");
    await blockBlobClient.upload(buffer, buffer.length);
}

export async function validateStorageAccount(blobUrl: string): Promise<string> {
    try {
        const blobName = ".connection-test";
        const content = "Connection successful.";
        await uploadFilesToBlob(blobUrl, blobName, content);

        log(chalk.green("Blob storage validated successfully: .connection-test uploaded."));
    } catch (error) {
        console.error("Error accessing blob storage:", error);
        process.exit(1);
    }
    return blobUrl;
}