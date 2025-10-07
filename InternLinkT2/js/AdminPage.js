document.addEventListener("DOMContentLoaded", () => {
	const mainContentArea = document.getElementById("main-content-area");
	const navItems = document.querySelectorAll(".nav-item");

	// Function to load content
	const loadContent = async (url) => {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const content = await response.text();
			mainContentArea.innerHTML = content;
		} catch (error) {
			console.error("Error loading content:", error);
			mainContentArea.innerHTML = "<p>Error loading content.</p>";
		}
	};

	// Function to set active navigation item
	const setActiveNavItem = (clickedItem) => {
		navItems.forEach((item) => item.classList.remove("active"));
		clickedItem.classList.add("active");
	};

	// Event listeners for navigation items
	navItems.forEach((item) => {
		item.addEventListener("click", (event) => {
			event.preventDefault(); // Prevent default link behavior
			const contentUrl = item.getAttribute("data-content-url");
			if (contentUrl) {
				loadContent(contentUrl);
				setActiveNavItem(item);
			} else {
				// Handle items without a data-content-url (e.g., Support, Approvals)
				// For now, just log a message or show a placeholder
				mainContentArea.innerHTML = `<h1>${
					item.querySelector("a").textContent
				} Page</h1><p>Content for this section is not yet implemented.</p>`;
				setActiveNavItem(item);
			}
		});
	});

	// Initial load: Load the dashboard content or default content
	const initialNavItem = document.querySelector(".nav-item.active");
	if (initialNavItem) {
		const initialContentUrl = initialNavItem.getAttribute("data-content-url");
		if (initialContentUrl) {
			loadContent(initialContentUrl);
		} else {
			mainContentArea.innerHTML = "<h1>OJT DASHBOARD</h1>"; // Default dashboard content
		}
	} else {
		mainContentArea.innerHTML = "<h1>Welcome to Admin Dashboard</h1>"; // Fallback
	}
});
