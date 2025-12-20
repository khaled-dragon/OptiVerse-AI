document.addEventListener("DOMContentLoaded", async () => {
    // جلب البيانات المخزنة من localStorage
    const userId = localStorage.getItem("user_id");
    const userName = localStorage.getItem("user_name");

    // التحقق من وجود مستخدم مسجل
    if (!userId) {
        window.location.href = "login.html";
        return;
    }

    // عرض اسم الدكتور في الواجهة
    const doctorNameEl = document.getElementById("doctorName");
    if (doctorNameEl) doctorNameEl.textContent = userName || "Doctor";

    // جلب سجل الفحوصات من السيرفر (Hugging Face)
    // apiRequest سيستخدم التلقائيا الـ API_BASE الجديد الذي وضعناه في api.js
    const scans = await apiRequest(`/patients/${userId}`);
    
    const tableBody = document.getElementById("scanTableBody");
    const totalScansEl = document.getElementById("totalScans");
    const issueCountEl = document.getElementById("issueCount");
    
    let issues = 0;

    if (Array.isArray(scans)) {
        totalScansEl.textContent = scans.length;
        
        // مسح الجدول قبل الإضافة لضمان عدم التكرار
        tableBody.innerHTML = "";

        scans.forEach(scan => {
            // منطق حساب الحالات المصابة بناءً على رد الموديل في model.py
            if (scan.diagnosis !== "Healthy" && scan.diagnosis !== "Healthy Retina") {
                issues++;
            }
            
            const row = document.createElement("tr");
            row.className = "hover:bg-slate-800/50 transition border-b border-slate-700/50";
            row.innerHTML = `
                <td class="px-6 py-4 text-slate-300 font-mono text-sm">${scan.patient_id}</td>
                <td class="px-6 py-4 text-slate-400 text-sm">${scan.date}</td>
                <td class="px-6 py-4 font-medium text-white text-sm">${scan.diagnosis}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-full bg-slate-700 rounded-full h-1.5 max-w-[100px]">
                            <div class="bg-blue-500 h-1.5 rounded-full" style="width: ${scan.confidence}%"></div>
                        </div>
                        <span class="text-xs text-slate-400 font-mono">${scan.confidence}%</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-right">
                   <button class="text-blue-400 hover:text-blue-300 text-sm font-medium transition">View Details</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        issueCountEl.textContent = issues;
    } else {
        // في حالة لا يوجد بيانات أو حدث خطأ
        totalScansEl.textContent = "0";
        issueCountEl.textContent = "0";
        tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-slate-500">No medical records found.</td></tr>`;
    }
});

// دالة تسجيل الخروج
function logout() {
    localStorage.clear(); // مسح كل بيانات الجلسة
    window.location.href = "index.html";
}
