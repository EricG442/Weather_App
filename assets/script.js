let buttonContainer = document.getElementById('buttonCont');
let search = document.getElementById('searchButton');
let input = document.getElementById('userInput');
let apiID = 'a3a448809ba0d58d24883ea16e8349fb';

let getRequest1 = new Promise((resolve, reject) => {
    let baseURL = 'https://api.openweathermap.org/data/2.5/weather?';
    
    let params = $.param({
        q: input.value,
        appid: apiID
    });

    $.ajax({
        method: 'GET',
        url: baseURL + params
    })
    .then(res => {resolve(res.coord)})
})

const getRequest2 = (res) => {
    let long = res.lon,
        lati = res.lat;

    let promise = new Promise((resolve, reject) => {
        let baseURL = 'https://api.openweathermap.org/data/2.5/onecall?';

        let params = $.param({
            lat: lati,
            lon: long,
            exclude: 'minutely',
            units: 'imperial',
            appid: apiID
        });

        $.ajax({
            method: 'GET',
            url: baseURL + params
        }).then(res => {resolve(res)})
    })

    return promise;
};

const main = (res) => {
    let array = res.hourly;

    for(let i = 0; i < 5; i++) {
        let timestamp = array[i].dt * 1000,
            date = new Date(timestamp),
            hour = date.getHours(),
            ampm = hour >= 12 ? 'pm' : 'am';
            hour = hour % 12;
            hour  = hour ? hour : 12;

        console.log(hour, ampm);
    }
}

const addButton = () => {
    let userQuery = input.value;
    
    let newButton = document.createElement('button');
    newButton.className = 'button is-link';
    newButton.innerHTML = userQuery;
    buttonContainer.appendChild(newButton);
};

search.addEventListener('click', () => { 
    getRequest1
        .then(res => getRequest2(res))
        .then(res => main(res));

    addButton();
});