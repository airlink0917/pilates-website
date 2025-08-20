const reservationStorage = {
    getReservations: function() {
        const data = localStorage.getItem('pilatesReservations');
        return data ? JSON.parse(data) : [];
    },
    
    updateReservation: function(index, updatedData) {
        const reservations = this.getReservations();
        reservations[index] = { ...reservations[index], ...updatedData };
        localStorage.setItem('pilatesReservations', JSON.stringify(reservations));
    },
    
    deleteReservation: function(index) {
        const reservations = this.getReservations();
        reservations.splice(index, 1);
        localStorage.setItem('pilatesReservations', JSON.stringify(reservations));
    }
};

const memberStorage = {
    getMembers: function() {
        const data = localStorage.getItem('pilatesMembers');
        return data ? JSON.parse(data) : [];
    },
    
    addMember: function(member) {
        const members = this.getMembers();
        member.id = 'M' + Date.now();
        member.registeredDate = new Date().toISOString();
        members.push(member);
        localStorage.setItem('pilatesMembers', JSON.stringify(members));
    },
    
    updateMember: function(index, updatedData) {
        const members = this.getMembers();
        members[index] = { ...members[index], ...updatedData };
        localStorage.setItem('pilatesMembers', JSON.stringify(members));
    },
    
    deleteMember: function(index) {
        const members = this.getMembers();
        members.splice(index, 1);
        localStorage.setItem('pilatesMembers', JSON.stringify(members));
    }
};

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    loadOverview();
    loadReservations();
    loadMembers();
    initCharts();
    initEventListeners();
});

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.dataset.section;
            
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
            
            if (targetSection === 'analytics') {
                updateCharts();
            }
        });
    });
}

function loadOverview() {
    const reservations = reservationStorage.getReservations();
    const today = new Date().toLocaleDateString('ja-JP');
    
    const todayReservations = reservations.filter(r => r.date === today);
    document.getElementById('todayReservations').textContent = todayReservations.length;
    
    const members = memberStorage.getMembers();
    document.getElementById('totalMembers').textContent = members.length;
    
    const monthlyRevenue = calculateMonthlyRevenue();
    document.getElementById('monthlyRevenue').textContent = monthlyRevenue.toLocaleString();
    
    const occupancyRate = calculateOccupancyRate();
    document.getElementById('occupancyRate').textContent = occupancyRate;
    
    loadRecentActivities();
}

