// ==UserScript==
// @name         irankhodrodisel1.0
// @namespace    http://tampermonkey.net/
// @version      2024-12-14
// @description  try to take over the world!
// @author       You
// @match        https://esale.ikd.ir/*
// @icon         https://esale.ikd.ir/logo.png
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js

// ==/UserScript==

(function() {
    'use strict';
    const targetKey = 'SaleInternet';
    const apiUrlfetchitems = 'https://esale.ikd.ir/api/sales/getSaleProjects';
    const captchaUrl = 'https://esale.ikd.ir/api/esales/getCaptchaOrder';
    const orderInit= 'https://esale.ikd.ir/api/esales/readSefareshInfo';
    const smsApi = 'https://esale.ikd.ir/api/users/sendSmsOrder';
    const addOrderInit ='https://esale.ikd.ir/api/esales/addSefaresh';
    const getData = 'https://esale.ikd.ir/api/users/getDate'
    const defaultnumber=''
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


    GM_addStyle( `

/* تعریف رنگ‌ها به‌صورت متغیر */
:root {
  --dark-blue: #1b3a4b;
  --orange: #f4a261;
  --dark-gray: #333333;
  --light-gray: #e5e5e5;
}

/* تنظیم فونت عمومی برای تمام عناصر */
* {
  font-family: 'IRANSans';
}

/* تنظیمات پایه برای صفحه */
body {
  margin: 0;
}

/* هدر صفحه */
header {
  background-color: var(--dark-gray);
  color: white;
  padding: 4px 72px;
}

/* استایل برای بخش اصلی صفحه */
main {
  padding: 40px 72px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* استایل برای بخش‌های داخل main */
section {
  display: flex;
  align-items: start;
  justify-content: space-between;
}

/* استایل برای دکمه‌ها */
button {
  border: none;
  cursor: pointer;
}

/* استایل ورودی‌ها (input) */
input {
  width: 90%;
  background-color: transparent;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #9d9d9d;
  border-radius: 5px;
  font-size: 14px;
}
.custom-popup{
position:absolute;
right:50%;
top:50%;

}
/* استایل زمانی که ورودی‌ها فوکوس دارند */
input:focus {
  outline: none;
}

/* تنظیمات هدر داخلی */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* استایل لوگو */
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
}

.logo:hover {
  transform: scale(1.09); /* افکت زوم در زمان هاور */
}

.logo img {
  height: 60px;
}

/* تنظیمات بخش راست هدر */
.header-right {
  display: flex;
  align-items: center;
}

/* استایل ساعت در هدر */
.clock {
  display: flex;
  align-items: center;
  gap: 4px;
}

.clock img {
  height: 40px;
  width: 40px;
}

/* استایل آیکن کاربر */
.user-icon {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-icon img {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  margin-right: 5px;
}

/* استایل جعبه سفید در بخش ثبت‌نام */
.white-box {
  background-color: var(--light-gray);
  padding: 8px 12px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* عنوان جعبه ثبت‌نام */
.register-box h3 {
  margin: 0 0 15px;
}

/* استایل دکمه‌های داخل جعبه ثبت‌نام */
.buttons {
  display: flex;
  gap: 8px;
}

.buttons button {
  flex: 1;
  text-align: center;
  padding: 10px;
  box-sizing: border-box;
}

/* دکمه ویرایش */
.edit-btn {
  background-color: var(--dark-gray);
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* دکمه ثبت‌نام */
.register-btn {
  background-color: var(--orange);
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* استایل دکمه جستجو */
.search-button {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: var(--orange);
  padding: 25px 29px;
  border-radius: 8px;
  color: var(--light-gray);
}

.searching {
  background-color: #ff7f50; /* رنگ جدید دکمه */
  color: white;
  border: 1px solid #ff7f50;
}

.search-button img {
  width: 40px;
  height: 40px;
}

.search-button p {
  font-size: 20px;
  font-weight: bold;
}

/* استایل باکس پیام‌ها */
.messages-box {
  height: 324px;
  padding: 10px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  display: flex;
  flex-direction: column;
}

.messages-box h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: var(--dark-gray);
}

.messages-content {
  max-height: 300px;
  flex-grow: 1;
  overflow: auto;
  padding-right: 10px;
  margin-top: 10px;
}

/* استایل پیام‌ها */
.message {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 5px;
  font-size: 14px;
}

.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message img {
  height: 30px;
  width: 30px;
}

.message span {
  font-size: 14px;
  color: #333;
  text-align: right;
}

/* استایل تصویر کپچا */
.captcha-image img {
  width: 100%;
  border-radius: 5px;
  margin-bottom: 10px;
}

/* استایل زمانی که پیامی وجود ندارد */
.no-message-exist {
  margin-top: 120px;
  color: #919191;
}

/* استایل بخش کد پیامکی */
.sms-section {
  display: flex;
  gap: 5px;
}

/* دکمه دریافت کد پیامکی */
.sms-btn {
  background-color: var(--dark-gray);
  color: white;
  padding: 8px;
  border-radius: 5px;
  cursor: pointer;
}

/* دکمه ثبت سفارش */
.submit-btn {
  background-color: var(--orange);
  color: white;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
}

/* استایل برای باکس‌های آیتم‌ها */
.items-box {
  background-color: var(--light-gray);
  padding: 15px;
  border-radius: 8px;
  width: 95%;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  margin: auto;
}

.items-box h3 {
  margin: 0 0 10px;
  color: var(--dark-gray);
}

/* استایل گرید آیتم‌ها */
.items-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

/* استایل هر آیتم */
.item {
  background-color: white;
  border: 1px solid var(--dark-gray);
  border-radius: 5px;
  padding: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

/* استایل آیتم انتخاب شده */
.item.selected {
  background-color: var(--dark-gray);
  color: var(--light-gray);
}

.item:hover {
  background-color: #919191;
}

/* استایل پاپ‌آپ */
.popup {
  position: fixed;
  top: 12vh;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  padding-top: 20px;
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 99999999999999999999999999;
}

/* محتوای پاپ‌آپ */
.popup-content {
  direction: rtl;
  background-color: var(--dark-blue);
  border-radius: 8px;
  width: 80%;
  max-height: 90%;
  overflow: auto;
  margin: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
}

/* دکمه بستن پاپ‌آپ */
.popup-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  color: var(--dark-gray);
  font-size: 20px;
  cursor: pointer;
}

/* نمایش پاپ‌آپ */
.popup.show {
  display: flex;
}

/* دکمه بستن پاپ‌آپ با طراحی دایره‌ای */
.close-popup {
  background: var(--light-gray);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 4px;
  position: absolute;
  top: 15px;
  right: 25px;
  z-index: 10;
}

.close-popup img {
  width: 30px;
  height: 30px;
}

/* ریسپانسیو برای نمایش در صفحات کوچک‌تر */
@media (max-width: 600px) {
  main {
    padding: 24px;
  }

  header {
    padding: 8px 24px;
  }

  section {
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }

  main section:last-of-type {
    flex-direction: column-reverse;
  }

  .close-popup {
    top: 5px;
    right: 50%;
    transform: translateX(50%);
  }

  .clock {
    display: none;
  }

  .logo img {
    width: 50px;
    height: 50px;
  }

  .items-grid {
    max-height: 150px;
    overflow: auto;
    padding: 8px;
  }

  .messages-box {
    max-height: 150px;
  }

  .messages-content {
    max-height: 150px;
  }

  .white-box,
  .popup-content {
    width: 90%;
  }

  .popup-content {
    bottom: 0;
  }

  .items-grid {
    grid-template-columns: repeat(1, 1fr);
  }

  .popup {
    align-items: flex-start;
    padding-top: 50px;
  }
}
        .custom-button {
            background: white; /* White background */
            border: 2px solid #ddd; /* Light border */
            border-radius: 12px; /* Rounded corners */
            padding: 15px; /* Padding inside button */
            width: 100%; /* Full width */
            text-align: left; /* Align text */
            cursor: pointer; /* Pointer effect */
            transition: 0.3s; /* Smooth hover effect */
            display: block; /* Block display for full width */
            margin: 10px 0; /* Spacing between items */
        }
        .custom-button:hover {
            background: #f8f8f8; /* Light grey hover */
        }
        .custom-button h3 {
            margin: 0;
            font-size: 18px;
            color: #333;
        }
        .custom-button p {
            margin: 5px 0;
            font-size: 14px;
            color: #666;
        }
            .custom-button {
        background: white;
        border: 2px solid #ddd;
        border-radius: 12px;
        padding: 15px;
        width: 100%;
        text-align: left;
        cursor: pointer;
        transition: 0.3s;
        display: block;
        margin: 10px 0;
        font-size: 14px;
    }
    .custom-button:hover {
        background: #f8f8f8;
    }
    .highlighted-button {
        background: #ffcc00 !important; /* Yellow highlight */
        border: 2px solid #ffa500;
        font-weight: bold;
    }
            `




    )
    // Your code here...
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
    async function getCaptcha(cardId){


        const payload = {"captchaName": "Order","token": "","captchaId": cardId,"apiId": "06290E83-E12E-4910-9C12-942F78131CE6"};
        // Step 3: Create an instance of the class using the dictionary
        try {
            const headersCaptcha = {
                'Content-Type': 'application/json;   charset=UTF-8', // Proper JSON content type
                'Authorization': `Bearer ${token}`, // Add Bearer token for authentication
            };

            let response; // Declare the variable to store the response

            console.log('🥷 Sending POST request to:', captchaUrl);
            response =await axios.post(captchaUrl, payload, {
                headers: headersCaptcha,
                withCredentials: true, // Ensures cookies are sent along with the request
            })

            console.log('✅ API Response:', response);
            return response.data
        } catch (error) {
            console.error('❌ API Request Failed:', error.response ? error.response.data : error.message);
        }
    }
    /**
 * Find the closest matching project based on a search term
 * using a hybrid similarity algorithm (Levenshtein + Damerau-Levenshtein + Jaccard).
 *
 * @param {string} searchTerm - The term to search for.
 * @param {Array} saleProjects - List of project objects with Id, Title, and KhodroTitle.
 * @returns {Object|null} The closest matching project with id, title, and score.
 */
    function findClosestMatchId(searchTerm, saleProjects) {
        if (!searchTerm || !Array.isArray(saleProjects) || saleProjects.length === 0) {
            throw new Error("Invalid input: Search term or projects array is missing.");
        }

        searchTerm = searchTerm.trim().toLowerCase();
        function tokenize(str) {
            const stopWords = new Set(['the', 'and', 'of', 'in', 'a', 'an']);
            return str.split(/[\s\-_]+/).filter(token => !stopWords.has(token));
        }
        function nGramSimilarity(str1, str2, n = 2) {
            const getNGrams = s => new Set(Array.from({ length: s.length - n + 1 }, (_, i) => s.substr(i, n)));
            const ngrams1 = getNGrams(str1);
            const ngrams2 = getNGrams(str2);
            const intersection = [...ngrams1].filter(g => ngrams2.has(g)).length;
            return intersection / (ngrams1.size + ngrams2.size - intersection);
        }
        // 🔹 Function to calculate Levenshtein Distance
        function levenshteinDistance(str1, str2) {
            const len1 = str1.length, len2 = str2.length;
            const dp = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

            for (let i = 0; i <= len1; i++) dp[i][0] = i;
            for (let j = 0; j <= len2; j++) dp[0][j] = j;

            for (let i = 1; i <= len1; i++) {
                for (let j = 1; j <= len2; j++) {
                    if (str1[i - 1] === str2[j - 1]) {
                        dp[i][j] = dp[i - 1][j - 1]; // No operation needed
                    } else {
                        dp[i][j] = Math.min(
                            dp[i - 1][j],      // Deletion
                            dp[i][j - 1],      // Insertion
                            dp[i - 1][j - 1]   // Substitution
                        ) + 1;
                    }
                }
            }
            return dp[len1][len2];
        }

        // 🔹 Function to calculate Damerau-Levenshtein Distance (allows transpositions)
        function damerauLevenshtein(str1, str2) {
            const len1 = str1.length, len2 = str2.length;
            const dp = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

            for (let i = 0; i <= len1; i++) dp[i][0] = i;
            for (let j = 0; j <= len2; j++) dp[0][j] = j;

            for (let i = 1; i <= len1; i++) {
                for (let j = 1; j <= len2; j++) {
                    let cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                    dp[i][j] = Math.min(
                        dp[i - 1][j] + 1,      // Deletion
                        dp[i][j - 1] + 1,      // Insertion
                        dp[i - 1][j - 1] + cost // Substitution
                    );

                    // Check for transpositions
                    if (i > 1 && j > 1 && str1[i - 1] === str2[j - 2] && str1[i - 2] === str2[j - 1]) {
                        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
                    }
                }
            }
            return dp[len1][len2];
        }

        // 🔹 Function to calculate Jaccard Similarity (for word-based matching)
        function jaccardSimilarity(str1, str2) {
            const set1 = new Set(str1.split(" "));
            const set2 = new Set(str2.split(" "));
            const intersection = new Set([...set1].filter(word => set2.has(word)));
            return intersection.size / (set1.size + set2.size - intersection.size);
        }

        // 🔹 Find the best match
        let bestMatch = null;
        let highestScore = -Infinity;

        for (const project of saleProjects) {
            const combinedTitle = `${project.Title || ''} ${project.KhodroTitle || ''}`.trim().toLowerCase();
            if (!combinedTitle) continue;

            const levDist = levenshteinDistance(searchTerm, combinedTitle);
            const damLevDist = damerauLevenshtein(searchTerm, combinedTitle);
            const jaccardScore = jaccardSimilarity(searchTerm, combinedTitle);

            // Normalize Levenshtein scores (lower is better, so invert it)
            const maxLen = Math.max(searchTerm.length, combinedTitle.length);
            const normalizedLev = 1 - (levDist / maxLen);
            const normalizedDamLev = 1 - (damLevDist / maxLen);
            // Tokenize for Jaccard/NGram
            const searchTokens = tokenize(searchTerm);
            const titleTokens = tokenize(combinedTitle);

            // Calculate similarities
            const ngramScore = nGramSimilarity(searchTerm, combinedTitle);


            // Hybrid score: weighted sum of Levenshtein, Damerau-Levenshtein, and Jaccard
            const finalScore = (
                normalizedLev * 0.35 +
                normalizedDamLev * 0.35 +
                jaccardScore * 0.2 +
                ngramScore * 0.1
            );
            console.log(`🔍 Checking: "${combinedTitle}"`);
            console.log(`   🔹 Levenshtein: ${levDist}, Normalized: ${normalizedLev}`);
            console.log(`   🔹 Damerau-Levenshtein: ${damLevDist}, Normalized: ${normalizedDamLev}`);
            console.log(`   🔹 Jaccard Similarity: ${jaccardScore}`);
            console.log(`   🔹 Final Score: ${finalScore}`);

            if (finalScore > highestScore) {
                highestScore = finalScore;
                bestMatch = {
                    id: project.Id,
                    title: combinedTitle,
                    score: finalScore
                };
            }
        }

        return bestMatch;
    }


    async function sendSms() {
        const payload = {
            smsType: "Order",
            systemCode: "SaleInternet",
        };

        try {
            // Send the POST request
            const response = await axios.post(smsApi, payload, { headers });

            // Return the response data
            return response.data;
        } catch (error) {
            console.log("test")
        }
    }
    async function solveCaptcha(captcha){
        const captchares = await axios.post(`https://khodro.bot1234.online/captcha/`,{svg:captcha},  {      headers: {
            'Content-Type': 'application/json',
        }},);
        return captchares.data.answer;
    }
    async function getMessage(mobileNumber){

        lastSmsResponse = await axios.get(`https://khodro.bot1234.online/api/last-sms/${mobileNumber}`);
        return lastSmsResponse.data?.data?.sms;
    }


    async function Start(){
        let container = document.createElement('div');
        container.classList.add('custom-popup'); // Assign a class for styling
        container.innerHTML = `
                <div class="white-box">
                    <input type="text" placeholder="نام کاربری" id="username" />
                    <input type="password" placeholder="رمز عبور" id="password" />
                    <input type="text" placeholder="مدل انتخابی" id="model" />
                    <div class="buttons">
                        <button class="register-btn" id="open-popup">حالت تک صفحه ای</button>
                        <button class="edit-btn" id="manual-mode">حالت دستی</button>
                    </div>
                </div>
                    <div class="popup" id="popup">
      <div class="popup-content">
        <header>
          <!-- بخش هدر پاپ‌آپ -->
          <div class="header-container">
            <div class="user-icon">
              <img src="assets/images/user.png" alt="نام کاربری" />
              <span>نام کاربری</span>
            </div>
            <div class="logo">
              <img src="assets/images/logo.png" alt="لوگو" />
            </div>
            <div class="clock">
              <div id="clock">15:13</div>
              <img src="assets/images/clock.png" alt="ساعت" />
            </div>
            <!-- دکمه بستن پاپ‌آپ -->
            <button class="close-popup" id="close-popup">
              <img src="assets/images/x.png" alt="بستن" />
            </button>
          </div>
        </header>

        <!-- محتوای اصلی پاپ‌آپ -->
        <main>
          <section>
            <!-- فرم اطلاعات ثبت نام -->
            <div class="white-box register-box">
              <h3>اطلاعات ثبت نام</h3>
              <input type="text" placeholder="نام کاربری" />
              <input type="password" placeholder="رمز عبور" />
              <div class="buttons">
                <!-- دکمه ثبت نام -->
                <button class="register-btn">ثبت نام</button>
                <!-- دکمه ویرایش اطلاعات -->
                <button class="edit-btn">ویرایش</button>
              </div>
            </div>
            <!-- دکمه جستجو -->
            <button class="search-button">
              <p>جست و جو</p>
            </button>
          </section>

          <!-- نمایش آیتم‌های پیدا شده -->
          <div class="items-box">
            <h3>آیتم‌های پیدا شده</h3>
            <div class="items-grid">
              <!-- دکمه‌های آیتم‌ها -->

            </div>
          </div>

          <section>
            <!-- بخش پیام‌ها -->
            <div class="white-box messages-box">
              <h3>پیام‌ها</h3>
              <div class="messages-content">
                <p class="no-message-exist">هیچ پیامی وجود ندارد.</p>
              </div>
            </div>

            <!-- بخش CAPTCHA و SMS -->
            <div class="white-box captcha-box">
              <div class="captcha-image">
                
              </div>
              <input type="text" placeholder="کد امنیتی رو وارد کنید" />
              <div class="sms-section">
                <input type="text" placeholder="کد SMS" />
                <button class="sms-btn">دریافت کد پیامکی</button>
              </div>
              <!-- دکمه ثبت سفارش -->
              <button class="submit-btn">ثبت سفارش</button>
            </div>
          </section>
        </main>
      </div>
    </div>

            `;
        document.body.appendChild(container);
        // انتخاب المان‌های مختلف صفحه
        const searchButton = document.querySelector('.search-button')
        const itemsBox = document.querySelector('.items-box')
        const captchaBox = document.querySelector('.captcha-box') // باکس کپچا
        const captchaImage = document.querySelector('.captcha-image') // باکس کپچا
        const smsButton = document.querySelector('.sms-btn') // دکمه دریافت کد پیامکی
        const orderButton = document.querySelector('.submit-btn') // دکمه ثبت سفارش
        const messagesBox = document.querySelector('.messages-content') // باکس پیام‌ها
        const popupButton = document.querySelector('#open-popup') // دکمه باز کردن پاپ‌آپ
        const popup = document.querySelector('.popup') // پاپ‌آپ
        const captchaInput = captchaBox.querySelector('input') // فیلد کد امنیتی
        const smsInput = captchaBox.querySelectorAll('input')[1] // فیلد کد پیامکی
        const closePopupButton = popup.querySelector('.close-popup') // دکمه بستن پاپ‌آپ
        const items_grid = document.querySelector('.items-grid')
        const model = document.querySelector('#model');
        // مخفی کردن باکس آیتم‌ها و باکس کپچا در شروع
        itemsBox.style.opacity = '0'
        itemsBox.style.transform = 'translateY(-20px)'
        itemsBox.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out'
        itemsBox.style.display = 'none'

        captchaBox.style.display = 'none' // مخفی کردن باکس کپچا در ابتدا
        popup.style.display = 'none' // مخفی کردن پاپ‌آپ در ابتدا

        let searching = false // متغیر برای بررسی وضعیت جستجو
        let isSmsCooldown = false // برای مدیریت وضعیت دکمه ارسال کد پیامکی


        const items =await getItems();
        let closestMatch=""

        // مدیریت جستجو
        searchButton.addEventListener('click', () => {
            if (searching) {
                searching = false
                searchButton.classList.remove('searching')
                searchButton.querySelector('p').textContent = 'جست و جو'
                itemsBox.style.opacity = '0'
                itemsBox.style.transform = 'translateY(-20px)'
                setTimeout(() => {
                    itemsBox.style.display = 'none'
                }, 500)
                return
            }

            searching = true
            searchButton.classList.add('searching')
            searchButton.querySelector('p').textContent = 'توقف جستجو'
            const saleProjects=items.saleProjects;
            const searchterm=model.value
            console.log(searchterm)
            closestMatch = findClosestMatchId(searchterm, saleProjects); // Recalculate closest match
            console.log("Closest Match ID:", closestMatch); // Debugging

            setTimeout(() => {
                if (searching) {
                    itemsBox.style.display = 'block'
                    setTimeout(() => {
                        itemsBox.style.opacity = '1'
                        itemsBox.style.transform = 'translateY(0)'

                        // اسکرول به باکس آیتم‌ها بعد از نمایش
                        itemsBox.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }, 50)
                }
                setTimeout(() => {
                    searching = false
                    searchButton.classList.remove('searching')
                    searchButton.querySelector('p').textContent = 'جست و جو'
                }, 500)
            }, 2500)
            items.saleProjects.forEach(item => {

                // Create a button
                let itemdiv = document.createElement('div');

                // Set button content
                itemdiv.innerHTML = `
            <h3>${item.KhodroTitle}</h3>
            <p><strong>Delivery:</strong> ${item.YearDueDeliverTitle}</p>
            <p><strong>Details:</strong> ${item.Title}</p>
        `;
                let button = document.createElement('button');

                button.classList.add('custom-button'); // Add base styling class
                button.classList.add('item');
                // ✅ Highlight the closest match
                if (item.Id === closestMatch.id) {
                    button.classList.add('highlighted-button'); // Special class for highlight
                }
                itemdiv.appendChild(button)
                // Append button to the grid
                items_grid.appendChild(itemdiv);
            });

        })
        const buttons = document.querySelectorAll("custom-button") // Select all buttons

        // مدیریت انتخاب آیتم
        itemsBox.addEventListener('click', async (event) => {
            console.log(items.saleProjects);
            if (event.target && event.target.matches('.item')) {
                const filteredItems = items.saleProjects.filter(item => item.Id === closestMatch.id);
                console.log(filteredItems)
                const captcha = await getCaptcha(filteredItems[0].IdDueDeliverProg);
                const captchaDiv = document.createElement('div');
                captchaDiv.innerHTML = captcha.capchaData; // Inject the SVG data
                const answer =await solveCaptcha(captcha.capchaData);
                captchaInput.value = answer
                captchaImage.appendChild(captchaDiv)
                const selectedItem = itemsBox.querySelector('.selected')
                if (selectedItem) {
                    selectedItem.classList.remove('selected')
                }

                event.target.classList.add('selected')
                captchaBox.style.display = 'block'
                // اسکرول به باکس کپچا بعد از نمایش
                setTimeout(() => {
                    captchaBox.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }, 100)
            }
        })


        // مدیریت دکمه حالت تک صفحه‌ای (پاپ‌آپ)
        popupButton.addEventListener('click', () => {
            popup.style.display = 'block' // نمایش پاپ‌آپ
        })

        // بستن پاپ‌آپ زمانی که روی دکمه بستن کلیک می‌شود
        closePopupButton.addEventListener('click', () => {
            popup.style.display = 'none' // مخفی کردن پاپ‌آپ
        })

        // بستن پاپ‌آپ با کلیک خارج از آن
        window.addEventListener('click', (event) => {
            if (event.target === popup) {
                popup.style.display = 'none' // مخفی کردن پاپ‌آپ
            }
        })

        // مدیریت دکمه دریافت کد پیامکی و شمارش معکوس
        smsButton.addEventListener('click',async () => {
            if (isSmsCooldown) return // اگر هنوز در حال شمارش هستیم، اجازه کلیک نمی‌دهیم
            const smsResponse = await sendSms();
            console.log('SMS sent successfully:', smsResponse);

            // Extract the mobile number from the SMS response (modify based on your API response)
            const mobileNumber = smsResponse.mobile || defaultnumber; // Use actual response field
            // فعال کردن حالت شمارش معکوس
            isSmsCooldown = true
            smsButton.textContent = '1:00' // متن دکمه به حالت شمارش معکوس تغییر می‌کند
            smsButton.style.backgroundColor = '#ccc' // تغییر رنگ دکمه به خاکستری
            smsButton.disabled = true // غیرفعال کردن دکمه برای جلوگیری از کلیک دوباره

            let timeLeft = 60 // زمان باقی‌مانده (60 ثانیه)

            // شروع شمارش معکوس
            const countdown = setInterval(() => {
                timeLeft--
                smsButton.textContent = `${timeLeft < 10 ? '0' + timeLeft : timeLeft}:00` // به‌روزرسانی متن دکمه
      if (timeLeft <= 0) {
          clearInterval(countdown)
          smsButton.textContent = 'دریافت کد پیامکی'
          smsButton.style.backgroundColor = '' // بازگشت به رنگ قبلی
          smsButton.disabled = false // فعال کردن دوباره دکمه
          isSmsCooldown = false // برداشتن حالت شمارش معکوس
      }
            }, 1000)
            })

        // مدیریت دکمه ثبت سفارش
        orderButton.addEventListener('click', () => {
            // بررسی فیلدهای کد امنیتی و کد پیامکی
            const captchaCode = captchaInput.value.trim().toUpperCase() // تبدیل به حروف بزرگ
            const smsCode = smsInput.value.trim()

            let message

            // بررسی کدهای وارد شده و نمایش پیام موفقیت یا خطا
            if (captchaCode === 'CAPTCHA' && smsCode === '1234') {
                message = document.createElement('div')
                message.classList.add('message', 'success')
                message.innerHTML = `<img src="assets/images/check.png" alt="موفقیت" /><span>سفارش با موفقیت ثبت شد!</span>`
    } else {
        message = document.createElement('div')
        message.classList.add('message', 'error')
        message.innerHTML = `<img src="assets/images/close.png" alt="خطا" /><span>کدهای وارد شده نادرست هستند.</span>`
    }

            // اضافه کردن پیام به ابتدای باکس پیام‌ها
            messagesBox.prepend(message)

            // مخفی کردن یا نمایش متن "هیچ پیامی وجود ندارد"
            const noMessageExist = document.querySelector('.no-message-exist')
            if (messagesBox.querySelector('.message')) {
                noMessageExist.style.display = 'none' // اگر پیامی وجود داشت، مخفی کردن متن
            }

            // پاک کردن فیلدهای کپچا و کد پیامکی
            captchaInput.value = ''
            smsInput.value = ''
        })

        // تابع برای به‌روزرسانی ساعت
        function updateClock() {
            const now = new Date()
            let hours = now.getHours().toString().padStart(2, '0')
            let minutes = now.getMinutes().toString().padStart(2, '0')
            document.getElementById('clock').textContent = `${hours}:${minutes}`
        }

        // به‌روزرسانی ساعت هر ۱ ثانیه
        setInterval(updateClock, 1000)
        updateClock()


    }



    async function mainLoop() {
        await Start();
    }
    mainLoop().then(() => console.log("Loop completed"))

})();