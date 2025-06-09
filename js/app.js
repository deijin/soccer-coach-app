// データ格納用
let players = [];
let practices = [];
let diary = '';

// ローカルストレージ関連の関数
function saveData() {
    localStorage.setItem('soccerCoachPlayers', JSON.stringify(players));
    localStorage.setItem('soccerCoachPractices', JSON.stringify(practices));
    localStorage.setItem('soccerCoachDiary', diary);
}

function loadData() {
    try {
        const savedPlayers = localStorage.getItem('soccerCoachPlayers');
        if (savedPlayers) {
            players = JSON.parse(savedPlayers);
            
            // 古いデータ形式の互換性対応（特徴・課題を分離）
            players.forEach(player => {
                if (player.notes && (!player.strengths && !player.issues)) {
                    player.strengths = player.notes;
                    player.issues = '';
                    delete player.notes;
                }
            });
        }
        
        const savedPractices = localStorage.getItem('soccerCoachPractices');
        if (savedPractices) {
            practices = JSON.parse(savedPractices);
        }
        
        const savedDiary = localStorage.getItem('soccerCoachDiary');
        if (savedDiary) {
            diary = savedDiary;
        }
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
    }
}

// 選手関連の関数
function renderPlayersList() {
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';
    
    if (players.length === 0) {
        playersList.innerHTML = '<p>選手が登録されていません。</p>';
        return;
    }
    
    players.forEach((player, index) => {
        const playerItem = document.createElement('div');
        playerItem.className = 'list-item player-list-item';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'player-name';
        nameSpan.textContent = player.name || '名前なし';
        
        const positionSpan = document.createElement('span');
        positionSpan.className = 'player-position-tag';
        
        // ポジションテキストを表示（20字を超える場合はtitle属性に完全なテキストを設定）
        const positionText = player.position || '';
        positionSpan.textContent = positionText;
        
        if (positionText.length > 20) {
            positionSpan.title = positionText; // 完全なテキストをツールチップに表示
        }
        
        playerItem.appendChild(nameSpan);
        playerItem.appendChild(positionSpan);
        
        playerItem.dataset.index = index;
        playerItem.addEventListener('click', () => openPlayerDetail(index));
        playersList.appendChild(playerItem);
    });
}

function openPlayerDetail(index) {
    const player = players[index];
    const playerDetail = document.getElementById('player-detail');
    const playersList = document.getElementById('players-list');
    
    document.getElementById('player-detail-name').textContent = player.name || '新規選手';
    document.getElementById('player-name').value = player.name || '';
    document.getElementById('player-position').value = player.position || '';
    document.getElementById('player-strengths').value = player.strengths || '';
    document.getElementById('player-issues').value = player.issues || '';
    
    playerDetail.dataset.index = index;
    playerDetail.classList.remove('hidden');
    playersList.classList.add('hidden');
    
    // 名前フィールドにフォーカスを設定
    setTimeout(() => {
        document.getElementById('player-name').focus();
    }, 0);
}

function savePlayerDetail() {
    const index = parseInt(document.getElementById('player-detail').dataset.index);
    const name = document.getElementById('player-name').value.trim();
    const position = document.getElementById('player-position').value.trim();
    const strengths = document.getElementById('player-strengths').value.trim();
    const issues = document.getElementById('player-issues').value.trim();
    
    if (!name) {
        alert('名前を入力してください');
        return;
    }
    
    if (index >= 0 && index < players.length) {
        // 既存選手の更新
        players[index] = { name, position, strengths, issues };
    } else {
        // 新規選手の追加
        players.push({ name, position, strengths, issues });
    }
    
    saveData();
    closePlayerDetail();
    renderPlayersList();
}

function closePlayerDetail() {
    document.getElementById('player-detail').classList.add('hidden');
    document.getElementById('players-list').classList.remove('hidden');
}

// 練習メニュー関連の関数
function renderPracticeList() {
    const practiceList = document.getElementById('practice-list');
    practiceList.innerHTML = '';
    
    if (practices.length === 0) {
        practiceList.innerHTML = '<p>練習メニューが登録されていません。</p>';
        return;
    }
    
    practices.forEach((practice, index) => {
        const practiceItem = document.createElement('div');
        practiceItem.className = 'list-item';
        practiceItem.textContent = practice.title || '名前なし';
        practiceItem.dataset.index = index;
        practiceItem.addEventListener('click', () => openPracticeDetail(index));
        practiceList.appendChild(practiceItem);
    });
}

