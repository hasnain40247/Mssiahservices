

const tabs=document.querySelectorAll('[data-tab-target]')
const tabContents=document.querySelectorAll('[data-tab-content]')
tabs.forEach(element=>{
 element.addEventListener('click',()=>{
     const target=document.querySelector(element.dataset.tabTarget);
     tabContents.forEach(tabContent=> {
         tabContent.classList.remove('active')
     })
     tabs.forEach(tab=> {
        tab.classList.remove('active')
    })
element.classList.add('active')
     target.classList.add('active')

 })
})