function savewheel() {
    let c = window.localStorage.getItem("wheels")
    if (!c){
        c="[]"
    }
    let wheels = JSON.parse(c)
    w = document.getElementById("title").value
    if (w.length==0) {
        return
    }
    if (!wheels.includes(w)) {
        wheels.push(w)
    }
    window.localStorage.setItem("wheels", JSON.stringify(wheels))

    let items = []
    for (const li of document.getElementById("items").childNodes) {
        items.push({val: li.childNodes[0].textContent, occ: li.childNodes[1].textContent})
    }
    window.localStorage.setItem(w, JSON.stringify(items))
    loadwheels()
}

function loadwheels() {
    let list = document.getElementById("wheel")
    list.innerHTML = ""
    let c = window.localStorage.getItem("wheels")
    if (!c){
        let li = document.createElement("li")
        li.textContent = "None Available"
        list.appendChild(li)
        return
    }
    let wheels = JSON.parse(c)
    for (const i of wheels) {
        let li = document.createElement("li")
        let a = document.createElement("a")
        a.href="#"+i
        a.textContent = i
        a.onclick = function() {loadwheel(i)}
        li.appendChild(a)
        list.appendChild(li)
    }
}

function additem() {
    let i = document.getElementById("newitem")
    if (i.value.length==0) {
        return
    }
    loaditem(i.value, "0")
    i.value = ""
    i.focus()
}

function loaditem(i, n) {
    let li = document.createElement("li")
    li.textContent = i
    li.style = "width: 50%;"
    document.getElementById("items").appendChild(li)
    let s = document.createElement("span")
    s.textContent = n
    s.hidden = true
    li.appendChild(s)
    let b = document.createElement("button")
    b.textContent = "Del"
    b.style = "margin-left: 20%"
    li.appendChild(b)
    b.onclick = function() {
        document.getElementById("items").removeChild(li)
        activatespin()
    }
    activatespin()
}

function activatespin() {
    document.getElementById("spin").disabled = true
    if (document.getElementById("items").childElementCount > 0) {
        document.getElementById("spin").disabled = false
    }
}

function loadwheel(w) {
    let title = document.getElementById("title")
    title.value = w
    document.getElementById("items").innerHTML = ""
    let items = JSON.parse(window.localStorage.getItem(w))
    for (const i of items) {
        loaditem(i["val"], i["occ"])
    }
}

function spin() {
    let range = 0
    let ele = []
    for (const i of document.getElementById("items").childNodes) {
        let weight = 1.0/2**parseInt(i.childNodes[1].textContent)
        ele.push({val: i.childNodes[0].textContent, weight: weight, ele: i})
        range += weight
    }
    let rand = Math.random()*range
    for (const i of ele) {
        rand -= i["weight"]
        if (rand<=0) {
            if (confirm(i["val"])) {
                i.ele.childNodes[1].textContent = (Math.log2(1/i.weight)+1).toString()
                savewheel()
            }
            break
        }
    }
}

function importdata() {
    let data = window.prompt("Enter copied storage (will overwrite storage)", "")
    if (data === "{}") {
        window.localStorage.clear()
    }
    try {
        data = JSON.parse(data)
        Object.keys(data).forEach(function (k) {
            console.log(k)
            console.log(data[k])
            window.localStorage.setItem(k, JSON.stringify(data[k]));
        });
    } catch (e) {
        console.log(e)
    }
    loadwheels()
}

function exportdata() {
    let d = {}
    d["wheels"] = JSON.parse(window.localStorage.getItem("wheels"))
    for (const i of d.wheels) {
        d[i] = JSON.parse(window.localStorage.getItem(i))
    }
    alert(JSON.stringify(d))
}
