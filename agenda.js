//SortableJS setup
const dragArea = document.querySelector('.wrapper')
new Sortable(dragArea, {
    animation: 350,
    handle: ".icon",
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    filter: '.disabled',
    draggable: '.item',
    removeOnSpill: true
})

// if a file is dragged on the body area, it will be removed
const dropArea = document.querySelector('body')
dropArea.addEventListener('dragover', () => {
    dropArea.classList.add('dragover')
})
dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover')
})

// this event to fire to recalculate the timmings after rearranging the list
document.addEventListener('dragend', () => {
    adjustTime()
})

// button to add an agenda item
let addButton = document.querySelector('#add-button')
addButton.addEventListener('click', () => {
    let condition = false
    openModal(condition)
})
//duplicate item on add button
let draggedId
addButton.addEventListener('drop', function (e) {
    duplicateItem(draggedId)
})

//break button
let breakButton = document.querySelector('#break-button')
breakButton.addEventListener('click', () => {
    addBreak()
})

//upload button: there are two buttons:
// - one for the real input (can't be custom, so it's hidden)
// - second which is the button that will trigger the first one
let realUpload = document.querySelector('#upload-button-hidden')
realUpload.addEventListener('change', function () {
    let oldStuff = document.querySelectorAll('.item')
    oldStuff.forEach(item => item.remove())
    csvHandler(this)
})

let customUpload = document.querySelector('#upload-button')
customUpload.addEventListener('click', event => {
    realUpload.click()
})

//reader is the csv file handler
let reader = new FileReader()
reader.onload = function (e) {
    loadCsv(e)
}

// button to export the agenda as CSV
let exportButton = document.querySelector('#export-button')
exportButton.addEventListener('click', () => {
    exportCsv()
})

// Button to amend event details
let eventDetails = document.querySelector('#header-div')
eventDetails.addEventListener('click', () => {
    amendEventDetails(eventDetails)
})

// Modal for adding items
function openModal(condition, title, presenter, process, duration, itemId) {

    //if condition is false, the form will be empty
    if (!condition) {
        title = ''
        presenter = ''
        process = ''
        duration = ''
    }

    //Modal builds & selectors declaration
    showModal()
    let contentDiv = document.querySelector('.modal-content')
    let window = document.querySelector('#modal')
    let bg = document.querySelector('.modal-bg')

    //Form
    let formTitle = document.createElement('p')
    formTitle.setAttribute('class', 'form-title')
    formTitle.innerHTML = 'Add new agenda item'
    contentDiv.appendChild(formTitle)

    let titleField = document.createElement('input')
    titleField.setAttribute('id', 'title-field')
    titleField.setAttribute('class', 'form')
    titleField.setAttribute('placeholder', 'Section Name')
    titleField.value = title
    contentDiv.appendChild(titleField)

    let presenterField = document.createElement('input')
    presenterField.setAttribute('id', 'presenter-field')
    presenterField.setAttribute('class', 'form')
    presenterField.setAttribute('placeholder', 'Presenters, separated by semicolon')
    presenterField.value = presenter
    contentDiv.appendChild(presenterField)

    let processField = document.createElement('textarea')
    processField.setAttribute('id', 'process-field')
    processField.setAttribute('class', 'form')
    processField.setAttribute('placeholder', 'Process description')
    processField.value = process
    contentDiv.appendChild(processField)

    let durationDiv = document.createElement('div')
    durationDiv.setAttribute('class', 'time-duration-div')
    contentDiv.appendChild(durationDiv)

    let durationField = document.createElement('input')
    durationField.setAttribute('id', 'duration-field')
    durationField.setAttribute('class', 'form')
    durationField.setAttribute('type', 'number')
    durationField.setAttribute('min', '0')
    durationField.setAttribute('placeholder', 'Duration (min)')
    durationField.setAttribute('step', '5')
    durationField.value = duration
    durationDiv.appendChild(durationField)

    let okButton = document.createElement('button')
    okButton.setAttribute('class', 'button')
    okButton.setAttribute('id', 'ok-button')
    okButton.innerHTML = 'Accept'
    durationDiv.appendChild(okButton)

    okButton.onclick = function () {

        let title = document.querySelector('#title-field').value
        let presenter = document.querySelector('#presenter-field').value
        let process = document.querySelector('#process-field').value
        let duration = document.querySelector('#duration-field').value

        //check if the id exists, if not, that's a new item
        if (!itemId) {
            addAgenda(title, presenter, process, duration)
        } else {
            //if it's an update, then replace the items
            let toUpdate = document.querySelector(`#${CSS.escape(itemId)}`)
            let updatedTitle = toUpdate.getElementsByClassName('session-title')[0]
            updatedTitle.innerHTML = title

            let updatedPresenter = toUpdate.getElementsByClassName('session-presenter')[0]
            updatedPresenter.innerHTML = presenter

            let updatedProcess = toUpdate.getElementsByClassName('process')[0]
            updatedProcess.innerHTML = process

            let updatedDuration = toUpdate.getElementsByClassName('duration')[0]
            updatedDuration.innerHTML = `${duration} min`
        }
        window.innerHTML = ''
        bg.classList.remove('bg-active')
        adjustTime()
    }
}

