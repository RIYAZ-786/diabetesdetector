function convert() {
  const foot = parseFloat(document.getElementById("foot").value) || 0;
  const inch = parseFloat(document.getElementById("inch").value) || 0;
  const cm = ((foot * 12) + inch) * 2.54;
  document.getElementById("height").value = cm.toFixed(2);
}

// Handle model selection
let selectedModel = null;

document.querySelectorAll(".model-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".model-btn").forEach((b) => {
      b.classList.remove("selected");
      b.textContent = b.dataset.model.toUpperCase();
    });
    btn.classList.add("selected");
    btn.textContent = "✅ " + btn.dataset.model.toUpperCase();
    selectedModel = btn.dataset.model;
  });
});

document.querySelector(".diagnose").addEventListener("click", async () => {
  if (!selectedModel) {
    alert("Please select a model before diagnosing.");
    return;
  }

  const form = document.querySelector(".form-grid");
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  for (let key in data) {
    if (data[key] === "") {
      alert("Please fill all fields.");
      return;
    }
    data[key] = Number(data[key]);
  }

  data.height = Number(document.getElementById("height").value);
  data.model = selectedModel;

  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Server error");

    const result = await response.json();

    const resultBox = document.getElementById("diagnosis-result");
    resultBox.textContent = `Diagnosis (${selectedModel.toUpperCase()}): ${result.result}`;

    const allBox = document.getElementById("all-model-results");
    if (allBox && result.all_results) {
      allBox.innerHTML = `
        <h4>Model Results:</h4>
        <ul>
          <li><strong>Naive Bayes:</strong> ${result.all_results.naive}</li>
          <li><strong>K-NN:</strong> ${result.all_results.knn}</li>
          <li><strong>SVM:</strong> ${result.all_results.svm}</li>
          <li><strong>ANN:</strong> ${result.all_results.ann}</li>
          <li><strong>Random Forest:</strong> ${result.all_results.randomforest}</li>
          <li><strong>Final Ensemble:</strong> ${result.all_results.ensemble}</li>
        </ul>
      `;
    }

    resultBox.scrollIntoView({ behavior: "smooth" });

  } catch (error) {
    document.getElementById("diagnosis-result").textContent = "Error: " + error.message;
  }
});

// Theme toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle");

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
  });

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }

  const welcome = document.querySelector(".fullscreen-welcome");
  setTimeout(() => {
    if (welcome) welcome.style.display = "none";
  }, 4000);
});

// Close button functionality (optional)
const closeBtn = document.getElementById("close-window");
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    document.querySelector(".window-frame").remove();
  });
}

// Show/hide scroll-to-top button on scroll
window.onscroll = function () {
  const btn = document.getElementById("scrollTopBtn");
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
};

// Scroll to top smoothly
document.getElementById("scrollTopBtn").addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
