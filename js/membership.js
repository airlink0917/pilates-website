document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    let selectedPlan = null;
    let planDetails = {
        basic: {
            name: '月4回コース',
            price: '¥19,000（税込）',
            priceValue: 19000
        },
        premium: {
            name: '月8回コース',
            price: '¥33,000（税込）',
            priceValue: 33000
        }
    };

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
        nextButton.style.display = currentStep < 4 ? 'block' : 'none';
        submitButton.style.display = currentStep === 4 ? 'block' : 'none';
    }

    // プラン選択
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(card => {
        card.addEventListener('click', function() {
            planCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedPlan = this.dataset.plan;
        });
    });

    // カード番号の自動フォーマット
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // 有効期限の自動フォーマット
    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }

    // CVVの数字のみ許可
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    // 次へボタンのクリック処理
    nextButton.addEventListener('click', function() {
        if (currentStep === 1 && !selectedPlan) {
            alert('プランを選択してください。');
            return;
        }

        if (currentStep === 2) {
            // お客様情報のバリデーション
            const requiredFields = ['lastName', 'firstName', 'lastNameKana', 'firstNameKana', 'email', 'phone', 'birthdate', 'zipcode', 'address'];
            let isValid = true;
            
            for (let field of requiredFields) {
                const input = document.getElementById(field);
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ff4444';
                } else {
                    input.style.borderColor = '';
                }
            }
            
            if (!isValid) {
                alert('必須項目を入力してください。');
                return;
            }
        }

        if (currentStep === 3) {
            // 支払い情報のバリデーション
            const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
            const cardName = document.getElementById('cardName').value;
            const expiryDate = document.getElementById('expiryDate').value;
            const cvv = document.getElementById('cvv').value;

            if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
                alert('有効なカード番号を入力してください。');
                return;
            }

            if (!cardName) {
                alert('カード名義を入力してください。');
                return;
            }

            if (!expiryDate || !expiryDate.match(/^\d{2}\/\d{2}$/)) {
                alert('有効期限を正しく入力してください（MM/YY）。');
                return;
            }

            if (!cvv || cvv.length < 3 || cvv.length > 4) {
                alert('セキュリティコードを入力してください。');
                return;
            }

            updateConfirmation();
        }

        currentStep++;
        updateStepDisplay();
    });

    // 戻るボタンのクリック処理
    backButton.addEventListener('click', function() {
        currentStep--;
        updateStepDisplay();
    });

    // 確認画面の更新
    function updateConfirmation() {
        const plan = planDetails[selectedPlan];
        document.getElementById('confirmPlan').textContent = plan.name;
        document.getElementById('confirmPrice').textContent = plan.price;
        
        // 次回請求日（翌月の今日）
        const nextBilling = new Date();
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        document.getElementById('confirmNextBilling').textContent = nextBilling.toLocaleDateString('ja-JP');

        // お客様情報
        const lastName = document.getElementById('lastName').value;
        const firstName = document.getElementById('firstName').value;
        document.getElementById('confirmName').textContent = `${lastName} ${firstName}`;
        document.getElementById('confirmEmail').textContent = document.getElementById('email').value;
        document.getElementById('confirmPhone').textContent = document.getElementById('phone').value;

        // カード情報（下4桁のみ表示）
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const maskedCard = '**** **** **** ' + cardNumber.slice(-4);
        document.getElementById('confirmCard').textContent = maskedCard;
    }

    // 申し込み確定処理
    submitButton.addEventListener('click', function() {
        const agreeTerms = document.getElementById('agreeTerms').checked;
        const agreeAutoRenewal = document.getElementById('agreeAutoRenewal').checked;

        if (!agreeTerms || !agreeAutoRenewal) {
            alert('利用規約および自動更新に同意してください。');
            return;
        }

        // 処理中の表示
        submitButton.classList.add('processing');
        submitButton.textContent = '処理中...';

        // 決済処理のシミュレーション
        setTimeout(() => {
            // 会員情報を保存（実際の実装では、サーバーに送信）
            const memberData = {
                id: 'MEM' + Date.now(),
                plan: selectedPlan,
                planName: planDetails[selectedPlan].name,
                price: planDetails[selectedPlan].priceValue,
                name: document.getElementById('lastName').value + ' ' + document.getElementById('firstName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                startDate: new Date().toISOString(),
                nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };

            // LocalStorageに保存
            localStorage.setItem('pilatesMembership', JSON.stringify(memberData));

            // 成功メッセージ
            alert(`月額会員の登録が完了しました！\n\n会員番号: ${memberData.id}\nプラン: ${memberData.planName}\n\n確認メールをお送りしました。`);
            
            // トップページへリダイレクト
            window.location.href = 'index.html';
        }, 2000);
    });

    // ステップクリックでの移動
    steps.forEach((step, index) => {
        step.addEventListener('click', function() {
            if (index + 1 < currentStep) {
                currentStep = index + 1;
                updateStepDisplay();
            }
        });
    });

    // ハンバーガーメニュー
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // 初期表示
    updateStepDisplay();
});