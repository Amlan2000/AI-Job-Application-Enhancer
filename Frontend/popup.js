pdfjsLib.GlobalWorkerOptions.workerSrc = 'static/libs/pdf.worker.min.js';

// DOM references
const resumeInput = document.getElementById("resumeInput");
const fileNameDisplay = document.getElementById("fileName");
const analyzeBtn = document.getElementById("analyzeBtn");
const loadingSpinner = document.getElementById("loadingSpinner");

// On popup load
window.addEventListener("DOMContentLoaded", () => {
  const savedText = localStorage.getItem("resumeText");
  const savedName = localStorage.getItem("resumeFileName");

  if (savedText && savedName) {
    fileNameDisplay.textContent = savedName;
  } else {
    fileNameDisplay.textContent = "No resume uploaded";
  }

  // Actively request job data from LinkedIn tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;

    console.log("🟢 Active tab URL:", tabs[0].url);

    chrome.tabs.sendMessage(tabs[0].id, { type: "GET_JOB_DATA" }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn("⚠️ No response from content script:", chrome.runtime.lastError.message);
        return;
      }
      if (response && response.jobData) {
        localStorage.setItem("linkedinJobData", JSON.stringify(response.jobData));
        console.log("✅ Job data received from content script:", response.jobData);
      }
    });
  });
});

// Listen for incoming job data (optional backup in case popup is already open)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("🔄 Received message from content script:", message);
  if (message.type === "JOB_DATA") {
    const jobData = message.payload;
    console.log("🟢 Received job data from content script:", jobData);
    localStorage.setItem("linkedinJobData", JSON.stringify(jobData));
  }
});

// Handle resume upload
resumeInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileType = file.type;
  const reader = new FileReader();
  fileNameDisplay.textContent = file.name;

  localStorage.setItem("resumeFileName", file.name);
  localStorage.removeItem("resumeText");

  if (fileType === "application/pdf") {
    reader.onload = async () => {
      const typedarray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item) => item.str).join(" ");
        text += strings + "\n";
      }

      localStorage.setItem("resumeText", text);
      console.log("📄 PDF resume saved to localStorage.");
    };
    reader.readAsArrayBuffer(file);

  } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      mammoth
        .extractRawText({ arrayBuffer: arrayBuffer })
        .then((result) => {
          localStorage.setItem("resumeText", result.value);
          console.log("📄 DOCX resume saved to localStorage.");
        })
        .catch((err) => {
          console.error("❌ DOCX parsing error:", err);
        });
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert("Unsupported file type. Please upload a PDF or DOCX file.");
    fileNameDisplay.textContent = "No resume uploaded";
  }
});

// Handle analyze click
analyzeBtn.addEventListener("click", async () => {
  const resumeText = localStorage.getItem("resumeText");
  const jobDataRaw = localStorage.getItem("linkedinJobData");
  const jobData = jobDataRaw ? JSON.parse(jobDataRaw) : null;

  if (!resumeText) {
    alert("Please upload a resume first.");
    return;
  }

  if (!jobData || !jobData.description) {
    alert("No job description found. Please open a LinkedIn job page.");
    return;
  }

  loadingSpinner.style.display = "block";


  try {
    const response = await fetch("http://localhost:8080/api/file/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeText: resumeText,
        jobDescription: jobData.description
      })
    });

    const data = await response.json();
    console.log("📊 Analysis result:", data);

         // Display match result
  const matchResultElement = document.getElementById("matchResult");
  const outputSection = document.getElementById("outputSection");


   let  matchPercentage = data.matchFit || "Match result not available.";
   let suggestions = data.suggestions || "No suggestions available.";




      // Display match result
  if (matchPercentage >= 75) {
    matchResultElement.textContent = `🎉 Congratulations! Your resume matches ${matchPercentage}% with the current job opening.`;
    matchResultElement.style.color = "green";
  } else if (matchPercentage >= 45) {
    matchResultElement.textContent = `🙂 Pretty good! Your resume matches ${matchPercentage}%. We should improve a bit.`;
    matchResultElement.style.color = "orange";
  } else {
    matchResultElement.textContent = `😟 Oh no! Your resume matches only ${matchPercentage}%. You don't seem to be a great fit for this role.`;
    matchResultElement.style.color = "red";
  }



// Display suggestions
const suggestions_heading= document.getElementById("suggestions-heading");
suggestions_heading.textContent="Suggestions for Improvement:";
const suggestionsList = document.getElementById("suggestions");
suggestionsList.innerHTML = ""; // Clear previous suggestions

// Iterate over the suggestions array and create list items
suggestions.forEach((suggestion) => {
  const li = document.createElement("li");
  li.textContent = suggestion; // Use each suggestion directly
  suggestionsList.appendChild(li);
});

outputSection.style.display = "block";


  } catch (error) {
    console.error("❌ Error calling backend:", error);
    alert("Failed to analyze the resume. Try again.");
  } finally {
    loadingSpinner.style.display = "none";
  }
});