//add agenda item
function addAgenda(title, presenter, process, duration, itemId) {
    //calculate the id of the item
    if (itemId == undefined) {
        itemId = document.querySelectorAll('.item').length
    }

    let wrapper = document.querySelector('.wrapper')
    let addButton = document.querySelector('#button-container')

    let item = document.createElement('div')
    item.setAttribute('class', 'item')
    item.setAttribute('id', itemId)
    wrapper.insertBefore(item, addButton)

    let contentDiv = document.createElement('div')
    contentDiv.setAttribute('class', 'content-div')
    item.appendChild(contentDiv)

    let sessionTitle = document.createElement('p')
    sessionTitle.setAttribute('class', 'session-title')
    sessionTitle.innerHTML = title
    contentDiv.appendChild(sessionTitle)

    let sessionPresenter = document.createElement('p')
    sessionPresenter.setAttribute('class', 'session-presenter')
    sessionPresenter.innerHTML = presenter
    contentDiv.appendChild(sessionPresenter)

    let sessionProcess = document.createElement('p')
    sessionProcess.setAttribute('class', 'process')
    sessionProcess.innerHTML = process
    contentDiv.appendChild(sessionProcess)

    let durationDiv = document.createElement('div')
    durationDiv.setAttribute('class', 'duration-div')
    item.appendChild(durationDiv)

    let clockIcon = document.createElement('span')
    clockIcon.setAttribute('class', 'material-icons')
    clockIcon.setAttribute('id', 'clock')
    clockIcon.innerHTML = ' schedule '
    durationDiv.appendChild(clockIcon)

    //default value for duration: 10min
    if (duration == '') {
        duration = 10
    }
    let durationTime = document.createElement('p')
    durationTime.setAttribute('class', 'duration')
    durationTime.innerHTML = `${duration} min`
    durationDiv.appendChild(durationTime)

    let sessionTime = document.createElement('p')
    sessionTime.setAttribute('class', 'time')
    sessionTime.innerHTML = '00:00 - 00:00'
    durationDiv.appendChild(sessionTime)

    let iconDiv = document.createElement('div')
    iconDiv.setAttribute('class', 'icon-div')
    item.appendChild(iconDiv)

    let handleIcon = document.createElement('span')
    handleIcon.setAttribute('class', 'icon material-icons')
    handleIcon.innerHTML = 'drag_handle'
    iconDiv.appendChild(handleIcon)

    adjustTime()

    item.addEventListener('click', () => {
        let condition = true

        let itemId = item.id
        let title = item.getElementsByClassName('session-title')[0].innerHTML
        let presenter = item.getElementsByClassName('session-presenter')[0].innerHTML
        let process = item.getElementsByClassName('process')[0].innerHTML
        let duration = parseInt(item.getElementsByClassName('duration')[0].innerHTML.split(' ')[0])
        openModal(condition, title, presenter, process, duration, itemId)
    })

    //this is used to duplicate the item
    item.addEventListener('dragstart', () => {
        draggedId = itemId
    })
}

