async function loadItem() {

    const params = new URLSearchParams(window.location.search);
    const itemId = params.get("id");

    if (!itemId) {
        alert("Item ID not found.");
        return;
    }

    try {

        const response = await fetch(
            `/api/items/${itemId}`
        );

        if (!response.ok) {
            throw new Error("Item not found");
        }

        const item = await response.json();

        // Item name
        document.getElementById("itemName").textContent =
            item.item_name;

        // Location
        document.getElementById("itemLocation").textContent =
            item.location;

        // Date
        document.getElementById("itemDate").textContent =
            new Date(item.item_date).toLocaleDateString();

        // Contact information
        document.getElementById("contactName").textContent =
            item.contact_name;

        document.getElementById("contactInfo").textContent =
            item.contact_info;

        // Image
        if (item.photo) {

            document.getElementById("itemImage").src =
                item.photo;
        }

        // Status
        const statusElement =
            document.getElementById("itemStatus");

        statusElement.className = "status";

        if (item.status === "returned") {

            statusElement.textContent = "Returned";
            statusElement.classList.add("returned");

        } else {

            statusElement.textContent = item.item_type;
            statusElement.classList.add(item.item_type);
        }

        // Buttons
        const contactButton =
            document.querySelector(".item-info .button");

        const returnedButton =
            document.querySelector(".returned-button");

        if (item.status === "returned") {

            contactButton.style.display = "none";
            returnedButton.style.display = "none";

        } else {

            contactButton.style.display = "block";
            returnedButton.style.display = "block";
        }

    } catch (error) {

        console.error("Error:", error);

        alert("Could not load item details.");
    }
}


// Contact button
function contactPerson() {

    const contact =
        document.getElementById("contactInfo").textContent;

    const confirmed = confirm(
        "Please contact the reporter using:\n\n" +
        contact +
        "\n\nHave you successfully contacted them?"
    );

    if (confirmed) {
        alert(
            "Great! Once the item has been returned, " +
            "click 'Mark as Returned'."
        );
    }
}


// Mark as returned
async function markReturned() {

    const params = new URLSearchParams(window.location.search);
    const itemId = params.get("id");

    if (!itemId) {
        alert("Item ID not found.");
        return;
    }

    try {

        const response = await fetch(
            `/api/items/${itemId}/returned`,
            {
                method: "PUT"
            }
        );

        const result = await response.json();

        if (response.ok) {

            alert("Item marked as returned!");

            // Reload the item so the page updates
            loadItem();

        } else {

            alert(result.message);
        }

    } catch (error) {

        console.error("Error:", error);

        alert("Could not connect to the server.");
    }
}


function editItem() {

    const params = new URLSearchParams(window.location.search);
    const itemId = params.get("id");

    if (!itemId) {
        alert("Item ID not found.");
        return;
    }

    window.location.href = `edit-item.html?id=${itemId}`;
}


// Delete item
async function deleteItem() {

    const params = new URLSearchParams(window.location.search);
    const itemId = params.get("id");

    if (!itemId) {
        alert("Item ID not found.");
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to delete this item?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `/api/items/${itemId}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (response.ok) {

            alert("Item deleted successfully!");

            window.location.href = "items.html";

        } else {

            alert(result.message);
        }

    } catch (error) {

        console.error("Error:", error);

        alert("Could not connect to the server.");
    }
}


loadItem();