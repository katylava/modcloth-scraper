const nightmare = require('nightmare')({ show: true })

require('dotenv').config()


function nextPage(url) {
  return function(nightmare) {
    if (!url) {
      return nightmare.end()
    }

    nightmare
      .goto(url)
      .wait('.love-item-title')
      .evaluate(() => {
        let items = []
        const $items = document.querySelectorAll('.product-tile')

        $items.forEach($item => {
          const badge = $item.querySelector('.product-badge')

          if (badge && badge.innerText === 'Out of Stock') {
            return
          }

          const pricing = $item.querySelector('.product-pricing')

          if (pricing.childElementCount < 2) {
            return
          }

          items.push({
            img: $item.querySelector('img').getAttribute('src'),
            href: $item.querySelector('.product-name a').getAttribute('href'),
            name: $item.querySelector('.product-name a').innerText,
            price: $item.querySelector('.product-pricing').innerText,
          })
        })

        return items
      })
      .then(console.log) // eslint-disable-line no-console
      .then(() => {
        return nightmare
          .evaluate(() => {
            const nextLink = document.querySelector('a.page-next')
            let url = nextLink.getAttribute('href')

            if (nextLink.parentNode.getAttribute('class').indexOf('disabled') !== -1) {
              url = null
            }

            return url
          })
      })
      .then(nextPage)
  }
}


nightmare
  .viewport(1280, 800)
  .goto('https://www.modcloth.com/account')
  .type('#dwfrm_login_username', process.env.MODCLOTH_EMAIL)
  .type('#dwfrm_login_password', process.env.MODCLOTH_PASSWORD)
  .click('button[name="dwfrm_login_login"]')
  .wait('ul.customer-registered')
  .use(nextPage('https://www.modcloth.com/account/lovelist'))
