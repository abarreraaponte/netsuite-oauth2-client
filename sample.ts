import { NetSuiteClientCredentialsClient, type TokenData, type TokenStorage } from "./src/index.js";

/**
 * A simple in-memory implementation of TokenStorage.
 * In a real application, you might save this to a database, redis cache, or file storage.
 */
class InMemoryTokenStorage implements TokenStorage {
  private token: TokenData | null = null;

  async getToken(): Promise<TokenData | null> {
    return this.token;
  }

  async saveToken(token: TokenData): Promise<void> {
    this.token = token;
    console.log(
      "[TokenStorage] Saved new token, expires at:",
      new Date(token.expiresAt).toLocaleTimeString(),
    );
  }
}

async function run() {
  const {
    NETSUITE_ACCOUNT_ID,
    NETSUITE_CONSUMER_KEY,
    NETSUITE_CONSUMER_SECRET,
    NETSUITE_CERTIFICATE_ID,
    NETSUITE_PRIVATE_KEY,
  } = process.env;

  if (
    !NETSUITE_ACCOUNT_ID ||
    !NETSUITE_CONSUMER_KEY ||
    !NETSUITE_CONSUMER_SECRET ||
    !NETSUITE_CERTIFICATE_ID ||
    !NETSUITE_PRIVATE_KEY
  ) {
    console.error("Error: Missing required environment variables in .env file.");
    console.error(
      "Please configure NETSUITE_ACCOUNT_ID, NETSUITE_CONSUMER_KEY, NETSUITE_CONSUMER_SECRET, NETSUITE_CERTIFICATE_ID, and NETSUITE_PRIVATE_KEY.",
    );
    process.exit(1);
  }

  console.log(
    `[Sample] Starting client credentials authentication for NetSuite Account: ${NETSUITE_ACCOUNT_ID}`,
  );

  // 1. Initialize the client with storage
  const storage = new InMemoryTokenStorage();
  const authClient = new NetSuiteClientCredentialsClient(
    {
      accountId: NETSUITE_ACCOUNT_ID,
      consumerKey: NETSUITE_CONSUMER_KEY,
      consumerSecret: NETSUITE_CONSUMER_SECRET,
      certificateId: NETSUITE_CERTIFICATE_ID,
      privateKey: NETSUITE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle newlines in env vars
    },
    storage,
  );

  try {
    // 2. Fetch or retrieve the current cached token
    console.log("[Sample] Requesting token...");
    const token = await authClient.getCurrentToken();

    if (!token) {
      throw new Error("Failed to retrieve a valid access token.");
    }

    console.log("[Sample] Token successfully retrieved.");

    // 3. Make an innocent request to confirm connection
    // Convert underscore to hyphen for NetSuite REST subdomain naming convention
    const accountIdSubdomain = NETSUITE_ACCOUNT_ID.toLowerCase().replace(/_/g, "-");
    const catalogUrl = `https://${accountIdSubdomain}.suitetalk.api.netsuite.com/services/rest/record/v1/metadata-catalog`;

    console.log(`[Sample] Fetching metadata catalog from: ${catalogUrl}`);

    const response = await fetch(catalogUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    console.log(`[Sample] Response status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = (await response.json()) as { items?: Array<unknown> };
      console.log("[Sample] Success! Connected to NetSuite.");
      console.log("[Sample] Available resources in catalog:", data.items?.length || 0);
    } else {
      const errorText = await response.text();
      console.error("[Sample] Failed request details:", errorText);
    }
  } catch (error) {
    console.error("[Sample] An error occurred during auth or request:", error);
  }
}

run();
