document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("doctorName").textContent = user.name;

    // Fetch Scan History
    const scans = await apiRequest(`/patients/${user.user_id}`);
    
    const tableBody = document.getElementById("scanTableBody");
    const totalScansEl = document.getElementById("totalScans");
    const issueCountEl = document.getElementById("issueCount");
    
    let issues = 0;

    if (Array.isArray(scans)) {
        totalScansEl.textContent = scans.length;
        
        scans.forEach(scan => {
            if (scan.diagnosis !== "Healthy" && scan.diagnosis !== "Healthy Retina") issues++;
            
            const row = document.createElement("tr");
            row.className = "hover:bg-slate-800/50 transition";
            row.innerHTML = `
                <td class="px-6 py-4 text-slate-300 font-mono">${scan.patient_id}</td>
                <td class="px-6 py-4 text-slate-400">${scan.date}</td>
                <td class="px-6 py-4 font-medium text-white">${scan.diagnosis}</td>
                <td class="px-6 py-4">
                    <div class="w-full bg-slate-700 rounded-full h-2 max-w-[100px]">
                        <div class="bg-blue-500 h-2 rounded-full" style="width: ${scan.confidence}%"></div>
                    </div>
                    <span class="text-xs text-slate-400 mt-1 block">${scan.confidence}%</span>
                </td>
                <td class="px-6 py-4">
                   <button class="text-blue-400 hover:text-blue-300 text-sm">View Report</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        issueCountEl.textContent = issues;
    }
});

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}