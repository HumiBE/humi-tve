import { ResourceGraphClient } from "@azure/arm-resourcegraph";
import cliSpinners from "cli-spinners";
import chalk from "chalk";
import logUpdate from "log-update";

export async function fetchSubscriptions(credential: any) {
    const client = new ResourceGraphClient(credential);

    const query = {
        subscriptions: [], // Leave empty to query all accessible subscriptions
        query:
            "resourcecontainers | where type =~ 'microsoft.resources/subscriptions' | project subscriptionId, name",
    };

    const subscriptionSpinner = cliSpinners.dots;
    let frameIndex = 0;
    const subscriptionInterval = setInterval(() => {
        logUpdate(
            chalk.green(
                `Fetching subscriptions... ${subscriptionSpinner.frames[frameIndex]}`
            )
        );
        frameIndex = (frameIndex + 1) % subscriptionSpinner.frames.length;
    }, subscriptionSpinner.interval);

    try {
        const result = await client.resources(query);
        clearInterval(subscriptionInterval);
        logUpdate.clear();

        if (result.data && Array.isArray(result.data)) {
            console.log(chalk.grey(`${result.data.length} subscriptions found.`));
            return result.data;
        } else {
            console.log(chalk.yellow("No subscriptions found."));
            return [];
        }
    } catch (error) {
        clearInterval(subscriptionInterval);
        logUpdate.clear();
        console.error(chalk.red("Failed to fetch subscriptions:"), error);
        return [];
    }
}
