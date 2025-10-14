const GAS_URL = "https://script.google.com/macros/s/AKfycbwVN0SmnUQF0nLQfCEgoeV2F18Ue8CoG-ASqxHmMYxNwJGu8XH3d29d1LuZ3HkOuQVeKg/exec";

/**
 * A reusable function to call the Google Apps Script backend.
 * @param {string} action - The name of the function to call in Code.gs.
 * @param {object} params - The parameters to pass to the function.
 * @returns {Promise<any>} - The data returned from the backend.
 */
export const callApi = async (action, params = {}) => {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-t', // Required header for GAS POST requests
      },
      body: JSON.stringify({ action, params }),
      mode: 'cors', // Important for cross-origin requests
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'An unknown error occurred at the backend.');
    }

    return result.data;

  } catch (error) {
    console.error(`API call failed for action "${action}":`, error);
    // Re-throw the error so the calling component can handle it
    throw error;
  }
};
