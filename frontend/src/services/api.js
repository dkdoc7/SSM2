const API_BASE_URL = '/api/parameters';

export async function fetchParameters() {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
        throw new Error('Failed to fetch parameters');
    }
    return response.json();
}

export async function updateParameter(groupId, parameterKey, newValue) {
    const response = await fetch(`${API_BASE_URL}/update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            group_id: groupId,
            parameter_key: parameterKey,
            new_value: newValue,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to update parameter');
    }

    return response.json();
}

export async function deleteParameter(groupId, parameterKey) {
    const response = await fetch(`${API_BASE_URL}/${groupId}/${parameterKey}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to delete parameter');
    }

    return response.json();
}

export async function addParameter(groupId, parameter) {
    const response = await fetch(`${API_BASE_URL}/${groupId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameter),
    });

    if (!response.ok) {
        throw new Error('Failed to add parameter');
    }

    return response.json();
}

export async function syncSchema() {
    const response = await fetch(`${API_BASE_URL}/sync-schema`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to sync schema');
    }

    return response.json();
}
