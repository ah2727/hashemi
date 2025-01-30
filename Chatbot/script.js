document.addEventListener('DOMContentLoaded', () => {
  // انتخاب المان‌های مختلف صفحه
  const searchButton = document.querySelector('.search-button')
  const itemsBox = document.querySelector('.items-box')
  const captchaBox = document.querySelector('.captcha-box') // باکس کپچا
  const smsButton = document.querySelector('.sms-btn') // دکمه دریافت کد پیامکی
  const orderButton = document.querySelector('.submit-btn') // دکمه ثبت سفارش
  const messagesBox = document.querySelector('.messages-content') // باکس پیام‌ها
  const popupButton = document.querySelector('#open-popup') // دکمه باز کردن پاپ‌آپ
  const popup = document.querySelector('.popup') // پاپ‌آپ
  const captchaInput = captchaBox.querySelector('input') // فیلد کد امنیتی
  const smsInput = captchaBox.querySelectorAll('input')[1] // فیلد کد پیامکی
  const closePopupButton = popup.querySelector('.close-popup') // دکمه بستن پاپ‌آپ

  // مخفی کردن باکس آیتم‌ها و باکس کپچا در شروع
  itemsBox.style.opacity = '0'
  itemsBox.style.transform = 'translateY(-20px)'
  itemsBox.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out'
  itemsBox.style.display = 'none'

  captchaBox.style.display = 'none' // مخفی کردن باکس کپچا در ابتدا
  popup.style.display = 'none' // مخفی کردن پاپ‌آپ در ابتدا

  let searching = false // متغیر برای بررسی وضعیت جستجو
  let isSmsCooldown = false // برای مدیریت وضعیت دکمه ارسال کد پیامکی

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
  })

  // مدیریت انتخاب آیتم
  itemsBox.addEventListener('click', (event) => {
    if (event.target && event.target.matches('.item')) {
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
  smsButton.addEventListener('click', () => {
    if (isSmsCooldown) return // اگر هنوز در حال شمارش هستیم، اجازه کلیک نمی‌دهیم

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
