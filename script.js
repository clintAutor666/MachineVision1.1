let originalImage = new Image(); 

document.getElementById("upload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            originalImage.src = e.target.result;
            document.getElementById("original-image").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function applyFilter(grayscale = false) {
    if (!originalImage.src) {
        alert("Please upload an image first.");
        return;
    }

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const mode = document.getElementById("filter-mode").value;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i], g = data[i + 1], b = data[i + 2];

        if (grayscale) {
            let avg = (r + g + b) / 3;
            r = g = b = avg;
        } else {
            switch (mode) {
                case "Neonlow": r *= 1.5; g *= 0.7; b *= 2; break;
                case "BokehEffect": ctx.filter = 'blur(8px)'; ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height); return;
                case "Cartoonify": let avg = (r + g + b) / 3; avg = avg > 128 ? 255 : 0; r = g = b = avg; break;
                case "Pixelate": const pixelSize = 10; for (let y = 0; y < canvas.height; y += pixelSize) { for (let x = 0; x < canvas.width; x += pixelSize) { const pixelData = ctx.getImageData(x, y, 1, 1).data; ctx.fillStyle = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`; ctx.fillRect(x, y, pixelSize, pixelSize); } } return;
                case "Duotone": const color1 = [255, 100, 0]; const color2 = [0, 0, 255]; for (let i = 0; i < data.length; i += 4) { const grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3 / 255; data[i] = color1[0] * (1 - grayscale) + color2[0] * grayscale; data[i + 1] = color1[1] * (1 - grayscale) + color2[1] * grayscale; data[i + 2] = color1[2] * (1 - grayscale) + color2[2] * grayscale; } break;
                case "GlitchEffect": for (let i = 0; i < data.length; i += 4) { data[i] = data[i + 4] || data[i]; data[i + 1] = data[i + 8] || data[i + 1]; data[i + 2] = data[i + 12] || data[i + 2]; } break;
                case "RainbowOverlay": const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height); gradient.addColorStop(0, 'red'); gradient.addColorStop(0.2, 'orange'); gradient.addColorStop(0.4, 'yellow'); gradient.addColorStop(0.6, 'green'); gradient.addColorStop(0.8, 'blue'); gradient.addColorStop(1, 'purple'); ctx.globalAlpha = 0.3; ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.globalAlpha = 1; return;
                case "WarmVintage": r = Math.min(255, r + 20); g = Math.min(255, g + 10); break;
                case "3DEffect": r = data[i + 4] || r; b = data[i - 4] || b; break;
                case "VHSDistortion": if (Math.random() < 0.05) { r = g = b = 0; } break;
            }
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }

    ctx.putImageData(imageData, 0, 0);
    document.querySelector('.image-box').style.display = 'block';
}

document.getElementById("apply-filter").addEventListener("click", function () {
    const selectedFilter = document.getElementById("filter-mode").value;
    applyFilter(selectedFilter === "grayscale");
});
;

function applyGrayscale() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    if (!originalImage.src) {
        alert("Please upload an image first.");
        return;
    }

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // Red
        data[i + 1] = avg; // Green
        data[i + 2] = avg; // Blue
    }

    ctx.putImageData(imageData, 0, 0);
}

function applyBinary() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    if (!originalImage.src) {
        alert("Please upload an image first.");
        return;
    }

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const threshold = 128; // You can adjust this value
        const value = avg >= threshold ? 255 : 0;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
    }

    ctx.putImageData(imageData, 0, 0);
}

// Example: Apply filters with buttons
document.getElementById("apply-grayscale").addEventListener("click", applyGrayscale);
document.getElementById("apply-binary").addEventListener("click", applyBinary);

document.getElementById("apply-adaptive-binarization").addEventListener("click", function () {
    if (!originalImage.src) {
        alert("Please upload an image first.");
        return;
    }

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    let src = cv.imread("canvas");
    let gray = new cv.Mat();
    let dst = new cv.Mat();
    
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    cv.adaptiveThreshold(gray, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 15, 5);
    
    cv.imshow("canvas", dst);
    
    src.delete();
    gray.delete();
    dst.delete();
});


document.getElementById("reset-controls").addEventListener("click", function () {
    // Reset sliders to default values
    document.getElementById("redRange").value = 100;
    document.getElementById("greenRange").value = 100;
    document.getElementById("blueRange").value = 100;
    document.getElementById("opacity").value = 1;
    document.getElementById("brightness").value = 100;
    document.getElementById("contrast").value = 100;
    document.getElementById("saturation").value = 100;
    document.getElementById("blur").value = 0;
    document.getElementById("thresholdSlider").value = 128;
    document.getElementById("thresholdValue").textContent = "128";

    // Uncheck checkboxes
    document.getElementById("applyFilter").checked = false;
    document.getElementById("Filter").checked = false;
    document.getElementById("apply-threshold").checked = false;

    // Reapply default filter (optional)
    applyFilter();
});

function applyEnhancements() {
    if (!originalImage.src) {
        alert("Please upload an image first.");
        return;
    }

    const opacity = parseFloat(document.getElementById("opacity").value);
    const brightness = parseInt(document.getElementById("brightness").value) / 100;
    const contrast = parseInt(document.getElementById("contrast").value) / 100;
    const saturation = parseInt(document.getElementById("saturation").value) / 100;
    const blur = parseInt(document.getElementById("blur").value);

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // Set CSS filters for the canvas context
    ctx.filter = `opacity(${opacity}) brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${blur}px)`;
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
}

// Event Listeners for Enhancement Controls
["opacity", "brightness", "contrast", "saturation", "blur"].forEach((id) => {
    document.getElementById(id).addEventListener("input", function () {
        if (document.getElementById("Filter").checked) {
            applyEnhancements();
        }
    });
});

document.getElementById("Filter").addEventListener("change", function () {
    if (this.checked) {
        applyEnhancements();
    } else {
        applyFilter(); // Reapply the selected filter without enhancements
    }
});

document.getElementById("save").addEventListener("click", function () {
    const canvas = document.getElementById("canvas");
    const link = document.createElement("a");
    link.download = "filtered-image.png";
    link.href = canvas.toDataURL();
    link.click();
});

document.getElementById("applyFilter").addEventListener("change", function () {
    if (this.checked) {
        applyRGBFilter();
    } else {
        applyFilter(); // Reapply selected filter without RGB adjustments
    } 
});

["redRange", "greenRange", "blueRange"].forEach((id) => {
    document.getElementById(id).addEventListener("input", function () {
        if (document.getElementById("applyFilter").checked) {
            applyRGBFilter();
        }
    });
});

function applyRGBFilter() {
    if (!originalImage.src) {
        alert("Please upload an image first.");
        return;
    }

    const redMultiplier = document.getElementById("redRange").value / 100;
    const greenMultiplier = document.getElementById("greenRange").value / 100;
    const blueMultiplier = document.getElementById("blueRange").value / 100;

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0, originalImage.width, originalImage.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] *= redMultiplier;     // Red
        data[i + 1] *= greenMultiplier; // Green
        data[i + 2] *= blueMultiplier;  // Blue
    }

    ctx.putImageData(imageData, 0, 0);
}


// Update threshold value display
const thresholdSlider = document.getElementById("thresholdSlider");
const thresholdValueDisplay = document.getElementById("thresholdValue");
const applyThresholdCheckbox = document.getElementById("apply-threshold");

thresholdSlider.addEventListener("input", function () {
    thresholdValueDisplay.textContent = this.value;
    if (applyThresholdCheckbox.checked) {
        applyBinaryThreshold(parseInt(this.value));
    }
});

applyThresholdCheckbox.addEventListener("change", function () {
    if (this.checked) {
        applyBinaryThreshold(parseInt(thresholdSlider.value));
    } else {
        applyFilter(); // Reapply default filter if threshold is unchecked
    }
});

// Function to apply binary threshold
function applyBinaryThreshold(threshold = 128) {
    if (!originalImage.src) {
        alert("Please upload an image first.");
        return;
    }

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const color = avg >= threshold ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = color;
    }

    ctx.putImageData(imageData, 0, 0);
}

// Reset button functionality for threshold control
const resetThresholdButton = document.getElementById("reset-threshold");
resetThresholdButton.addEventListener("click", function () {
    const thresholdSlider = document.getElementById("thresholdSlider");
    const thresholdValue = document.getElementById("thresholdValue");
    const applyThresholdCheckbox = document.getElementById("apply-threshold");

    // Reset slider value and displayed value to default (128)
    thresholdSlider.value = 128;
    thresholdValue.textContent = 128;

    // Reapply the threshold if the checkbox is checked
    if (applyThresholdCheckbox.checked) {
        applyBinaryThreshold(128);
    }
});
