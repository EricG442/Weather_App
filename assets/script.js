// getting some elements from the DOM that I will reference more often such as the input form as well as the 'search' button
let buttonContainer = document.getElementById('buttonCont');
let search = document.getElementById('searchButton');
let input = document.getElementById('userInput');
let apiID = 'a3a448809ba0d58d24883ea16e8349fb';
let query = input.value;

const changeBackground = () => {
// use a switch case statement later to dynamically change the background color
}


// this function takes in input which is the city name the user provides in the input form and uses it for the get request URL,
// the function returns a promise which resolves with the a property from the ajax response. have to use this response to get the
// the geographical coordinates to be able to use the second part of the app
const func = (input) => {
    let apiURL = 'https://api.openweathermap.org/data/2.5/weather?'

    return new Promise((resolve, reject) => {
        let params = $.param({
            q: input,
            appid: apiID
        });

        $.ajax({
            method: 'GET',
            url: apiURL + params
        })
        .then(res => {resolve(res.coord)})
    })
}

// this function takes an input, which is the above funcitons output, and makes another ajax get request to get the 7 day forecast
// same as the above function aswell, just returns a promise with the whole ajax response this time
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

// this is the main function that renders the 5 current forecast tiles, first declaring the array to worked on which is the response from the above functions promise, 
// then using a for loop to get the unix timestamp from the array and using the js Date object to convert the timestamp into human readable time
// the time does not change for timezone, I think I would need to add the hours here, maybe another switchcase? I think Date obj has something
const main = (res) => {
    let array = res.hourly;

    for(let i = 0; i < 5; i++) {
        
        // this is taking the timestamp and multiplying it by 1000 so it is in miliseconds instead of seconds
        // then creating the Date object with the product of the timestamp, then using built in methods to get the hour number
        // then using in if statement to determine which suffix to use for the time i.e '12pm', '12am'
        // then taking the remainder of the from the hour divided by 12 to turn it from 24 hour to 12 hour times
        // finally if hour equals 0 it means 12am so return 12 else if hour anything other than 0 return the hour
        let timestamp = array[i].dt * 1000,
            date = new Date(timestamp),
            hour = date.getHours(),
            ampm = hour >= 12 ? 'pm' : 'am';
            hour = hour % 12;
            hour  = hour ? hour : 12;
        console.log(date.getHours());
        changeBackground(date.getHours());

        let temp = Math.floor(array[i].temp),
            descrip = array[i].weather[0].description,
            iconURL = 'https://openweathermap.org/img/wn/';
        
        let index = i + 1,
            id = `#weatherContainer${index}`;
        iconURL += array[i].weather[0].icon + '.png';

        $(`${id} div:nth-child(1)`).children().attr('src', iconURL);
        $(`${id} p:nth-child(2)`).text(`${hour} ${ampm}`);
        $(`${id} p:nth-child(3)`).text(`${temp}° F`);
        $(`${id} p:nth-child(4)`).text(descrip);
        
    }

    return res.daily;
}

const renderForecast = (response) => {
    
    // using another for loop like in the above function to correctly get the response data in the right format
    // using to new arrays with all month and day names to display
    for(let i = 1; i < 8; i++) {
        let array = response[i],
            timestamp = array.dt * 1000,
            date = new Date(timestamp),
            monthsArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            daysArray = ['Sun', 'Mon', 'Tue', 'Wed', 'Thus', 'Fri', 'Sat'],
            newDate = `${monthsArray[date.getMonth()]} ${date.getDate()} ${daysArray[date.getDay()]}`,
            descrip = array.weather[0].description,
            min = Math.floor(array.temp.min),
            max = Math.floor(array.temp.max);

        // using the index from the loop to get the id for each of the container to render the data and also declaring the first part of a ajax get URL
        let containerID = `#forecastContainer${i}`,
            iconURL = 'https://openweathermap.org/img/wn/';
        
        // declaring each element with jQuery DOM tarversal to display the data to use just further down
        let imgElem = $(containerID).children(':first-child').children(),
            headerContainer = $(containerID).children('.forecastHeader'),
            levelContainer = $(containerID).children('.levelContainer'),
            header1 = headerContainer.children(':first-child'),
            header2 = headerContainer.children(':last-child'),
            minContainer = levelContainer.children().children(':first-child').children(),
            maxContainer = levelContainer.children().children(':last-child').children();

        // here just setting the data into the elements to display
        iconURL += array.weather[0].icon + '.png';
        imgElem.attr('src', iconURL);
        header1.text(newDate);
        header2.text(descrip);
        minContainer.text(`${min}° F`);
        maxContainer.text(`${max}° F`);

    }
};

// this function takes the users input, which should be a city name, and calls the first function and starts the 'then' chain to send the requests and render the data
// finally the '.catch' will log any errors to the console
const getWeather = (cityName) => {
    func(cityName)
        .then(res => getRequest2(res))
        .then(res => main(res))
        .then(res => renderForecast(res))
        .catch(err => console.log(err));
};

// this function is what adds new buttons onto the web page which is the users search history
const addButton = (userQuery) => {

    // creating a new button element with jQuery and giving it a class attribute, then giving it an onclick method to handle click events
    // and lastly giving it the input value to display then appending it to the container
    let newButton = document.createElement('button');
    newButton.className = 'button is-link';
    newButton.onclick = () => {
        getWeather(newButton.innerHTML);
    };
    newButton.innerHTML = userQuery;
    buttonContainer.appendChild(newButton);
};

search.addEventListener('click', () => { 
    let searchQuery = input.value;

    getWeather(searchQuery);

    addButton(searchQuery);
});