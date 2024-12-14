// ==UserScript==
// @name         irankhodrodisel
// @namespace    http://tampermonkey.net/
// @version      2024-12-14
// @description  try to take over the world!
// @author       You
// @match        https://esale.ikd.ir/*
// @icon         https://esale.ikd.ir/logo.png
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js

// ==/UserScript==

(function() {
    'use strict';
    //variables
    const targetKey = 'SaleInternet';
    const apiUrlfetchitems = 'https://esale.ikd.ir/api/sales/getSaleProjects';
    const captchaUrl = 'https://esale.ikd.ir/api/esales/getData66';
    //login
    let token = ""
    // Check if localStorage is available
    if (typeof localStorage !== 'undefined') {
        // Attempt to get the value of the target key
        token = localStorage.getItem(targetKey);

        if (token !== null) {
            console.log(`✅ Found key "${token}" in localStorage. Value:`, token);
        } else {
            console.warn(`⚠️ Key "${token}" not found in localStorage.`);
        }
    } else {
        console.error('🚫 localStorage is not supported on this site.');
    }
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Bearer token for authentication
    };
    //maincontain
    const container = document.createElement('div');
    container.id = 'main-container';
    container.style.position = 'absolute';
    container.style.top = '30%';
    container.style.right = '30%';
    container.style.width = '800px';
    container.style.height = '500px';
    container.style.backgroundColor = '#000000';
    container.style.border = '2px solid #333';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    container.style.padding = '10px';
    container.style.zIndex = '10000';
    container.style.overflowY = 'auto';
    document.body.appendChild(container);

    async function getItems() {
        try {
            // Make the API request
            const response = await axios.post(apiUrlfetchitems, {}, { headers });
            console.log('✅ API Response:', response.data);

            // Return the data from the response
            return response.data;
        } catch (error) {
            console.error('❌ API Request Error:', error.response ? error.response.data : error.message);
            throw error; // Rethrow the error to handle it in the calling function if needed
        }
    }
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0; // Generate random 4-bit number
            const v = c === 'x' ? r : (r & 0x3 | 0x8); // Use `r` for x and specific bitwise for y
            return v.toString(16); // Convert to hexadecimal
        });
    }

    async function showItems(data) {
        return new Promise((resolve) => {
            // Validate data
            if (!data || !Array.isArray(data.saleProjects)) {
                console.error('❌ Invalid data format. Expected an object with saleProjects array.');
                resolve(null); // Resolve with null if data is invalid
                return;
            }

            const { saleProjects } = data;

            // Ensure a main container exists
            let mainContainer = document.getElementById('main-container');
            if (!mainContainer) {
                console.error('❌ Main container not found. Please create a main container with ID "main-container" first.');
                resolve(null); // Resolve with null if container is missing
                return;
            }

            // Clear previous content in the main container
            mainContainer.innerHTML = '';

            // Create a grid container for items
            const itemsGrid = document.createElement('div');
            itemsGrid.id = 'items-grid';
            itemsGrid.style.display = 'grid';
            itemsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
            itemsGrid.style.gap = '20px';
            mainContainer.appendChild(itemsGrid);

            // Render items
            saleProjects.forEach((item) => {
                // Create a card for each item
                const itemCard = document.createElement('div');
                itemCard.style.border = '1px solid #ddd';
                itemCard.style.borderRadius = '8px';
                itemCard.style.boxShadow = '0px 2px 4px rgba(0, 0, 0, 0.1)';
                itemCard.style.padding = '10px';
                itemCard.style.backgroundColor = '#fff';
                itemCard.style.textAlign = 'center';

                // Add image
                const itemImage = document.createElement('img');
                itemImage.src = item.ImageSpecification || 'https://via.placeholder.com/250'; // Default image if missing
                itemImage.alt = item.Title;
                itemImage.style.width = '100%';
                itemImage.style.borderRadius = '8px 8px 0 0';
                itemImage.style.objectFit = 'cover';
                itemCard.appendChild(itemImage);

                // Add item title
                const itemTitle = document.createElement('h3');
                itemTitle.textContent = item.Title;
                itemTitle.style.fontSize = '16px';
                itemTitle.style.margin = '10px 0';
                itemCard.appendChild(itemTitle);

                // Add price
                const itemPrice = document.createElement('p');
                itemPrice.textContent = `Price: ${item.InternetPrice.toLocaleString()} IRR`;
                itemPrice.style.color = '#007BFF';
                itemPrice.style.fontSize = '14px';
                itemCard.appendChild(itemPrice);

                // Add delivery info
                const deliveryInfo = document.createElement('p');
                deliveryInfo.textContent = `Delivery: ${item.YearDueDeliverTitle}`;
                deliveryInfo.style.fontSize = '12px';
                deliveryInfo.style.color = '#555';
                itemCard.appendChild(deliveryInfo);

                // Add a "Select" button
                const selectButton = document.createElement('button');
                selectButton.textContent = 'Select';
                selectButton.style.marginTop = '10px';
                selectButton.style.padding = '8px 16px';
                selectButton.style.border = 'none';
                selectButton.style.borderRadius = '4px';
                selectButton.style.backgroundColor = '#007BFF';
                selectButton.style.color = '#fff';
                selectButton.style.fontSize = '14px';
                selectButton.style.cursor = 'pointer';

                // Add click event to the button
                selectButton.addEventListener('click', () => {
                    console.log('Selected Item:', item);
                    resolve(item); // Resolve the Promise with the selected item
                });

                // Append the button to the item card
                itemCard.appendChild(selectButton);

                // Append card to grid
                itemsGrid.appendChild(itemCard);
            });
        });
    }


    async function getCaptcha(cardId){
        const payload = {
            captchaId: cardId,
            captchaType: "AgencySelect",
            saltName: "captchaText",
            token: "", // Add token dynamically if needed
            valueId: generateUUID(),
        };
        try {
            console.log('🥷 Sending POST request to:', apiUrlfetchitems);
            const response = await axios.post(apiUrlfetchitems, payload, { headers });
            console.log('✅ API Response:', response.data);
        } catch (error) {
            console.error('❌ API Request Failed:', error.response ? error.response.data : error.message);
        }
    }
    async function stepBeforeGetway(){}
    async function main(){
        try {
            // Await the data from getItems
            const data = await getItems();
            const selected = await showItems(data)

            // Access and log saleProjects from the response

        } catch (error) {
            console.error('❌ Error in main function:', error.message);
        }
    }
    main()
})();