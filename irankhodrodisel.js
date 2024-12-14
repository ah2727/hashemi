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
    async function showItems(data){
            // Check if the data is valid
            if (!Array.isArray(data)) {
                console.error('❌ Invalid data format. Expected an array.');
                return;
            }

            // Create or get a container div for items
            let divitems = document.getElementById('items-container');
            if (!divitems) {
                divitems = document.createElement('div');
                divitems.id = 'items-container';
                divitems.style.padding = '10px';
                divitems.style.border = '1px solid #ccc';
                divitems.style.margin = '10px';
                divitems.style.borderRadius = '8px';
                divitems.style.backgroundColor = '#f9f9f9';
                divitems.style.overflowY = 'auto';
                divitems.style.maxHeight = '400px';
                container.appendChild(divitems);
            }

            // Clear previous content
            divitems.innerHTML = '';

            // Iterate over the data and create elements for each item
            data.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.style.borderBottom = '1px solid #ddd';
                itemDiv.style.padding = '8px 0';

                // Set the text content for the item
                itemDiv.textContent = `${index}: ${JSON.stringify(item)}`;

                // Add the item div to the container
                container.appendChild(itemDiv);
            });

            console.log('✅ Items displayed successfully in the div.');
    }
    async function main(){
        try {
            // Await the data from getItems
            const data = await getItems();
            await showItems(data.saleProjects)
            // Access and log saleProjects from the response
            console.log(data.saleProjects);
        } catch (error) {
            console.error('❌ Error in main function:', error.message);
        }
    }
    main()
})();