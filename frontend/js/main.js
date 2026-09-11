let allItems = [];


// Load items from the backend
async function loadItems() {

    try {

        const response = await fetch(
            "http://localhost:3000/api/items"
        );

        allItems = await response.json();

        displayItems(allItems);

    } catch (error) {

        console.error("Error loading items:", error);

    }
}


// Display items
function displayItems(items) {

    const lostItemsContainer =
        document.getElementById("lostItems");

    const foundItemsContainer =
        document.getElementById("foundItems");


    if (!lostItemsContainer || !foundItemsContainer) {
        return;
    }


    lostItemsContainer.innerHTML = "";
    foundItemsContainer.innerHTML = "";


    items.forEach(item => {

        const card = document.createElement("div");

        card.className = "item-card";


        const imageUrl = item.photo
            ? `http://localhost:3000${item.photo}`
            : "https://via.placeholder.com/300x200";


        card.innerHTML = `

            <img
                src="${imageUrl}"
                alt="${item.item_name}"
            >

            <div class="item-info">

                <h3>${item.item_name}</h3>

                <p>
                    <strong>Location:</strong>
                    ${item.location}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${new Date(item.item_date).toLocaleDateString()}
                </p>

                <p class="status ${
                    item.status === "returned"
                        ? "returned"
                        : item.item_type
                }">
                    ${
                        item.status === "returned"
                            ? "Returned"
                            : item.item_type
                    }
                </p>

                <a
                    href="item-details.html?id=${item.id}"
                    class="button"
                >
                    View Details
                </a>

            </div>
        `;


        if (item.item_type === "lost") {

            lostItemsContainer.appendChild(card);

        } else {

            foundItemsContainer.appendChild(card);

        }

    });
}


// Search items
function searchItems() {

    const searchText =
        document.getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();


    const filteredItems = allItems.filter(item => {

        return (
            item.item_name.toLowerCase().includes(searchText) ||
            item.location.toLowerCase().includes(searchText)
        );

    });


    displayItems(filteredItems);
}


// Search while typing
const searchInput =
    document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchItems
    );

}


// Load items
loadItems();