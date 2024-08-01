// Importing https from node.js' standard library to make HTTPS requests
import https from 'https';

// Importing fs (File System) from node.js' standard library to interact with the file system
import fs from 'fs';

// Defining the API endpoint to fetch the picture of the day from NASA's API
const API_URL = "https://api.nasa.gov/planetary/apod";

// Defining the path where the picture of the day will be stored
const IMAGE_PATH = "picture-of-the-day.jpg";

// Function to fetch the picture of the day from NASA's API
async function getPictureOfTheDay() {
  // Creating a new Promise to handle the async nature of the request --> allows code to continue before getting response
  return new Promise((resolve, reject) => {
    // Making a GET request to the NASA API
    https.get(`${API_URL}?api_key=YOURKEYGOESHERE`, res => {
      // Checking if the response status code is not 200 (OK)
      if (res.statusCode !== 200) { //response
        // If it's not 200, reject the promise with an error
        reject(new Error(`Failed to fetch the picture of the day. Status code: ${res.statusCode}`));
      }
  
      // Variable to accumulate the data from the response
      let data = "";
      // Event listener for the "data" event to accumulate chunks of data
      res.on("data", chunk => { // read data
        data += chunk; //add to chunk
      });
  
      // Event listener for the "end" event to parse the accumulated data as JSON
      res.on("end", () => { //This method sets up a listener for the "end" event. The "end" event is emitted when there is no more data to be consumed from the response.
        try {
          data = JSON.parse(data);
        } catch (err) {
          // If JSON parsing fails, reject the promise with an error
          reject(new Error("Failed to parse the JSON response from the API."));
        }
        // If everything goes well, resolve the promise with the parsed data
        resolve(data);
      });
    // Event listener for the "error" event to reject the promise with the error
    }).on("error", err => {
      reject(err);
    });
  });
}

// Call the function to get the picture of the day
getPictureOfTheDay().then(data => {
  // Extract the image URL from the response data
  const imageUrl = data.url;
  // Make a GET request to the image URL
  https.get(imageUrl, res => {
    // Create a writable file stream to the image path
    const fileStream = fs.createWriteStream(IMAGE_PATH);
    // Pipe the response into the file stream to download the image
    res.pipe(fileStream);
    // Event listener for the "finish" event to set the downloaded image as the desktop background
    fileStream.on("finish", async () => {
      console.log("The image was successfully downloaded.");
      
      // Dynamically import the 'wallpaper' module to set the desktop background
      const wallpaperModule = await import('wallpaper');
      await wallpaperModule.setWallpaper(IMAGE_PATH);
      
      console.log("The image was set as the desktop background.");
    });
  // Event listener for the "error" event to log the error if the image download fails
  }).on("error", err => {
    console.error("Failed to download the image.", err);
  });
// Catch any error that might occur while fetching the picture of the day and log it
}).catch(err => {
  console.error("An error occurred while fetching the picture of the day.", err);
});


const wallpaperModule = await import('wallpaper');
console.log(wallpaperModule);

// Check rate limit - not working
//console.log('Rate Limit:', res.headers['x-ratelimit-limit']);
//console.log('Rate Limit Remaining:', res.headers['x-ratelimit-remaining']);

/*
.---.                                                      
|   |                                                      
'---'      __.....__              __  __   ___             
.---.  .-''         '.           |  |/  `.'   `.           
|   | /     .-''"'-.  `. .-,.--. |   .-.  .-.   '          
|   |/     /________\   \|  .-. ||  |  |  |  |  |          
|   ||                  || |  | ||  |  |  |  |  |          
|   |\    .-------------'| |  | ||  |  |  |  |  |          
|   | \    '-.____...---.| |  '- |  |  |  |  |  |          
|   |  `.             .' | |     |__|  |__|  |__|          
__.'   '    `''-...... -'| |                               
|      '                 |_|                               
|____.'                                                        
*/
