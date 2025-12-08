const DATA_KEY = 'srms_data';

const INITIAL_DATA = {
    students: [
        { id: '101', name: 'Student One', attendance: 75, marks: { Math: 85, Physics: 78, CS: 92 } },
        { id: '102', name: 'Student Two', attendance: 45, marks: { Math: 60, Physics: 55, CS: 70 } },
        { id: '103', name: 'Student Three', attendance: 90, marks: { Math: 95, Physics: 88, CS: 96 } }
    ],
    requests: [
        { id: 1, studentId: '101', type: 'Correction', message: 'My Physics marks are incorrect', status: 'Pending', date: '2023-10-25' }
    ]
};

// Initialize data if not exists
function initData() {
    if (!localStorage.getItem(DATA_KEY)) {
        localStorage.setItem(DATA_KEY, JSON.stringify(INITIAL_DATA));
        console.log('Mock Data Initialized');
    }
}

function getData() {
    initData();
    return JSON.parse(localStorage.getItem(DATA_KEY));
}

function saveData(data) {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

function getStudent(id) {
    const data = getData();
    return data.students.find(s => s.id === id);
}

function addRequest(req) {
    const data = getData();
    req.id = Date.now();
    req.date = new Date().toISOString().split('T')[0];
    req.status = 'Pending';
    data.requests.push(req);
    saveData(data);
}

function updateRequestStatus(reqId, newStatus) {
    const data = getData();
    const req = data.requests.find(r => r.id == reqId);
    if (req) {
        req.status = newStatus;
        saveData(data);
        return true;
    }
    return false;
}

function getAllRequests() {
    return getData().requests;
}

function getAllStudents() {
    return getData().students;
}

function addStudent(student) {
    const data = getData();
    // Check if ID already exists
    if (data.students.some(s => s.id === student.id)) {
        return false;
    }
    data.students.push(student);
    saveData(data);
    return true;
}

function deleteStudent(id) {
    const data = getData();
    const initialLength = data.students.length;
    data.students = data.students.filter(s => s.id !== id);
    if (data.students.length < initialLength) {
        saveData(data);
        return true;
    }
    saveData(data);
    return true;
}

function updateStudent(updatedStudent) {
    const data = getData();
    const index = data.students.findIndex(s => s.id === updatedStudent.id);
    if (index !== -1) {
        data.students[index] = updatedStudent;
        saveData(data);
        return true;
    }
    return false;
}
