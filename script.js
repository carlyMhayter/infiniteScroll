const imageContainer = document.querySelector(".image-container");

const loader = document.getElementById("loader");
const colorIcon = document.getElementById("color-icon");

const apiKeyImagga = "acc_38e3d7daa190425";
const apiSecretImagga = "7b801be296fac0cec59a7f96f1f10917";

//initialize variables
let ready = false;
let imagesLoaded = 0;
let totalImages = 0;
let photoArray = [];

// unsplash api
const count = 30;
const query = "citrus";
const apiKeyUnsplash = "9U7i1PPeDJT-zNjkSec9-bv2iJxmB2Frns0kFDnTX-Y";
const apiUrlUnsplash = `https://api.unsplash.com/photos/random/?client_id=${apiKeyUnsplash}&count=${count}&query=${query}`;

//check if all images are loaded for inifite scroll
function imageLoaded() {
  imagesLoaded++;

  //check if all the images are loaded and then hide the loader
  if (imagesLoaded === totalImages) {
    ready = true;
    loader.hidden = true;
  }
}

// create elements for links and photos and add to dom
function setAttributes(element, attributes) {
  for (const key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
}

//generates the DOM elements for the photos
function displayPhotos() {
  imagesLoaded = 0;
  totalImages = photoArray.length;
  console.log("total images", totalImages);

  // run fnunction for each object in photos array
  photoArray.forEach((photo) => {
    //create <a> to link to unsplash
    const photoLink = document.createElement("a");
    setAttributes(photoLink, {
      href: photo.links.html,
      target: "_blank",
    });

    //create <img> for photo
    const img = document.createElement("img");
    setAttributes(img, {
      src: photo.urls.regular,
      alt: photo.alt_description,
      title: photo.alt_description,
      color: photo.color,
      class: "unsplash-photo",
    });

    //make palette button
    const paletteButton = document.createElement("button");

    setAttributes(paletteButton, {
      style: `background: #fff;
                    border-left: 10px solid ${photo.color};
                    border-right: 10px solid ${photo.color};
                    `,
      "data-photo-url": img.src,
      class: "palette-button",
    });

    const imgAndButton = document.createElement("div");
    img.addEventListener("load", imageLoaded);
    let buttonText = document.createTextNode("GET PALETTE");

    //stick everything together
    photoLink.appendChild(img);
    paletteButton.appendChild(buttonText);
    imgAndButton.appendChild(photoLink);
    imgAndButton.appendChild(paletteButton);
    imgAndButton.classList.add(img.src, "img-and-button");
    imageContainer.appendChild(imgAndButton);
  });
}

//get photos from unsplash api
async function getPhotos() {
  try {
    const response = await fetch(apiUrlUnsplash);
    photoArray = await response.json();
    displayPhotos();
  } catch (error) {
    console.log(error);
  }
}

async function getImaggaData(buttonItem, urlItem) {
  //basic authorization and fetch method for Imagga api
  try {
    let username = apiKeyImagga;
    let password = apiSecretImagga;
    let headers = new Headers();

    headers.set(
      "Authorization",
      "Basic " + window.btoa(username + ":" + password)
    );
    //create loading box
    const paletteContainer = document.createElement("div");
    paletteContainer.className = "palette-boxes-container";
    const loadingTextP = document.createElement("p");
    const loadingText = document.createTextNode("loading...");
    loadingTextP.appendChild(loadingText);

    const errorTextP = document.createElement("p");
    const errorText = document.createTextNode(
      "An error has occured with the Color AI for this particular image! Try another photo! "
    );
    errorTextP.className = "hidden-text";
    errorTextP.appendChild(errorText);
    paletteContainer.appendChild(loadingTextP);
    paletteContainer.appendChild(errorTextP);

    buttonItem.parentNode.insertBefore(
      paletteContainer,
      buttonItem.nextSibling
    );

    let response = await fetch(
      `https://api.imagga.com/v2/colors?image_url=${urlItem}`,
      {
        method: "GET",
        headers: headers,
      }
    ).then((response) => response.json());

    console.log("here is the response:", response);
    if (response?.status?.type !== "success") {
      console.log("caught it");
      errorTextP.classList.remove("hidden-text");
      errorTextP.className = "red-error";
      paletteContainer.classList.add("red-error-container");
      // throw error;
    }

    loadingTextP.className = "hidden-text";
    const colors = _.get(response, "result.colors");
    const lodashArray = [];

    // extracts data from api call, returns nothing if undefined
    ["fore", "back"].forEach((name) => {
      for (let i = 0; i < 3; i++) {
        lodashArray.push([
          _.get(
            colors,
            `${name}ground_colors[${i}].closest_palette_color_html_code`
          ),
          _.get(colors, `${name}ground_colors[${i}].closest_palette_color`),
        ]);
      }
    });

    console.log(lodashArray);

    lodashArray.forEach((colorArray) => {
      const { 0: color, 1: colorName } = colorArray;

      //generates the divs/components for the palette
      console.log(colorName);
      console.log(color);
      if (colorName) {
        const colorBox = document.createElement("div");
        colorBox.className = "indiv-color-box";
        colorBox.setAttribute("style", `background-color: ${color}`);

        const colorTextP = document.createElement("p");
        const colorText = document.createTextNode(color);
        colorTextP.className = "color-box-label";
        colorTextP.appendChild(colorText);

        const colorTitleP = document.createElement("p");
        const colorTitle = document.createTextNode(colorName);
        colorTitleP.className = "color-title-label";
        colorTitleP.appendChild(colorTitle);

        const textAndColorBox = document.createElement("div");
        textAndColorBox.className = "text-and-color-box";

        textAndColorBox.appendChild(colorTitleP);
        textAndColorBox.appendChild(colorBox);
        textAndColorBox.appendChild(colorTextP);
        paletteContainer.appendChild(textAndColorBox);
      }
    });
  } catch (e) {
    console.log(e);
  }
}

//when image is clicked on, call Imagga API and generate palette
imageContainer.addEventListener("click", (event) => {
  const button = event.target;

  //check that the palette button was clicked
  if (!button.classList.contains("palette-button")) {
    return;
  }
  const url = button.getAttribute("data-photo-url");
  console.log(url);

  getImaggaData(button, url);
});

//check to see if scrolling near bottom of page, Load more photos
window.addEventListener("scroll", () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 &&
    ready
  ) {
    ready = false;
    getPhotos();
  }
});

//no load
getPhotos();