function loadRecentActivities() {
    const reservations = reservationStorage.getReservations();
    const activityList = document.getElementById('activityList');
    
    if (reservations.length === 0) {
        activityList.innerHTML = '<p class="no-data">データがありません</p>';
        return;
    }
    
    const sortedReservations = reservations
        .filter(r => r.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    activityList.innerHTML = sortedReservations.map(reservation => `
        <div class="activity-item">
            <div class="activity-info">
                <div class="activity-title">${reservation.name}様が${reservation.lesson}を予約</div>
                <div class="activity-time">${formatDateTime(reservation.createdAt)}</div>
            </div>
        </div>
    `).join('');
}

function loadReservations() {
    const reservations = reservationStorage.getReservations();
    const tableBody = document.getElementById('reservationsTableBody');
    
    if (reservations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="no-data">予約データがありません</td></tr>';
        return;
    }
    
    tableBody.innerHTML = reservations.map((reservation, index) => {
        const status = getReservationStatus(reservation);
        return `
            <tr>
                <td>${reservation.date}</td>
                <td>${reservation.time}</td>
                <td>${reservation.name}</td>
                <td>${reservation.lesson}</td>
                <td>${reservation.email}</td>
                <td>${reservation.phone}</td>
                <td><span class="status-badge status-${status}">${getStatusLabel(status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editReservation(${index})">編集</button>
                        <button class="btn-delete" onclick="deleteReservation(${index})">削除</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function loadMembers() {
    const members = memberStorage.getMembers();
    const tableBody = document.getElementById('membersTableBody');
    
    if (members.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="no-data">会員データがありません</td></tr>';
        return;
    }
    
    tableBody.innerHTML = members.map((member, index) => `
        <tr>
            <td>${member.id}</td>
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td>${member.phone}</td>
            <td>${formatDate(member.registeredDate)}</td>
            <td>${member.plan || 'スタンダード'}</td>
            <td><span class="status-badge status-upcoming">アクティブ</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editMember(${index})">編集</button>
                    <button class="btn-delete" onclick="deleteMember(${index})">削除</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getReservationStatus(reservation) {
    const reservationDate = new Date(reservation.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (reservation.status) {
        return reservation.status;
    }
    
    if (reservationDate < today) {
        return 'completed';
    } else {
        return 'upcoming';
    }
}

function getStatusLabel(status) {
    const labels = {
        'upcoming': '予定',
        'completed': '完了',
        'cancelled': 'キャンセル'
    };
    return labels[status] || status;
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) {
        return 'たった今';
    } else if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分前';
    } else if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '時間前';
    } else {
        return date.toLocaleDateString('ja-JP');
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ja-JP');
}

function calculateMonthlyRevenue() {
    const reservations = reservationStorage.getReservations();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyReservations = reservations.filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const prices = {
        'ビギナークラス': 3000,
        'ベーシッククラス': 3500,
        'アドバンスクラス': 4000,
        'プライベートレッスン': 8000,
        '体験レッスン': 1000
    };
    
    return monthlyReservations.reduce((total, r) => {
        return total + (prices[r.lesson] || 3000);
    }, 0);
}

function calculateOccupancyRate() {
    const reservations = reservationStorage.getReservations();
    const totalSlots = 8 * 8;
    const occupiedSlots = reservations.filter(r => {
        const date = new Date(r.date);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }).length;
    
    return Math.round((occupiedSlots / totalSlots) * 100);
}

let currentEditIndex = null;

function editReservation(index) {
    currentEditIndex = index;
    const reservations = reservationStorage.getReservations();
    const reservation = reservations[index];
    
    document.getElementById('editName').value = reservation.name;
    document.getElementById('editEmail').value = reservation.email;
    document.getElementById('editPhone').value = reservation.phone;
    document.getElementById('editStatus').value = getReservationStatus(reservation);
    
    document.getElementById('editModal').classList.add('active');
}

function deleteReservation(index) {
    if (confirm('この予約を削除してもよろしいですか？')) {
        reservationStorage.deleteReservation(index);
        loadReservations();
        loadOverview();
    }
}

function editMember(index) {
    alert('会員編集機能は準備中です');
}

function deleteMember(index) {
    if (confirm('この会員を削除してもよろしいですか？')) {
        memberStorage.deleteMember(index);
        loadMembers();
        loadOverview();
    }
}

function closeModal() {
    document.getElementById('editModal').classList.remove('active');
    currentEditIndex = null;
}

function showAddMemberModal() {
    alert('新規会員追加機能は準備中です');
}

function exportReservations() {
    const reservations = reservationStorage.getReservations();
    const csv = convertToCSV(reservations);
    downloadCSV(csv, 'reservations.csv');
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') 
                ? `"${value}"` 
                : value;
        }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearAllData() {
    if (confirm('すべてのデータを削除します。この操作は取り消せません。本当に実行しますか？')) {
        if (confirm('最終確認：本当にすべてのデータを削除してもよろしいですか？')) {
            localStorage.removeItem('pilatesReservations');
            localStorage.removeItem('pilatesMembers');
            location.reload();
        }
    }
}

function initEventListeners() {
    document.getElementById('dateFilter').addEventListener('change', function() {
        filterReservations();
    });
    
    document.getElementById('statusFilter').addEventListener('change', function() {
        filterReservations();
    });
    
    document.getElementById('memberSearch').addEventListener('input', function() {
        filterMembers(this.value);
    });
    
    document.getElementById('editForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (currentEditIndex !== null) {
            const updatedData = {
                name: document.getElementById('editName').value,
                email: document.getElementById('editEmail').value,
                phone: document.getElementById('editPhone').value,
                status: document.getElementById('editStatus').value
            };
            
            reservationStorage.updateReservation(currentEditIndex, updatedData);
            loadReservations();
            closeModal();
        }
    });
    
    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            periodBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateCharts(this.dataset.period);
        });
    });
}

