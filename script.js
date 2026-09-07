const leafImage = document.getElementById("leafImage");
const preview = document.getElementById("preview");
const analyzeBtn = document.getElementById("analyzeBtn");
const result = document.getElementById("result");


// Image selection
leafImage.addEventListener("change", function () {

    const files = leafImage.files;

    if (files.length === 0) {
        preview.innerHTML = "<p>No image selected</p>";
        result.innerHTML = "<p>Your result will appear here.</p>";
        return;
    }

    preview.innerHTML = "";

    for (let i = 0; i < files.length; i++) {

        const imageURL = URL.createObjectURL(files[i]);

        preview.innerHTML += `
            <div class="image-preview">
                <img src="${imageURL}" alt="Plant Leaf">
                <p>Image ${i + 1}</p>
            </div>
        `;
    }

    result.innerHTML = `
        <p>🌱 ${files.length} image(s) selected.</p>
        <p>Click <b>Analyze Image</b> to get the prediction.</p>
    `;
});


// Analyze images
analyzeBtn.addEventListener("click", async function () {

    const files = leafImage.files;

    if (files.length === 0) {
        result.innerHTML = `
            <p>Please upload a leaf image first. 🌿</p>
        `;
        return;
    }

    result.innerHTML = `
        <p>🔄 Analyzing ${files.length} image(s)...</p>
    `;

    let resultsHTML = "";

    // Analyze each image separately
    for (let i = 0; i < files.length; i++) {

        const formData = new FormData();

        // IMPORTANT: Flask expects "image"
        formData.append("image", files[i]);

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/predict",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Prediction failed");
            }

            resultsHTML += `
                <div class="result-card">
                    <h3>🌿 Image ${i + 1}</h3>

                    <p>
                        <strong>Disease:</strong>
                        ${data.disease}
                    </p>

                    <p>
                        <strong>Confidence:</strong>
                        ${data.confidence}%
                    </p>
                </div>
            `;

        } catch (error) {

            console.error(error);

            resultsHTML += `
                <div class="result-card">
                    <h3>🌿 Image ${i + 1}</h3>
                    <p>❌ Prediction failed</p>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    result.innerHTML = `
        <h3>🔍 Analysis Results</h3>
        ${resultsHTML}
    `;
});