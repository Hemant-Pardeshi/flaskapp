from flask import Flask, render_template, request, jsonify, url_for
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Create uploads directory if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Allowed file extensions
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'csv', 'xlsx'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/select_animal', methods=['POST'])
def select_animal():
    data = request.get_json()
    animal = data.get('animal')
    
    if animal in ['cat', 'dog', 'elephant']:
        image_url = url_for('static', filename=f'images/{animal}.jpg')
        return jsonify({
            'success': True,
            'animal': animal,
            'image_url': image_url
        })
    else:
        return jsonify({'success': False, 'error': 'Invalid animal selection'})

@app.route('/upload_file', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file selected'})
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'})
    
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Get file information
        file_size = os.path.getsize(file_path)
        file_type = file.content_type or 'Unknown'
        
        # Convert file size to human readable format
        def format_file_size(size_bytes):
            if size_bytes == 0:
                return "0B"
            size_names = ["B", "KB", "MB", "GB"]
            i = 0
            while size_bytes >= 1024 and i < len(size_names) - 1:
                size_bytes /= 1024.0
                i += 1
            return f"{size_bytes:.1f} {size_names[i]}"
        
        return jsonify({
            'success': True,
            'filename': filename,
            'file_size': format_file_size(file_size),
            'file_type': file_type
        })
    
    return jsonify({'success': False, 'error': 'File upload failed'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
