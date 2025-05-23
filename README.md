# Humi Tenant View Exporter

Humi TVE is a CLI tool designed to fetch Azure subscription data, process it, and upload the results to an Azure Blob Storage account.

## Prerequisites
NodeJS 20+
Azure CLI

## Installation

To install the CLI tool globally, use the following command:

```bash
npm install --global humitve
```

## Usage

Once installed, you can execute the CLI tool using the `humi-tve` command. Below is the syntax for using the tool:

```bash
humi-tve --blobUrl <blobUrl> [--includedSubscriptions <subscriptionId...>] [--excludedSubscriptions <subscriptionId...>]
```

### Options

- `-b, --blobUrl <blobUrl>` (required): The Azure Blob Storage URL where the files will be uploaded.
- `-i, --includedSubscriptions [subscriptionId...]` (optional): A list of subscription IDs to include in the inventory.
- `-e, --excludedSubscriptions [subscriptionId...]` (optional): A list of subscription IDs to exclude from the inventory.

### Example

```bash
humi-tve --blobUrl "https://mystorageaccount.blob.core.windows.net/mycontainer?<sastoken here>" \
         --includedSubscriptions "sub1" "sub2" \
         --excludedSubscriptions "sub3"
```

This command will:
1. Authenticate using Azure CLI credentials.
2. Fetch Azure subscriptions.
3. Filter the subscriptions based on the included and excluded subscription IDs.
4. Fetch resource graph and cost management data for each subscription.
5. Export the data to files and upload them to the specified Azure Blob Storage URL.

## Prerequisites

- Ensure you have the Azure CLI installed and authenticated.
- Node.js and npm should be installed on your system.
- The Blob Storage account and container should already exist.

## Troubleshooting

If you encounter any issues, ensure the following:
- You are authenticated with the Azure CLI.
- The provided Blob Storage URL is valid and accessible. (SAS token needs to be used)
- The required permissions are granted for accessing Azure resources and uploading to Blob Storage.

## License

This project is licensed under the CC-BY-SA-4.0 License.