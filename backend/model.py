import os
import numpy as np
import random
from PIL import Image

# التأكد من وجود مكتبة TensorFlow
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

class RetinaModel:
    def __init__(self):
        self.model = None
        self.load_model()

    def load_model(self):
        # المسار للفولدر اللي فيه ملف saved_model.pb
        model_path = 'my_model' 
        
        if TF_AVAILABLE and os.path.exists(model_path):
            print("Loading TensorFlow model from folder...")
            try:
                # التعديل الأساسي: استخدام tf.saved_model.load بدل keras load_model
                self.model = tf.saved_model.load(model_path)
                print("✅✅✅ THE MODEL IS LOADED SUCCESSFULLY! ✅✅✅")
            except Exception as e:
                print(f"❌ Error loading model: {e}")
        else:
            print("⚠️ Model folder 'my_model' not found. Running in SIMULATION MODE.")

    def preprocess(self, image_path):
        # معالجة الصورة لتناسب الموديل (تأكد من الحجم 224x224)
        img = Image.open(image_path).convert('RGB')
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        # الموديل يتوقع float32
        return np.expand_dims(img_array, axis=0).astype(np.float32)

    def predict(self, image_path):
        if self.model:
            try:
                processed_img = self.preprocess(image_path)
                
                # التعامل مع الموديل كـ SavedModel عن طريق الـ Signature
                infer = self.model.signatures["serving_default"]
                
                # تحويل المصفوفة لـ Tensor وإرسالها للموديل
                input_tensor = tf.constant(processed_img)
                # لاحظ هنا بنستخدم اسم الـ input layer بتاعك (غالباً input_layer أو حسب موديلك)
                # كود مرن يسحب أول مخرجات للموديل
                predictions = infer(input_tensor)
                output_key = list(predictions.keys())[0]
                prediction_value = predictions[output_key].numpy()
                
                # استخراج الاحتمالية (Score)
                score = float(prediction_value[0][0]) 
                
                if score > 0.5:
                    diagnosis = "Diabetic Retinopathy"
                    confidence = score
                else:
                    diagnosis = "Healthy Retina"
                    confidence = 1 - score
                    
                return diagnosis, confidence
            except Exception as e:
                print(f"Prediction Error: {e}")
                return "Error in AI", 0.0
        
        # وضع المحاكاة
        import time
        time.sleep(1.5) 
        conditions = ["Diabetic Retinopathy", "Healthy"]
        diagnosis = random.choice(conditions)
        confidence = random.uniform(0.80, 0.99)
        return diagnosis, confidence

# إنشاء نسخة من المحرك لاستخدامها في app.py
ai_engine = RetinaModel()