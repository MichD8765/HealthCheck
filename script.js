const blogForm = document.getElementById("blogForm");
const blogContainer = document.getElementById("blogs");

// Function to save blogs to localStorage
function saveBlogsToLocalStorage() {
    const blogs = [];
    document.querySelectorAll(".blog-card").forEach((blog) => {
        const title = blog.querySelector("h3").innerText;
        const content = blog.querySelector("p").innerText;
        const category = blog.querySelector(".blog-category").innerText;
        const image = blog.querySelector("img")?.src || null;
        const comments = Array.from(blog.querySelectorAll(".comment")).map(
            (comment) => comment.innerText
        );
        blogs.push({ title, content, category, image, comments });
    });
    localStorage.setItem("blogs", JSON.stringify(blogs));
}

// Function to load blogs from localStorage
function loadBlogsFromLocalStorage() {
    const savedBlogs = JSON.parse(localStorage.getItem("blogs")) || [];
    savedBlogs.forEach((blog) =>
        addBlogToDOM(blog.title, blog.content, blog.category, blog.image, blog.comments)
    );
}

// Convert image file to Base64
function convertImageToBase64(imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
    });
}

// Function to add blog to the DOM
function addBlogToDOM(title, content, category, imageBase64, comments = []) {
    const blogCard = document.createElement("div");
    blogCard.className = "col-md-6 blog-card";

    let imageTag = "";
    if (imageBase64) {
        imageTag = `<img src="${imageBase64}" class="img-fluid mb-2" alt="Blog Image">`;
    }

    const commentSection = `
        <div class="comment-section">
            <h5>Comments</h5>
            <div class="comments">
                ${comments
                    .map((comment) => `<div class="comment">${comment}</div>`)
                    .join("")}
            </div>
            <input type="text" class="form-control comment-input" placeholder="Add a comment">
            <button class="btn btn-secondary btn-sm mt-2 add-comment-btn">Add Comment</button>
        </div>
    `;

    const blogActions = `
        <div class="blog-actions">
            <button class="btn btn-sm edit-blog-btn">Edit</button>
            <button class="btn btn-sm delete-blog-btn">Delete</button>
        </div>
    `;

    const categoryBadge = `<span class="blog-category category-${category}">${category}</span>`;

    blogCard.innerHTML = `
        <div class="card p-3">
            ${imageTag}
            <h3>${title}</h3>
            <p>${content}</p>
            ${categoryBadge}
            ${blogActions}
            ${commentSection}
        </div>
    `;

    blogContainer.prepend(blogCard);

    // Attach event listeners
    attachBlogEvents(blogCard);
    saveBlogsToLocalStorage();

    // Add animation
    setTimeout(() => blogCard.classList.add("visible"), 100);
}

// Function to attach event listeners for Edit and Delete buttons
function attachBlogEvents(blogCard) {
    // Edit Button
    blogCard.querySelector(".edit-blog-btn").addEventListener("click", () => {
        const title = blogCard.querySelector("h3").innerText;
        const content = blogCard.querySelector("p").innerText;
        const category = blogCard.querySelector(".blog-category").innerText;
        const image = blogCard.querySelector("img")?.src || null;

        // Prefill the form with blog data
        document.getElementById("title").value = title;
        document.getElementById("content").value = content;
        document.getElementById("category").value = category;

        // If an image is already set, preserve it in localStorage
        blogForm.dataset.editingImage = image || "";

        // Remove the current blog from the DOM and storage
        blogCard.remove();
        saveBlogsToLocalStorage();
    });

    // Delete Button
    blogCard.querySelector(".delete-blog-btn").addEventListener("click", () => {
        blogCard.remove();
        saveBlogsToLocalStorage();
    });

    // Add Comment Button
    blogCard.querySelector(".add-comment-btn").addEventListener("click", () => {
        const commentInput = blogCard.querySelector(".comment-input");
        const commentText = commentInput.value.trim();
        if (commentText) {
            const commentElement = document.createElement("div");
            commentElement.className = "comment";
            commentElement.innerText = commentText;
            blogCard.querySelector(".comments").appendChild(commentElement);
            commentInput.value = ""; // Clear the input field
            saveBlogsToLocalStorage();
        }
    });
}

// Handle new blog submission
blogForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const category = document.getElementById("category").value;
    const imageFile = document.getElementById("image").files[0];

    if (!category) {
        alert("Please select a category!");
        return;
    }

    let imageBase64 = null;
    if (imageFile) {
        imageBase64 = await convertImageToBase64(imageFile);
    } else if (blogForm.dataset.editingImage) {
        imageBase64 = blogForm.dataset.editingImage;
    }

    delete blogForm.dataset.editingImage;

    addBlogToDOM(title, content, category, imageBase64);

    // Reset form
    blogForm.reset();
});

// Load blogs when the page loads
document.addEventListener("DOMContentLoaded", loadBlogsFromLocalStorage);