function filterReservations() {
    const dateFilter = document.getElementById('dateFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    let reservations = reservationStorage.getReservations();
    
    if (dateFilter) {
        const filterDate = new Date(dateFilter).toLocaleDateString('ja-JP');
        reservations = reservations.filter(r => r.date === filterDate);
    }
    
    if (statusFilter !== 'all') {
        reservations = reservations.filter(r => getReservationStatus(r) === statusFilter);
    }
    
    const tableBody = document.getElementById('reservationsTableBody');
    
    if (reservations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="no-data">該当する予約がありません</td></tr>';
        return;
    }
    
    tableBody.innerHTML = reservations.map((reservation, index) => {
        const status = getReservationStatus(reservation);
        return `
            <tr>
                <td>${reservation.date}</td>
                <td>${reservation.time}</td>
                <td>${reservation.name}</td>
                <td>${reservation.lesson}</td>
                <td>${reservation.email}</td>
                <td>${reservation.phone}</td>
                <td><span class="status-badge status-${status}">${getStatusLabel(status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editReservation(${index})">編集</button>
                        <button class="btn-delete" onclick="deleteReservation(${index})">削除</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterMembers(searchTerm) {
    let members = memberStorage.getMembers();
    
    if (searchTerm) {
        searchTerm = searchTerm.toLowerCase();
        members = members.filter(m => 
            m.name.toLowerCase().includes(searchTerm) || 
            m.email.toLowerCase().includes(searchTerm)
        );
    }
    
    const tableBody = document.getElementById('membersTableBody');
    
    if (members.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="no-data">該当する会員がありません</td></tr>';
        return;
    }
    
    tableBody.innerHTML = members.map((member, index) => `
        <tr>
            <td>${member.id}</td>
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td>${member.phone}</td>
            <td>${formatDate(member.registeredDate)}</td>
            <td>${member.plan || 'スタンダード'}</td>
            <td><span class="status-badge status-upcoming">アクティブ</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editMember(${index})">編集</button>
                    <button class="btn-delete" onclick="deleteMember(${index})">削除</button>
                </div>
            </td>
        </tr>
    `).join('');
}

let charts = {};

function initCharts() {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false
    };
    
    const reservationsCtx = document.getElementById('reservationsChart');
    if (reservationsCtx) {
        charts.reservations = new Chart(reservationsCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '予約数',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: chartOptions
        });
    }
    
    const popularLessonsCtx = document.getElementById('popularLessonsChart');
    if (popularLessonsCtx) {
        charts.popularLessons = new Chart(popularLessonsCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f59e0b',
                        '#10b981',
                        '#ef4444'
                    ]
                }]
            },
            options: chartOptions
        });
    }
    
    const timeSlotCtx = document.getElementById('timeSlotChart');
    if (timeSlotCtx) {
        charts.timeSlot = new Chart(timeSlotCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: '予約数',
                    data: [],
                    backgroundColor: '#667eea'
                }]
            },
            options: chartOptions
        });
    }
    
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        charts.revenue = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '売上',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                ...chartOptions,
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return '¥' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
}

function updateCharts(period = 'week') {
    const reservations = reservationStorage.getReservations();
    
    const dates = generateDateLabels(period);
    const reservationCounts = dates.map(date => {
        return reservations.filter(r => r.date === date).length;
    });
    
    if (charts.reservations) {
        charts.reservations.data.labels = dates;
        charts.reservations.data.datasets[0].data = reservationCounts;
        charts.reservations.update();
    }
    
    const lessonCounts = {};
    reservations.forEach(r => {
        lessonCounts[r.lesson] = (lessonCounts[r.lesson] || 0) + 1;
    });
    
    if (charts.popularLessons) {
        charts.popularLessons.data.labels = Object.keys(lessonCounts);
        charts.popularLessons.data.datasets[0].data = Object.values(lessonCounts);
        charts.popularLessons.update();
    }
    
    const timeSlots = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30', '20:00'];
    const timeSlotCounts = timeSlots.map(time => {
        return reservations.filter(r => r.time === time).length;
    });
    
    if (charts.timeSlot) {
        charts.timeSlot.data.labels = timeSlots;
        charts.timeSlot.data.datasets[0].data = timeSlotCounts;
        charts.timeSlot.update();
    }
    
    const prices = {
        'ビギナークラス': 3000,
        'ベーシッククラス': 3500,
        'アドバンスクラス': 4000,
        'プライベートレッスン': 8000,
        '体験レッスン': 1000
    };
    
    const revenues = dates.map(date => {
        const dayReservations = reservations.filter(r => r.date === date);
        return dayReservations.reduce((total, r) => {
            return total + (prices[r.lesson] || 3000);
        }, 0);
    });
    
    if (charts.revenue) {
        charts.revenue.data.labels = dates;
        charts.revenue.data.datasets[0].data = revenues;
        charts.revenue.update();
    }
}

function generateDateLabels(period) {
    const labels = [];
    const today = new Date();
    
    let days = 7;
    if (period === 'month') days = 30;
    if (period === 'year') days = 365;
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('ja-JP'));
    }
    
    return labels;
}