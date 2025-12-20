import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from database import db, User, Scan
from model import ai_engine

app = Flask(__name__)
CORS(app) # تفعيل CORS عشان الـ Frontend يقدر يكلم الـ Backend

# الإعدادات
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///optiverse.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'

# التأكد من وجود فولدر الصور المرفوعة
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# ربط قاعدة البيانات
db.init_app(app)

with app.app_context():
    db.create_all()

# --- ROUTES ---

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 400
    
    new_user = User(
        full_name=data['fullName'],
        email=data['email'],
        password=data['password'],
        account_type=data['accountType']
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created", "user_id": new_user.id}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email'], password=data['password']).first()
    if user:
        return jsonify({
            "message": "Login successful", 
            "user_id": user.id, 
            "name": user.full_name
        }), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/predict', methods=['POST'])
def predict():
    # 1. التأكد من وجود الصورة في الطلب
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    user_id = request.form.get('user_id')
    patient_id = request.form.get('patient_id', 'Unknown')

    # 2. حفظ الصورة مؤقتاً للمعالجة
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        # 3. استدعاء الموديل (اللي عدلناه في model.py)
        # الموديل هيرجع التشخيص (diagnosis) ونسبة التأكد (confidence)
        diagnosis, confidence = ai_engine.predict(filepath)

        # 4. حفظ البيانات في قاعدة البيانات
        # تأكدنا من تحويل الـ user_id لرقم عشان ميحصلش Error في الـ DB
        new_scan = Scan(
            user_id=int(user_id) if user_id else 1,
            patient_id=patient_id,
            image_path=filepath,
            diagnosis=diagnosis,
            confidence=float(confidence)
        )
        db.session.add(new_scan)
        db.session.commit()

        # 5. الرد على الـ Frontend بالنتيجة النهائية
        return jsonify({
            "status": "success",
            "diagnosis": diagnosis,
            "confidence": round(float(confidence) * 100, 2), # عرض النسبة المئوية
            "image_url": filepath
        })

    except Exception as e:
        return jsonify({"error": f"Inference failed: {str(e)}"}), 500

@app.route('/patients/<int:user_id>', methods=['GET'])
def get_patients(user_id):
    scans = Scan.query.filter_by(user_id=user_id).order_by(Scan.timestamp.desc()).all()
    return jsonify([scan.to_dict() for scan in scans])

if __name__ == '__main__':
    # تشغيل السيرفر
    app.run(debug=True, port=5000)