function openPracticeDetail(index) {
    const practice = practices[index] || {};
    const practiceDetail = document.getElementById('practice-detail');
    const practiceList = document.getElementById('practice-list');
    
    document.getElementById('practice-detail-title').textContent = practice.title || '新規メニュー';
    document.getElementById('practice-title').value = practice.title || '';
    document.getElementById('practice-time').value = practice.time || '';
    document.getElementById('practice-equipment').value = practice.equipment || '';
    document.getElementById('practice-steps').value = practice.steps || '';
    document.getElementById('practice-points').value = practice.points || '';
    
    // YouTube URLの処理
    const youtubeInput = document.getElementById('practice-youtube');
    youtubeInput.value = practice.youtube || '';
    
    // YouTube URLのリンク表示を更新
    updateYoutubeLink(practice.youtube || '');
    
    practiceDetail.dataset.index = index;
    practiceDetail.classList.remove('hidden');
    practiceList.classList.add('hidden');
    
    // 新規追加時はフォーカスをタイトルフィールドに設定
    setTimeout(() => {
        document.getElementById('practice-title').focus();
    }, 0);
}

// YouTube URLからリンクを作成する関数
function updateYoutubeLink(url) {
    // 既存のリンク要素があれば削除
    const existingLink = document.getElementById('youtube-link-container');
    if (existingLink) {
        existingLink.remove();
    }
    
    // URLが空でなければリンクを作成
    if (url && url.trim() !== '') {
        const linkContainer = document.createElement('div');
        linkContainer.id = 'youtube-link-container';
        linkContainer.className = 'youtube-link-container';
        
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.textContent = 'YouTubeで開く';
        link.className = 'youtube-link';
        
        linkContainer.appendChild(link);
        
        // YouTube入力フィールドの後に挿入
        const youtubeField = document.getElementById('practice-youtube');
        youtubeField.parentNode.appendChild(linkContainer);
    }
}

function savePracticeDetail() {
    const index = parseInt(document.getElementById('practice-detail').dataset.index);
    const title = document.getElementById('practice-title').value.trim();
    const time = document.getElementById('practice-time').value.trim();
    const equipment = document.getElementById('practice-equipment').value.trim();
    const steps = document.getElementById('practice-steps').value.trim();
    const points = document.getElementById('practice-points').value.trim();
    const youtube = document.getElementById('practice-youtube').value.trim();
    
    if (!title) {
        alert('タイトルを入力してください');
        return;
    }
    
    const practiceData = { title, time, equipment, steps, points, youtube };
    
    if (index >= 0 && index < practices.length) {
        // 既存メニューの更新
        practices[index] = practiceData;
    } else {
        // 新規メニューの追加
        practices.push(practiceData);
    }
    
    saveData();
    closePracticeDetail();
    renderPracticeList();
}

function closePracticeDetail() {
    document.getElementById('practice-detail').classList.add('hidden');
    document.getElementById('practice-list').classList.remove('hidden');
}

// 指導日記関連の関数
function renderDiary() {
    document.getElementById('diary-content').value = diary;
}

function saveDiary() {
    diary = document.getElementById('diary-content').value;
    saveData();
    alert('日記を保存しました');
}

// 画面遷移関連の関数
function showSection(sectionId) {
    // すべてのセクションを非表示
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // ホームメニューの表示/非表示
    const homeMenu = document.querySelector('.home-menu');
    if (sectionId === 'home') {
        homeMenu.classList.remove('hidden');
    } else {
        homeMenu.classList.add('hidden');
        // 指定されたセクションを表示
        document.getElementById(sectionId).classList.remove('hidden');
    }
}

