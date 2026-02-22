interface GraphQLError {
    message: string;
}

interface GraphQLResponse<T> {
    data?: T;
    errors?: GraphQLError[];
}

/**
 * A generic function to fetch data from the main Mapleime GraphQL API.
 * This function appends the default security headers (e.g., token verification) automatically.
 *
 * @param query The GraphQL query string.
 * @param variables Optional variables to pass into the query.
 * @returns The queried data.
 */
export const fetchGraphQL = async <T, V = Record<string, any>>(
    query: string,
    variables?: V
): Promise<T> => {
    const endpoint = process.env.MAIN_SERVER_GRAPHQL_URL;
    const token = process.env.EXTERNAL_API_AUTH_TOKEN;

    if (!endpoint) {
        throw new Error("MAIN_SERVER_GRAPHQL_URL is not defined in environment variables.");
    }

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // Include the authorization token. The main Mapleime API can verify this easily.
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
            query,
            variables,
        }),
        cache: "no-store", // Since it's dynamic dashboard data, avoid excessive caching.
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("GraphQL 400/500 Detailed Error Payload:", errorText);
        throw new Error(`GraphQL fetch failed with status: ${response.status}. Details: ${errorText}`);
    }

    const json: GraphQLResponse<T> = await response.json();

    if (json.errors) {
        throw new Error(
            `GraphQL Internal Error: ${json.errors.map((e) => e.message).join(", ")}`
        );
    }

    if (!json.data) {
        throw new Error("GraphQL response contained no data.");
    }

    return json.data;
};
