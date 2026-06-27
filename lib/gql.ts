const URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000'

export async function gqlFetch(
    query: string,
    variables?: Record<string, any>,
    token?: string
) {
    const res = await fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
    })
    return res.json()
}