//export to CSV
function exportCsv() {

    let items = document.querySelectorAll('.item')
    let csvColumns = ['Session Title', 'Presenters', 'Process', 'Duration', 'Time']
    let csv = [];
    csv.push(csvColumns)

    items.forEach(item => {
        let node = item.querySelectorAll('.session-title, .break-title, .session-presenter, .process, .duration, .time') //list all classes to be selected
        let arraysToJoin = []
        node.forEach(text => {
            let newText = text.innerHTML
            newText = newText.replace(/(\r\n|\n|\r)/gm, '')
            newText = newText.split(',')
            newText = newText.join('; ')
            newText = newText.replace('  ', ' ')
            arraysToJoin.push(newText)
        })
        let joinedArray = arraysToJoin.join(',')
        csv.push(joinedArray)
    })
    csv = csv.join('\n')

    // Download it
    let eventName = document.querySelector('#session-name').innerHTML
    let clientName = document.querySelector('#client-name').innerHTML

    let filename = `${eventName} - ${clientName} - Agenda.csv`;
    let link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

//function to adjust the start and end time of each item of the agenda
function adjustTime() {
    let startTime = document.querySelector('#session-time').innerHTML.split(' ').pop().replace('h', '')
    let allItems = document.querySelectorAll('.item')

    for (let i = 0; i < allItems.length; i++) {

        let itemTime = allItems[i].querySelector('.time')

        let sessionDuration = allItems[i].querySelector('.duration').innerHTML.split(' ')[0]
        let startTimeInMinutes = timeToMinutes(startTime)

        let sessionStart = `${startTime}h`
        let sessionEnd = minutesToHours(parseInt(startTimeInMinutes) + parseInt(sessionDuration))

        itemTime.innerHTML = `${sessionStart} - ${sessionEnd}h`

        startTime = sessionEnd
    }
}

// fucntion to convert time to minutes (from string)
function timeToMinutes(time) {
    let splitTime = time.split(':')
    let h = parseInt(splitTime[0]) * 60
    let m = parseInt(splitTime[1])
    return h + m
}
// function to convert minutes (as integer) to hours (as string)
function minutesToHours(minutes) {
    let h = Math.floor(minutes / 60)
    if (h < 9) {
        h = '0' + h
    }
    let m = minutes % 60
    if (m < 9) {
        m = '0' + m
    }
    return `${h}:${m}`
}

//function to amend the main event details
function amendEventDetails(details) {
    //parsing the event details
    let eventName = details.querySelector('#session-name')
    let clientName = details.querySelector('#client-name')
    let sessionTime = details.querySelector('#session-time').innerHTML.split(' ')[4]

    //show modal
    showModal()
    let contentDiv = document.querySelector('.modal-content')
    let window = document.querySelector('#modal')
    let bg = document.querySelector('.modal-bg')

    //Form
    let formTitle = document.createElement('p')
    formTitle.setAttribute('class', 'form-title')
    formTitle.innerHTML = 'Event Settings'
    contentDiv.appendChild(formTitle)

    let eventNameField = document.createElement('input')
    eventNameField.setAttribute('id', 'event-name-field')
    eventNameField.setAttribute('class', 'form')
    eventNameField.setAttribute('placeholder', 'Event Name')
    eventNameField.value = eventName.innerHTML
    contentDiv.appendChild(eventNameField)

    let clientNameField = document.createElement('input')
    clientNameField.setAttribute('id', 'clent-name-field')
    clientNameField.setAttribute('class', 'form')
    clientNameField.setAttribute('placeholder', 'Event Name')
    clientNameField.value = clientName.innerHTML
    contentDiv.appendChild(clientNameField)

    let timeDiv = document.createElement('div')
    timeDiv.setAttribute('id', 'event-time-div')
    contentDiv.appendChild(timeDiv)

    let timeLabel = document.createElement('p')
    timeLabel.setAttribute('id', 'time-label')
    timeLabel.innerHTML = 'Set the session time HH:mm'
    timeDiv.appendChild(timeLabel)

    let sessionHourField = document.createElement('input')
    sessionHourField.setAttribute('id', 'hour-field')
    sessionHourField.setAttribute('class', 'form')
    sessionHourField.setAttribute('type', 'number')
    sessionHourField.setAttribute('max', '23')
    sessionHourField.setAttribute('min', '0')
    sessionHourField.setAttribute('placeholder', 'HH')
    sessionHourField.value = sessionTime.split(':')[0]
    timeDiv.appendChild(sessionHourField)

    let sessionMinuteField = document.createElement('input')
    sessionMinuteField.setAttribute('id', 'minute-field')
    sessionMinuteField.setAttribute('class', 'form')
    sessionMinuteField.setAttribute('type', 'number')
    sessionMinuteField.setAttribute('placeholder', 'mm')
    sessionMinuteField.setAttribute('max', '59')
    sessionMinuteField.setAttribute('step', '5')
    sessionMinuteField.setAttribute('min', '0')
    sessionMinuteField.value = sessionTime.split(':')[1].replace('h', '')
    timeDiv.appendChild(sessionMinuteField)

    let okButton = document.createElement('button')
    okButton.setAttribute('class', 'button')
    okButton.setAttribute('id', 'ok-button')
    okButton.innerHTML = 'Accept'
    contentDiv.appendChild(okButton)

    okButton.addEventListener('click', () => {

        sessionTime = details.querySelector('#session-time')
        let sessionH = sessionHourField.value
        if (sessionH < 9 && sessionH >= 1) {
            sessionH = parseInt(sessionH)
            sessionH = `0${sessionH}`
        }
        let sessionM = sessionMinuteField.value
        if (sessionM < 9 && sessionM >= 1) {
            sessionM = parseInt(sessionM)
            sessionM = `0${sessionM}`
        }

        eventName.innerHTML = eventNameField.value
        clientName.innerHTML = clientNameField.value
        sessionTime.innerHTML = `The session starts at ${sessionH}:${sessionM}`

        window.innerHTML = ''
        bg.classList.remove('bg-active')
        adjustTime()

    })
}

//function to show the Modal
function showModal() {
    let window = document.querySelector('#modal')
    let bg = document.querySelector('.modal-bg')

    bg.classList.add('bg-active')

    let contentDiv = document.createElement('div')
    contentDiv.setAttribute('class', 'modal-content')
    window.appendChild(contentDiv)

    let xClose = document.createElement('span')
    xClose.innerHTML = 'cancel'
    xClose.setAttribute('class', 'close material-icons')
    contentDiv.appendChild(xClose)
    xClose.addEventListener('click', function () {
        window.innerHTML = ''
        bg.classList.remove('bg-active')
    })
}

//create an agenda break
function addBreak(title, duration) {

    if (title == null) {
        title = 'Break'
    }

    if (duration == null) {
        duration = `10 min`
    }

    let wrapper = document.querySelector('.wrapper')
    let addButton = document.querySelector('#button-container')

    let itemId = document.querySelectorAll('.item').length
    if (itemId == undefined) {
        itemId = '0'
    }

    let item = document.createElement('div')
    item.setAttribute('class', 'item break')
    item.setAttribute('id', itemId)
    wrapper.insertBefore(item, addButton)

    let contentDiv = document.createElement('div')
    contentDiv.setAttribute('class', 'break-content-div')
    item.appendChild(contentDiv)

    let coffeeIcon = document.createElement('span')
    coffeeIcon.setAttribute('class', 'break material-icons')
    coffeeIcon.innerHTML = 'emoji_food_beverage'
    contentDiv.appendChild(coffeeIcon)

    let breakTitle = document.createElement('p')
    breakTitle.setAttribute('class', 'break-title')
    breakTitle.innerHTML = title
    contentDiv.appendChild(breakTitle)

    let durationDiv = document.createElement('div')
    durationDiv.setAttribute('class', 'duration-div')
    item.appendChild(durationDiv)

    let durationTime = document.createElement('p')
    durationTime.setAttribute('class', 'duration')
    durationTime.innerHTML = duration
    durationDiv.appendChild(durationTime)

    let sessionTime = document.createElement('p')
    sessionTime.setAttribute('class', 'time')
    sessionTime.innerHTML = '00:00 - 00:00'
    durationDiv.appendChild(sessionTime)

    let iconDiv = document.createElement('div')
    iconDiv.setAttribute('class', 'icon-div')
    item.appendChild(iconDiv)

    let handleIcon = document.createElement('span')
    handleIcon.setAttribute('class', 'icon material-icons')
    handleIcon.innerHTML = 'drag_handle'
    iconDiv.appendChild(handleIcon)

    item.addEventListener('click', () => {

        let title = breakTitle.innerHTML
        let duration = parseInt(durationTime.innerHTML.replace(' min', ''))

        //open Modal
        showModal()
        let contentDiv = document.querySelector('.modal-content')
        let window = document.querySelector('#modal')
        let bg = document.querySelector('.modal-bg')

        //Form
        let formTitle = document.createElement('p')
        formTitle.setAttribute('class', 'form-title')
        formTitle.innerHTML = 'Break details'
        contentDiv.appendChild(formTitle)

        let breakField = document.createElement('input')
        breakField.setAttribute('id', 'break-field')
        breakField.setAttribute('class', 'form')
        breakField.setAttribute('placeholder', 'Break')
        breakField.value = title
        contentDiv.appendChild(breakField)

        let sessionMinuteField = document.createElement('input')
        sessionMinuteField.setAttribute('id', 'break-minute-field')
        sessionMinuteField.setAttribute('class', 'form')
        sessionMinuteField.setAttribute('type', 'number')
        sessionMinuteField.setAttribute('placeholder', 'mm')
        sessionMinuteField.setAttribute('max', '120')
        sessionMinuteField.setAttribute('step', '5')
        sessionMinuteField.setAttribute('min', '0')
        sessionMinuteField.value = duration
        contentDiv.appendChild(sessionMinuteField)

        let okButton = document.createElement('button')
        okButton.setAttribute('class', 'button')
        okButton.setAttribute('id', 'ok-button')
        okButton.innerHTML = 'Accept'
        contentDiv.appendChild(okButton)

        //add functionality for the OK button
        okButton.addEventListener('click', () => {

            let toUpdate = document.querySelector(`#${CSS.escape(itemId)}`)
            let updatedTitle = toUpdate.getElementsByClassName('break-title')[0]
            updatedTitle.innerHTML = breakField.value

            let updatedDuration = toUpdate.getElementsByClassName('duration')[0]
            updatedDuration.innerHTML = `${sessionMinuteField.value} min`

            window.innerHTML = ''
            bg.classList.remove('bg-active')
            adjustTime()
        })
    })

    //this is used to duplicate the item
    item.addEventListener('dragstart', () => {
        draggedId = itemId
    })
    adjustTime()
}

function duplicateItem(draggedId) {
    let originalId = document.querySelector(`#${CSS.escape(draggedId)}`)

    //check if the class is the same as the breaks
    if (originalId.className !== 'item break sortable-chosen sortable-ghost') {

        let allItems = document.querySelectorAll('.item').length
        let title = originalId.querySelector('.session-title').innerHTML
        let presenter = originalId.querySelector('.session-presenter').innerHTML
        let process = originalId.querySelector('.process').innerHTML
        let duration = originalId.querySelector('.duration').innerHTML
        let itemId = allItems

        addAgenda(title, presenter, process, duration, itemId)
    }
}

function csvHandler(input) {
    const csv = input.files[0]
    reader.readAsText(csv)
}

function loadCsv(e) {
    let loadedCsv = e.target.result
    let breakLines = loadedCsv.split('\n')

    //load the event event details
    let eventName = document.querySelector('#session-name')
    let clientName = document.querySelector('#client-name')
    let sessionTime = document.querySelector('#session-time')

    let fileName = document.getElementById('upload-button-hidden').value.split(/(\\|\/)/g).pop()
    let csvEventName = fileName.split(' - ')[0]
    let csvClientName = fileName.split(' - ')[1]
    let csvStartTime = breakLines[1].split(',')[4].split(' - ')[0]

    eventName.innerHTML = csvEventName
    clientName.innerHTML = csvClientName
    sessionTime.innerHTML = `The session starts at ${csvStartTime}`

    //add the agenda items
    for (let i = 1; i < breakLines.length; i++) {

        //break the lines
        let item = breakLines[i].split(',')

        //check if the item is a break
        let checkNumber = parseInt(item[1].split(' ')[0])
        let checkMin = item[1].split(' ')[1]

        //if the item is a break
        if (!isNaN(checkNumber) && checkMin == 'min') {
            addBreak(item[0], item[1])
            adjustTime()
        } else {
            addAgenda(item[0], item[1], item[2], parseInt(item[3].split(' ')[0]))
            adjustTime()
        }
    }
}