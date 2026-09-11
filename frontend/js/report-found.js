const dateInput = document.getElementById("itemDate");

dateInput.value = new Date().toISOString().split("T")[0];
const form = document.getElementById("foundItemForm");

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const itemName = document.getElementById("itemName").value;
    const photo = document.getElementById("photo").files[0];
    const location = document.getElementById("location").value;
    const itemDate = document.getElementById("itemDate").value;
    const contactName = document.getElementById("contactName").value;
    const contactInfo = document.getElementById("contactInfo").value;
if (!itemName.trim()) {
    alert("Please enter the item name.");
    return;
}

if (!photo) {
    alert("Please select a photo.");
    return;
}

if (!location.trim()) {
    alert("Please enter where the item was found.");
    return;
}

if (!itemDate) {
    alert("Please select the date.");
    return;
}

if (!contactName.trim()) {
    alert("Please enter your name.");
    return;
}

if (!contactInfo.trim()) {
    alert("Please enter your contact information.");
    return;
}
    const formData = new FormData();

    formData.append("item_type", "found");
    formData.append("item_name", itemName);
    formData.append("photo", photo);
    formData.append("location", location);
    formData.append("item_date", itemDate);
    formData.append("contact_name", contactName);
    formData.append("contact_info", contactInfo);

    try {

        const response = await fetch(
            "/api/items",
            {
                method: "POST",
                body: formData
            }
        );

        const result = await response.json();

        if (response.ok) {

            alert("Found item posted successfully!");

            form.reset();

        } else {

            alert(result.message);
        }

    } catch (error) {

        console.error("Error:", error);

        alert("Could not connect to the server.");
    }
});