// 予約データを管理する共有ストレージ
const reservationStorage = {
    getReservations: function() {
        const data = localStorage.getItem('pilatesReservations');
        return data ? JSON.parse(data) : [];
    },
    
    addReservation: function(reservation) {
        const reservations = this.getReservations();
        reservations.push(reservation);
        localStorage.setItem('pilatesReservations', JSON.stringify(reservations));
    },
    
    isTimeSlotAvailable: function(date, time, type) {
        const reservations = this.getReservations();
        const dateStr = date.toLocaleDateString('ja-JP');
        
        const conflictingReservations = reservations.filter(r => 
            r.date === dateStr && r.time === time
        );
        
        if (type === 'trial') {
            return conflictingReservations.filter(r => r.type === 'trial').length === 0;
        } else {
            return conflictingReservations.length < 8;
        }
    },
    
    getAvailableSlots: function(date, type) {
        const slots = [];
        const baseSlots = [
            { time: '09:00', maxCapacity: type === 'trial' ? 1 : 8 },
            { time: '10:30', maxCapacity: type === 'trial' ? 1 : 8 },
            { time: '12:00', maxCapacity: type === 'trial' ? 1 : 8 },
            { time: '14:00', maxCapacity: type === 'trial' ? 1 : 8 },
            { time: '15:30', maxCapacity: type === 'trial' ? 1 : 8 },
            { time: '17:00', maxCapacity: type === 'trial' ? 1 : 8 },
            { time: '18:30', maxCapacity: type === 'trial' ? 1 : 8 },
            { time: '20:00', maxCapacity: type === 'trial' ? 1 : 8 }
        ];
        
        const dateStr = date.toLocaleDateString('ja-JP');
        const reservations = this.getReservations();
        
        baseSlots.forEach(slot => {
            const reservationsAtTime = reservations.filter(r => 
                r.date === dateStr && r.time === slot.time
            );
            
            if (type === 'trial') {
                const trialReservations = reservationsAtTime.filter(r => r.type === 'trial');
                const available = trialReservations.length === 0 ? slot.maxCapacity - reservationsAtTime.length : 0;
                slots.push({ ...slot, available: Math.max(0, available) });
            } else {
                const available = slot.maxCapacity - reservationsAtTime.length;
                slots.push({ ...slot, available: Math.max(0, available) });
            }
        });
        
        return slots;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    let selectedLesson = null;
    let selectedDate = null;
    let selectedTime = null;
    let currentMonth = new Date();

    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    const backButton = document.getElementById('backButton');
    const nextButton = document.getElementById('nextButton');
    const submitButton = document.getElementById('submitButton');

    function updateStepDisplay() {
        steps.forEach((step, index) => {
            if (index + 1 <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        stepContents.forEach((content, index) => {
            if (index + 1 === currentStep) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        backButton.style.display = currentStep > 1 ? 'block' : 'none';
        nextButton.style.display = currentStep < 3 ? 'block' : 'none';
        submitButton.style.display = currentStep === 3 ? 'block' : 'none';
    }

    const lessonCards = document.querySelectorAll('.lesson-card');
    lessonCards.forEach(card => {
        card.addEventListener('click', function() {
            lessonCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedLesson = this.dataset.lesson;
        });
    });

    function generateCalendar() {
        const calendar = document.getElementById('calendar');
        const monthDisplay = document.getElementById('currentMonth');
        
        calendar.innerHTML = '';
        
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
        monthDisplay.textContent = `${year}年${month + 1}月`;
        
        const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
        daysOfWeek.forEach(day => {
            const dayLabel = document.createElement('div');
            dayLabel.className = 'day-label';
            dayLabel.textContent = day;
            calendar.appendChild(dayLabel);
        });
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            calendar.appendChild(emptyDay);
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            const currentDate = new Date(year, month, day);
            
            if (currentDate < today) {
                dayElement.classList.add('disabled');
            } else {
                if (currentDate.toDateString() === today.toDateString()) {
                    dayElement.classList.add('today');
                }
                
                dayElement.addEventListener('click', function() {
                    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedDate = currentDate;
                    generateTimeslots();
                });
            }
            
            calendar.appendChild(dayElement);
        }
    }

    function generateTimeslots() {
        const timeslotsContainer = document.getElementById('timeslots');
        timeslotsContainer.innerHTML = '';
        
        const slots = reservationStorage.getAvailableSlots(selectedDate, 'member');
        
        slots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = 'timeslot';
            
            if (slot.available === 0) {
                slotElement.classList.add('disabled');
                slotElement.innerHTML = `
                    ${slot.time}
                    <div class="timeslot-status">満席</div>
                `;
            } else {
                slotElement.innerHTML = `
                    ${slot.time}
                    <div class="timeslot-status">残${slot.available}席</div>
                `;
                
                slotElement.addEventListener('click', function() {
                    document.querySelectorAll('.timeslot').forEach(t => t.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedTime = slot.time;
                });
            }
            
            timeslotsContainer.appendChild(slotElement);
        });
    }

    document.getElementById('prevMonth').addEventListener('click', function() {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        generateCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', function() {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        generateCalendar();
    });

    nextButton.addEventListener('click', function() {
        if (currentStep === 1 && !selectedLesson) {
            alert('レッスンを選択してください。');
            return;
        }
        if (currentStep === 2 && (!selectedDate || !selectedTime)) {
            alert('日時を選択してください。');
            return;
        }
        
        if (currentStep === 2) {
            updateSummary();
        }
        
        currentStep++;
        updateStepDisplay();
    });

    backButton.addEventListener('click', function() {
        currentStep--;
        updateStepDisplay();
    });

    function updateSummary() {
        const lessonNames = {
            'beginner': 'ビギナークラス',
            'intermediate': 'ベーシッククラス',
            'advanced': 'アドバンスクラス',
            'private': 'プライベートレッスン'
        };
        
        document.getElementById('selectedLesson').textContent = lessonNames[selectedLesson];
        document.getElementById('selectedDate').textContent = selectedDate.toLocaleDateString('ja-JP');
        document.getElementById('selectedTime').textContent = selectedTime;
    }

    submitButton.addEventListener('click', function() {
        const memberName = document.getElementById('memberName').value;
        const memberEmail = document.getElementById('memberEmail').value;
        const memberPhone = document.getElementById('memberPhone').value;
        
        if (!memberName || !memberEmail || !memberPhone) {
            alert('必須項目を入力してください。');
            return;
        }
        
        // 予約を保存
        const lessonNames = {
            'beginner': 'ビギナークラス',
            'intermediate': 'ベーシッククラス',
            'advanced': 'アドバンスクラス',
            'private': 'プライベートレッスン'
        };
        
        const reservation = {
            type: 'member',
            lesson: lessonNames[selectedLesson],
            date: selectedDate.toLocaleDateString('ja-JP'),
            time: selectedTime,
            name: document.getElementById('memberName').value,
            email: document.getElementById('memberEmail').value,
            phone: document.getElementById('memberPhone').value,
            createdAt: new Date().toISOString()
        };
        
        reservationStorage.addReservation(reservation);
        
        alert('予約が完了しました。確認メールをお送りしています。');
        window.location.href = 'index.html';
    });

    steps.forEach((step, index) => {
        step.addEventListener('click', function() {
            if (index + 1 < currentStep) {
                currentStep = index + 1;
                updateStepDisplay();
            }
        });
    });

    generateCalendar();
    updateStepDisplay();

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
});