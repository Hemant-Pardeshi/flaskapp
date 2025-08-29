document.addEventListener('DOMContentLoaded', function () {
    // Animal selection functionality
    const animalCheckboxes = document.querySelectorAll('.animal-checkbox');
    const animalImageContainer = document.getElementById('animalImageContainer');
    const animalImage = document.getElementById('animalImage');
    const animalName = document.getElementById('animalName');

    // File upload functionality
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const uploadForm = document.getElementById('uploadForm');
    const fileInfoContainer = document.getElementById('fileInfoContainer');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileType = document.getElementById('fileType');
    const messageContainer = document.getElementById('messageContainer');

    // Handle animal selection (only one at a time)
    animalCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                // Uncheck other checkboxes
                animalCheckboxes.forEach(cb => {
                    if (cb !== this) {
                        cb.checked = false;
                    }
                });

                // Send request to backend
                selectAnimal(this.value);
            } else {
                // If unchecked, hide the image
                animalImageContainer.style.display = 'none';
            }
        });
    });

    // Handle file input change
    fileInput.addEventListener('change', function () {
        if (this.files.length > 0) {
            uploadButton.disabled = false;
            uploadButton.textContent = 'Upload';
        } else {
            uploadButton.disabled = true;
            uploadButton.textContent = 'Upload';
        }
    });

    // Handle file upload form submission
    uploadForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (fileInput.files.length === 0) {
            showMessage('Please select a file first.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        uploadButton.disabled = true;
        uploadButton.textContent = 'Uploading...';

        fetch('/upload_file', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Display file information
                    fileName.textContent = data.filename;
                    fileSize.textContent = data.file_size;
                    fileType.textContent = data.file_type;
                    fileInfoContainer.style.display = 'block';

                    showMessage('File uploaded successfully!', 'success');

                    // Reset form
                    fileInput.value = '';
                    uploadButton.disabled = true;
                    uploadButton.textContent = 'Upload';
                } else {
                    showMessage(data.error || 'Upload failed', 'error');
                    uploadButton.disabled = false;
                    uploadButton.textContent = 'Upload';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('An error occurred during upload', 'error');
                uploadButton.disabled = false;
                uploadButton.textContent = 'Upload';
            });
    });

    // Function to select animal and show image
    function selectAnimal(animal) {
        fetch('/select_animal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ animal: animal })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    animalImage.src = data.image_url;
                    animalImage.alt = data.animal;
                    animalName.textContent = data.animal.charAt(0).toUpperCase() + data.animal.slice(1);
                    animalImageContainer.style.display = 'block';

                    showMessage(`Selected ${data.animal}!`, 'success');
                } else {
                    showMessage(data.error || 'Failed to load animal image', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('An error occurred while selecting the animal', 'error');
            });
    }

    // Function to show messages
    function showMessage(message, type) {
        // Remove existing messages
        const existingMessages = messageContainer.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        messageContainer.appendChild(messageDiv);

        // Auto-remove message after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Handle drag and drop for file upload
    const fileUploadLabel = document.querySelector('.file-upload-label');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileUploadLabel.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        fileUploadLabel.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileUploadLabel.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        fileUploadLabel.style.backgroundColor = '#e2e8f0';
        fileUploadLabel.style.transform = 'scale(1.02)';
    }

    function unhighlight(e) {
        fileUploadLabel.style.backgroundColor = '';
        fileUploadLabel.style.transform = '';
    }

    fileUploadLabel.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            fileInput.files = files;
            uploadButton.disabled = false;
            uploadButton.textContent = 'Upload';
            showMessage('File dropped successfully! Click Upload to proceed.', 'success');
        }
    }
});
