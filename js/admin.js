// Basic stats
const students = getAllStudents();
const requests = getAllRequests();

let isEditing = false;
let editingId = null;

document.getElementById('total-students').textContent = students.length;

function renderDashboard() {
    const allReqs = getAllRequests();
    const pending = allReqs.filter(r => r.status === 'Pending');

    document.getElementById('pending-count').textContent = pending.length;

    // Render Requests
    const container = document.getElementById('requests-list');
    container.innerHTML = '';

    if (allReqs.length === 0) {
        container.innerHTML = '<p class="text-muted">No requests found.</p>';
    } else {
        const sortedReqs = [...allReqs].sort((a, b) => (a.status === 'Pending' ? -1 : 1)); // Pending first

        sortedReqs.forEach(req => {
            const student = getStudent(req.studentId);
            const div = document.createElement('div');
            div.className = 'req-item';
            div.style.padding = '1rem';
            div.style.borderBottom = '1px solid var(--border)';
            div.style.background = req.status === 'Pending' ? 'rgba(255,255,255,0.02)' : 'transparent';

            let actions = '';
            if (req.status === 'Pending') {
                actions = `
                    <div style="gap: 0.5rem; display: flex; margin-top: 0.5rem;">
                        <button onclick="processRequest(${req.id}, 'Accepted')" class="btn btn-success" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">Accept</button>
                        <button onclick="processRequest(${req.id}, 'Rejected')" class="btn btn-danger" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">Reject</button>
                    </div>
                `;
            }

            div.innerHTML = `
                <div class="flex justify-between">
                    <div>
                        <strong style="color: var(--primary);">${student ? student.name : 'Unknown User'}</strong>
                        <span class="text-muted" style="font-size: 0.85rem;">(${req.studentId})</span>
                    </div>
                    <span class="badge badge-${req.status.toLowerCase()}">${req.status}</span>
                </div>
                <div style="margin-top: 0.5rem; font-weight: 500;">${req.type}</div>
                <p class="text-muted" style="font-size: 0.9rem;">${req.message}</p>
                <small class="text-muted" style="display: block; margin-top: 0.25rem;">${req.date}</small>
                ${actions}
            `;
            container.appendChild(div);
        });
    }

    // Render Student List Sidepanel
    renderStudentList(getAllStudents());
}


function handleAddNewStudent() {
    const name = document.getElementById('new-name').value;
    const id = document.getElementById('new-id').value;
    const att = document.getElementById('new-att').value;
    const mMath = document.getElementById('mark-math').value;
    const mPhy = document.getElementById('mark-phy').value;
    const mCs = document.getElementById('mark-cs').value;

    if (!name || !id || !att || !mMath || !mPhy || !mCs) {
        showToast('Please fill all fields', 'error');
        return;
    }

    const newStudent = {
        id: id,
        name: name,
        attendance: parseInt(att),
        marks: {
            Math: parseInt(mMath),
            Physics: parseInt(mPhy),
            CS: parseInt(mCs)
        }
    };

    if (isEditing) {
        // Update existing
        if (updateStudent(newStudent)) {
            showToast('Student updated successfully!', 'success');
            resetForm();
        } else {
            showToast('Failed to update student', 'error');
        }
    } else {
        // Add new
        if (addStudent(newStudent)) {
            showToast('Student added successfully!', 'success');
            resetForm();
        } else {
            showToast('Student ID already exists!', 'error');
        }
    }
}

function resetForm() {
    document.getElementById('new-name').value = '';
    document.getElementById('new-id').value = '';
    document.getElementById('new-att').value = '';
    document.getElementById('mark-math').value = '';
    document.getElementById('mark-phy').value = '';
    document.getElementById('mark-cs').value = '';

    // Reset state
    isEditing = false;
    editingId = null;
    document.getElementById('new-id').disabled = false;
    document.querySelector('.card h3').textContent = '➕ Add New Student';
    document.querySelector('.card button').textContent = 'Add Student';

    // Refresh list
    const updatedStudents = getAllStudents();
    renderStudentList(updatedStudents);
    document.getElementById('total-students').textContent = updatedStudents.length;
}

function editStudent(id) {
    const student = getStudent(id);
    if (student) {
        isEditing = true;
        editingId = id;

        document.getElementById('new-name').value = student.name;
        document.getElementById('new-id').value = student.id;
        document.getElementById('new-id').disabled = true; // Cannot change ID
        document.getElementById('new-att').value = student.attendance;
        document.getElementById('mark-math').value = student.marks.Math;
        document.getElementById('mark-phy').value = student.marks.Physics;
        document.getElementById('mark-cs').value = student.marks.CS;

        document.querySelector('.card h3').textContent = '✏️ Edit Student';
        document.querySelector('.card button').textContent = 'Update Student';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function renderStudentList(list) {
    const studList = document.getElementById('student-list');
    studList.innerHTML = '';
    list.forEach(s => {
        const li = document.createElement('li');
        li.style.padding = '0.5rem 0';
        li.style.borderBottom = '1px solid var(--border)';
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.innerHTML = `
            <div>
                <div><strong>${s.name}</strong></div>
                <div class="text-muted" style="font-size: 0.8rem;">Att: ${s.attendance}%</div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="editStudent('${s.id}')" class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">✏️</button>
                <button onclick="handleDeleteStudent('${s.id}')" class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">🗑️</button>
            </div>
        `;
        studList.appendChild(li);
    });
}

function handleDeleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        if (deleteStudent(id)) {
            showToast('Student deleted successfully', 'success');
            // Check if we were editing this student
            if (editingId === id) {
                resetForm();
            } else {
                // Refresh just the list
                const updatedStudents = getAllStudents();
                renderStudentList(updatedStudents);
                document.getElementById('total-students').textContent = updatedStudents.length;
            }
        } else {
            showToast('Failed to delete student', 'error');
        }
    }
}

function processRequest(id, status) {
    if (confirm(`Are you sure you want to mark this request as ${status}?`)) {
        updateRequestStatus(id, status);
        renderDashboard();
        showToast(`Request marked as ${status}`, status === 'Accepted' ? 'success' : 'info');
    }
}

function logout() {
    window.location.href = 'index.html';
}

// Initial render
renderDashboard();
