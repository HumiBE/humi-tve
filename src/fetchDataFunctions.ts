const log = console.log;
import cliSpinners from "cli-spinners";
import chalk from "chalk";
import logUpdate from "log-update";
import { ResourceGraphClient } from "@azure/arm-resourcegraph";
import { CostManagementClient } from "@azure/arm-costmanagement";

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(operation: () => Promise<T>, maxRetries: number = 3, initialDelay: number = 1000): Promise<T> {
    let retryCount = 0;
    let retryDelay = initialDelay;

    while (true) {
        try {
            return await operation();
        } catch (error: any) {
            if (error.statusCode === 429 && retryCount < maxRetries) {
                retryCount++;
                await delay(retryDelay);
                retryDelay *= 2; // exponential backoff
            } else {
                throw error;
            }
        }
    }
}

export async function fetchResourceGraphData(subscription: any, credential: any): Promise<any> {
    const resourceClient = new ResourceGraphClient(credential);
    const baseQuery: { subscriptions: any[]; query: string; options?: { skipToken?: string } } = {
        subscriptions: [subscription.subscriptionId],
        query: "resources | project id, name, type, location, tags"
    };

    const results: any[] = [];
    let skipToken: string | undefined = undefined;

    do {
        const query = { ...baseQuery };
        if (skipToken) {
            query["options"] = { skipToken };
        }

        const response = await withRetry(() => resourceClient.resources(query));

        if (response && response.data) {
            results.push(...response.data);
        }

        // Assume response.skipToken indicates pagination for additional resources
        skipToken = response.skipToken;
    } while (skipToken);

    return results;
}

export async function fetchCostManagementData(subscription: any, credential: any): Promise<any> {
    const costClient = new CostManagementClient(credential);

    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayPreviousMonth = new Date(firstDayCurrentMonth.getTime() - 1);
    const firstDayPreviousMonth = new Date(lastDayPreviousMonth.getFullYear(), lastDayPreviousMonth.getMonth(), 1);
    const timePeriod = {
        from: firstDayPreviousMonth,
        to: lastDayPreviousMonth,
    };

    const scope = `/subscriptions/${subscription.subscriptionId}`;

    const queryDefinition = {
        type: "ActualCost",
        timeframe: "Custom",
        timePeriod: timePeriod,
        dataset: {
            granularity: "Monthly",
            grouping: [
                { type: "Dimension", name: "ResourceId" },
                { type: "Dimension", name: "ResourceType" },
                { type: "Dimension", name: "ResourceLocation" },
                { type: "Dimension", name: "ChargeType" },
                { type: "Dimension", name: "ResourceGroupName" },
                { type: "Dimension", name: "PublisherType" },
                { type: "Dimension", name: "ServiceName" },
                { type: "Dimension", name: "Meter" },
            ],
            aggregation: {
                totalCost: {
                    name: "Cost",
                    function: "Sum",
                },
            },
        },
    };

    return await withRetry(() => costClient.query.usage(scope, queryDefinition));
}

export async function getResourceGraphData(subscription: any, credential: any): Promise<any> {
    let frameIndex = 0;
    const spinner = cliSpinners.dots;
    const interval = setInterval(() => {
        logUpdate(
            chalk.green(
                `Fetching data for subscription: ${subscription.name} (ID: ${subscription.subscriptionId}) - Resource Graph Data ${spinner.frames[frameIndex]}`
            )
        );
        frameIndex = (frameIndex + 1) % spinner.frames.length;
    }, spinner.interval);

    try {
        const result = await fetchResourceGraphData(subscription, credential);
        return result;
    } finally {
        clearInterval(interval);
        logUpdate.clear();
        log(
            chalk.grey(
                `Fetched data for subscription: ${subscription.name} (ID: ${subscription.subscriptionId}) - Resource Graph Data`
            )
        );
    }
}

export async function getCostManagementData(subscription: any, credential: any): Promise<any> {
    let frameIndex = 0;
    const spinner = cliSpinners.dots;
    const interval = setInterval(() => {
        logUpdate(
            chalk.green(
                `Fetching data for subscription: ${subscription.name} (ID: ${subscription.subscriptionId}) - Cost Management Data  ${spinner.frames[frameIndex]}`
            )
        );
        frameIndex = (frameIndex + 1) % spinner.frames.length;
    }, spinner.interval);

    try {
        const result = await fetchCostManagementData(subscription, credential);
        return result;
    } finally {
        clearInterval(interval);
        logUpdate.clear();
        log(
            chalk.grey(
                `Fetched data for subscription: ${subscription.name} (ID: ${subscription.subscriptionId}) - Cost Management Data`
            )
        );
    }
}