// イベントリスナーの設定
function setupEventListeners() {
    // メインナビゲーション
    document.getElementById('players-btn').addEventListener('click', function() {
        showSection('players-section');
        renderPlayersList();
    });
    
    document.getElementById('practice-btn').addEventListener('click', function() {
        showSection('practice-section');
        renderPracticeList();
    });
    
    document.getElementById('diary-btn').addEventListener('click', function() {
        showSection('diary-section');
        renderDiary();
    });
    
    // データ管理関連
    document.getElementById('export-btn').addEventListener('click', exportData);
    
    document.getElementById('import-file').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                importData(e.target.result);
            };
            reader.readAsText(file);
        }
    });
    
    // 選手関連
    document.getElementById('add-player-btn').addEventListener('click', () => {
        document.getElementById('player-detail').dataset.index = -1;
        document.getElementById('player-detail-name').textContent = '新規選手';
        document.getElementById('player-name').value = '';
        document.getElementById('player-position').value = '';
        document.getElementById('player-strengths').value = '';
        document.getElementById('player-issues').value = '';
        
        document.getElementById('player-detail').classList.remove('hidden');
        document.getElementById('players-list').classList.add('hidden');
        
        // 新規追加時はフォーカスを名前フィールドに設定
        setTimeout(() => {
            document.getElementById('player-name').focus();
        }, 0);
    });
    
    document.getElementById('back-from-players').addEventListener('click', () => {
        showSection('home');
    });
    
    document.getElementById('back-from-player-detail').addEventListener('click', closePlayerDetail);
    document.getElementById('save-player').addEventListener('click', savePlayerDetail);
    
    // 練習メニュー関連
    document.getElementById('add-practice-btn').addEventListener('click', () => {
        document.getElementById('practice-detail').dataset.index = -1;
        document.getElementById('practice-detail-title').textContent = '新規メニュー';
        document.getElementById('practice-title').value = '';
        document.getElementById('practice-time').value = '';
        document.getElementById('practice-equipment').value = '';
        document.getElementById('practice-steps').value = '';
        document.getElementById('practice-points').value = '';
        document.getElementById('practice-youtube').value = '';
        
        // YouTube URLのリンクを更新
        updateYoutubeLink('');
        
        document.getElementById('practice-detail').classList.remove('hidden');
        document.getElementById('practice-list').classList.add('hidden');
        
        // 新規追加時はフォーカスをタイトルフィールドに設定
        setTimeout(() => {
            document.getElementById('practice-title').focus();
        }, 0);
    });
    
    document.getElementById('back-from-practice').addEventListener('click', () => {
        showSection('home');
    });
    
    document.getElementById('back-from-practice-detail').addEventListener('click', closePracticeDetail);
    document.getElementById('save-practice').addEventListener('click', savePracticeDetail);
    
    // YouTube URLの入力フィールドの変更を監視
    document.getElementById('practice-youtube').addEventListener('input', function() {
        updateYoutubeLink(this.value);
    });
    
    // 指導日記関連
    document.getElementById('back-from-diary').addEventListener('click', () => {
        showSection('home');
    });
    
    document.getElementById('save-diary').addEventListener('click', saveDiary);
}

// アプリ初期化
function initApp() {
    loadData();
    setupEventListeners();
    
    // 初期表示はホーム画面
    showSection('home');
    
    // モバイルデバイスの検出と最適化
    setupMobileOptimization();
}

// モバイルデバイス向けの最適化
function setupMobileOptimization() {
    // タッチデバイスの検出
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        // タッチデバイス用のクラスを追加
        document.body.classList.add('touch-device');
        
        // テキストエリアのフォーカス時に画面を調整
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            textarea.addEventListener('focus', function() {
                // スクロールして要素が見えるようにする
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        });
        
        // 入力フィールドのフォーカス時にズームを防止
        const inputs = document.querySelectorAll('input[type="text"], input[type="url"]');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                // iOS での自動ズームを防止
                document.body.style.fontSize = '16px';
            });
            
            input.addEventListener('blur', function() {
                document.body.style.fontSize = '';
            });
        });
    }
    
    // iOS のホーム画面に追加された場合のフルスクリーン対応
    if (window.navigator.standalone) {
        document.body.classList.add('ios-standalone');
    }
}

// データのエクスポート/インポート機能
function exportData() {
    const data = {
        players: players,
        practices: practices,
        diary: diary,
        version: '1.0',
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'soccer-coach-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        
        if (data.players) {
            players = data.players;
        }
        
        if (data.practices) {
            practices = data.practices;
        }
        
        if (data.diary) {
            diary = data.diary;
        }
        
        saveData();
        
        // 画面を更新
        if (document.getElementById('players-section').classList.contains('hidden') === false) {
            renderPlayersList();
        } else if (document.getElementById('practice-section').classList.contains('hidden') === false) {
            renderPracticeList();
        } else if (document.getElementById('diary-section').classList.contains('hidden') === false) {
            renderDiary();
        }
        
        alert('データのインポートが完了しました');
    } catch (error) {
        console.error('データのインポートに失敗しました:', error);
        alert('データのインポートに失敗しました: ' + error.message);
    }
}

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', initApp); 