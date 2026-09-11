const form = document.getElementById("editItemForm");

const params = new URLSearchParams(window.location.search);
const itemId = params.get("id");

async function loadItem() {

    if (!itemId) {
        alert("Item ID not found.");
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:3000/api/items/${itemId}`
        );

        if (!response.ok) {
            throw new Error("Item not found");
        }

        const item = await response.json();

        document.getElementById("itemName").value =
            item.item_name;

        document.getElementById("location").value =
            item.location;

        document.getElementById("itemDate").value =
            item.item_date.split("T")[0];

        document.getElementById("contactName").value =
            item.contact_name;

        document.getElementById("contactInfo").value =
            item.contact_info;

    } catch (error) {

        console.error("Error:", error);
        alert("Could not load item.");
    }
}

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const itemName =
        document.getElementById("itemName").value;

    const location =
        document.getElementById("location").value;

    const itemDate =
        document.getElementById("itemDate").value;

    const contactName =
        document.getElementById("contactName").value;

    const contactInfo =
        document.getElementById("contactInfo").value;

    if (
        !itemName.trim() ||
        !location.trim() ||
        !itemDate ||
        !contactName.trim() ||
        !contactInfo.trim()
    ) {
        alert("Please fill in all fields.");
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:3000/api/items/${itemId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    item_name: itemName,
                    location: location,
                    item_date: itemDate,
                    contact_name: contactName,
                    contact_info: contactInfo
                })
            }
        );

        const result = await response.json();

        if (response.ok) {

            alert("Item updated successfully!");

            window.location.href =
                `item-details.html?id=${itemId}`;

        } else {

            alert(result.message);
        }

    } catch (error) {

        console.error("Error:", error);

        alert("Could not connect to the server.");
    }
});

loadItem();