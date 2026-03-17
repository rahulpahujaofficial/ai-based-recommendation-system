const testAPI = async () => {
    const url = "http://localhost:5000/api/products/"; // Example API endpoint

    try {
        const response = await fetch(url);

        // Assertion 1: Check for successful status code (200-299)
        console.assert(response.ok, `Status code is not OK. Status: ${response.status}`);

        const data = await response.json();

        // Assertion 2: Check a specific data field
        console.assert(data.id === 1, "Data ID mismatch");
        console.assert(data.title, "Title is missing");

        console.log("GET API Test Passed:", data);
    } catch (error) {
        console.error("GET API Test Failed:", error);
    }
};

testAPI();
