const imageContainer = document.getElementById("image-container");
imageContainer.className = "image-container";
const loader = document.getElementById("loader");
const colorIcon = document.getElementById("color-icon");

const apiKeyImagga = "acc_38e3d7daa190425";
const apiSecretImagga = "7b801be296fac0cec59a7f96f1f10917";

let ready = false;
let imagesLoaded = 0;
let totalImages = 0;
let photoArray = [];

// unsplash api
const count = 30;
const query = "citrus";
const apiKeyUnsplash = "9U7i1PPeDJT-zNjkSec9-bv2iJxmB2Frns0kFDnTX-Y";
const apiUrlUnsplash = `https://api.unsplash.com/photos/random/?client_id=${apiKeyUnsplash}&count=${count}&query=${query}`;

//check if all iamges are loaded
function imageLoaded() {
  console.log("image loaded");
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    ready = true;
    loader.hidden = true;
    console.log("ready = ", ready);
  }
}

// create elements for links and photos and add to dom
function setAttributes(element, attributes) {
  for (const key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
}

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
    img.className = "unsplash-photo";
    setAttributes(img, {
      src: photo.urls.regular,
      alt: photo.alt_description,
      title: photo.alt_description,
      color: photo.color,
    });

    //make palette button
    const paletteButton = document.createElement("button");
    paletteButton.className = "palette-button";
    paletteButton.id = img.src;

    setAttributes(paletteButton, {
      style: `background: #fff;
                    border-left: 10px solid ${photo.color};
                    border-right: 10px solid ${photo.color};
                    `,
      "data-photo-url": img.src,
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

imageContainer.addEventListener("click", (event) => {
  const button = event.target;

  if (!button.classList.contains("palette-button")) {
    return;
  }
  const url = button.getAttribute("data-photo-url");
  console.log(url);

  //on click call this function to generate the palette
  async function getImaggaData() {
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
      paletteContainer.appendChild(loadingTextP);
      button.parentNode.insertBefore(paletteContainer, button.nextSibling);

      let response = await fetch(
        `https://api.imagga.com/v2/colors?image_url=${url}`,
        {
          method: "GET",
          headers: headers,
        }
      ).then((response) => response.json());

      loadingTextP.className = "hidden-text";

      //gets the colors from the imagga response
      const {
        background_colors: {
          0: {
            closest_palette_color_html_code: back_1,
            closest_palette_color: back_1_name,
          },
          1: {
            closest_palette_color_html_code: back_2,
            closest_palette_color: back_2_name,
          },
          2: {
            closest_palette_color_html_code: back_3,
            closest_palette_color: back_3_name,
          },
        },
        foreground_colors: {
          0: {
            closest_palette_color_html_code: fore_1,
            closest_palette_color: fore_1_name,
          },
          1: {
            closest_palette_color_html_code: fore_2,
            closest_palette_color: fore_2_name,
          },
          2: {
            closest_palette_color_html_code: fore_3,
            closest_palette_color: fore_3_name,
          },
        },
      } = response.result.colors;
      console.log(fore_2_name);

      // const paletteContainer = document.createElement("div");
      // paletteContainer.className = "palette-boxes-container";

      //cycles through the pairs of hex codes/ color names to generate palette
      [
        [fore_1, fore_1_name],
        [fore_2, fore_2_name],
        [fore_3, fore_3_name],
        [back_1, back_1_name],
        [back_2, back_2_name],
        [back_3, back_3_name],
      ].forEach((colorArray) => {
        const { 0: color, 1: colorName } = colorArray;

        //generates the divs/components for the palette
        console.log(colorName);
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
      });
    } catch (e) {
      console.log(e);
    }
  }

  getImaggaData();
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
