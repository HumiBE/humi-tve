// import fs from "fs";
// import path from "path";

export function exportToFile(subscription: any, resourceGraphData: any, costManagementData: any): any {
    // Write results to a file under the humi-export directory
    // const exportDir = path.join(process.cwd(), "humi-export");

    // if (!fs.existsSync(exportDir)) {
    //     fs.mkdirSync(exportDir, { recursive: true });
    // }

    // Create a file name by sanitizing the subscription name and using the subscriptionId
    const sanitizedSubscriptionName = subscription.name
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "");
    const fileName = `${subscription.subscriptionId}-${sanitizedSubscriptionName}.json`;
    // const filePath = path.join(exportDir, fileName);

    const dataToWrite = JSON.stringify(
        { subscription, resourceGraphData, costManagementData },
        null,
        2
    );
    return {fileName, dataToWrite};
}
