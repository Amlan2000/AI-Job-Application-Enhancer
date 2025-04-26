(function () {
    console.log("✅ LinkedIn Job Data Extraction Script Loaded");
  
    // Wait for the page to load and extract job data
    window.addEventListener("load", () => {
      setTimeout(() => {
        try {
          const jobTitle = document.querySelector('.job-details-jobs-unified-top-card__job-title a')?.innerText || "Not Found";
          const companyName = document.querySelector('.job-details-jobs-unified-top-card__company-name a')?.innerText || "Not Found";
          const jobDescription = document.querySelector('#job-details')?.innerText || "Not Found";
  
          const jobData = {
            title: jobTitle,
            company: companyName,
            description: jobDescription
          };
  
          console.log("📤 Automatically extracted job data:", jobData);
  
          // Send job data to extension
          chrome.runtime.sendMessage({ type: "JOB_DATA", payload: jobData });
  
        } catch (e) {
          console.error("❌ Error in fetching LinkedIn job data:", e);
        }
      }, 2000); // adjust timeout if necessary
    });
  
    // Respond to popup.js when it asks for job data
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log("🔄 Received message from popup.js:", request);
      if (request.type === "GET_JOB_DATA") {
        const jobTitle = document.querySelector('.job-details-jobs-unified-top-card__job-title a')?.innerText || "Not Found";
        const companyName = document.querySelector('.job-details-jobs-unified-top-card__company-name a')?.innerText || "Not Found";
        const jobDescription = document.querySelector('#job-details')?.innerText || "Not Found";

        console.log("Job description:", jobDescription);
  
        const jobData = {
          title: jobTitle,
          company: companyName,
          description: jobDescription,
        };
  
        console.log("📤 Responding with job data from GET_JOB_DATA:", jobData);
        sendResponse({ jobData });
      }
  
      return true; // Keep the message channel open for async response
    });
  })();
  