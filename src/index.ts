#!/usr/bin/env node --no-warnings=ExperimentalWarning

import { AzureCliCredential } from "@azure/identity";

import chalk from "chalk";

import { fetchSubscriptions } from './fetchSubscriptions.js';
import { getResourceGraphData, getCostManagementData } from './fetchDataFunctions.js';
import { exportToFile } from './exportToFile.js';
import { validateStorageAccount, uploadFilesToBlob } from './validateStorageAccount.js';
import { program }  from 'commander';


const log = console.log;
let credential: AzureCliCredential;

const filterSubscriptions = (subscriptions: any[], includedSubscriptions: string[], excludedSubscriptions: string[]) => {
    if (includedSubscriptions && includedSubscriptions.length > 0) {
        subscriptions = subscriptions.filter(subscription =>
            includedSubscriptions.includes(subscription.subscriptionId)
        );
    }
    if (excludedSubscriptions && excludedSubscriptions.length > 0) {
        subscriptions = subscriptions.filter(subscription =>
            !excludedSubscriptions.includes(subscription.subscriptionId)
        );
    }
    return subscriptions;
};

async function main() {
    program
        .requiredOption('-b, --blobUrl <blobUrl>', 'the blob URL to upload the files to')
        .option('-i, --includedSubscriptions [subscriptionId...]', 'subscription IDs to include from inventory')
        .option('-e, --excludedSubscriptions [subscriptionId...]', 'subscription IDs to exclude from inventory')

    program.parse(process.argv);
    const options = program.opts();
    // console.log(options);

    // return;

    try {
        credential = new AzureCliCredential();

        // Validate upload storage account
        const blobUrl = await validateStorageAccount(options.blobUrl);

        // Fetch subscriptions
        const subscriptions = await fetchSubscriptions(credential);
        const filteredSubscriptions = filterSubscriptions(subscriptions, options.includedSubscriptions, options.excludedSubscriptions);

        // Enumerate subscriptions with spinner
        if (filteredSubscriptions && Array.isArray(filteredSubscriptions)) {
            // Replace inline function definitions with imported functions
            for (let i = 0; i < filteredSubscriptions.length; i++) {
                const subscription = filteredSubscriptions[i];
                const resourceGraphData = await getResourceGraphData(subscription, credential);
                const costManagementData = await getCostManagementData(subscription, credential);

                const {fileName, dataToWrite} = exportToFile(subscription, resourceGraphData, costManagementData);
                uploadFilesToBlob(blobUrl, fileName, dataToWrite);
                log(chalk.green(`✅ Exported data: ${fileName}`));
            }
        }

        log(chalk.yellow("🎉 All subscriptions processed."));
    } catch (error) {
        console.error("Azure CLI authentication failed:", error);
    }
}

main();