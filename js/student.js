// Check auth
const currentUserId = localStorage.getItem('current_user');
if (!currentUserId) {
    window.location.href = 'index.html';
}

const student = getStudent(currentUserId);
if (!student) {
    // We can't use showToast easily here because we might redirect immediately, 
    // but the student.html loads ui.js so it should work if we delay slightly or on the login page.
    // For now, let's just log out. 
    // Actually, let's try to show it.
    alert('Student data not found');
    logout();
}

// UI Initialization
document.getElementById('student-name').textContent = student.name;
document.getElementById('attendance-val').textContent = (student.attendance || 0) + '%';
document.getElementById('attendance-msg').textContent = (student.attendance || 0) >= 75 ? 'You are in good standing.' : 'Warning: Low attendance!';

// Calculate Average
let avg = 0;
if (student.marks && typeof student.marks === 'object') {
    const marksValues = Object.values(student.marks);
    if (marksValues.length > 0) {
        avg = marksValues.reduce((a, b) => a + b, 0) / marksValues.length;
    }
}
document.getElementById('marks-val').textContent = avg.toFixed(1);

// Populate Table
const tbody = document.getElementById('marks-table-body');
tbody.innerHTML = '';
if (student.marks && typeof student.marks === 'object') {
    Object.entries(student.marks).forEach(([subject, mark]) => {
        let grade = 'F';
        if (mark >= 90) grade = 'A+';
        else if (mark >= 80) grade = 'A';
        else if (mark >= 70) grade = 'B';
        else if (mark >= 60) grade = 'C';
        else if (mark >= 50) grade = 'D';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${subject}</td>
            <td>${mark}</td>
            <td><span class="badge ${grade === 'F' ? 'badge-rejected' : 'badge-accepted'}">${grade}</span></td>
        `;
        tbody.appendChild(tr);
    });
} else {
    tbody.innerHTML = '<tr><td colspan="3" class="text-muted">No marks data available.</td></tr>';
}

// Render History
function renderHistory() {
    const allReqs = getAllRequests();
    const myReqs = allReqs.filter(r => r.studentId === currentUserId).reverse();
    const container = document.getElementById('history-list');

    if (myReqs.length === 0) {
        container.innerHTML = '<p class="text-muted" style="text-align: center; margin-top: 2rem;">No history found.</p>';
        return;
    }

    container.innerHTML = '';
    myReqs.forEach(req => {
        const item = document.createElement('div');
        item.style.padding = '1rem';
        item.style.borderBottom = '1px solid var(--border)';
        item.innerHTML = `
            <div class="flex justify-between" style="margin-bottom: 0.5rem;">
                <strong>${req.type}</strong>
                <span class="badge badge-${req.status.toLowerCase()}">${req.status}</span>
            </div>
            <p class="text-muted" style="font-size: 0.9rem;">${req.message}</p>
            <small class="text-muted" style="display: block; margin-top: 0.5rem; font-size: 0.75rem;">${req.date}</small>
        `;
        container.appendChild(item);
    });
}
renderHistory();

// Actions
function submitRequest() {
    const type = document.getElementById('req-type').value;
    const msg = document.getElementById('req-msg').value;

    if (!msg.trim()) {
        showToast('Please enter a message', 'error');
        return;
    }

    addRequest({
        studentId: currentUserId,
        type: type,
        message: msg
    });

    document.getElementById('req-msg').value = '';
    renderHistory();
    showToast('Request submitted successfully!', 'success');
}

function logout() {
    localStorage.removeItem('current_user');
    window.location.href = 'index.html';
}
